const mongoose = require("mongoose");

async function getReplicaSetStatus(uri, name) {
    let connection;
    try {
        connection = await mongoose
            .createConnection(uri, {
                serverSelectionTimeoutMS: 4000,
                connectTimeoutMS: 3000
            })
            .asPromise();

        const status = await connection.db.admin().command({
            replSetGetStatus: 1
        });
        const members = status.members.map((member) => ({
            name: member.name,
            state: member.stateStr,
            healthy: member.health === 1,
            ...(member.optimeDate
                ? { lastAppliedAt: member.optimeDate.toISOString() }
                : {})
        }));
        const healthyMembers = members.filter((member) => member.healthy).length;
        const majority = Math.floor(members.length / 2) + 1;
        const primary = members.find((member) => member.state === "PRIMARY");

        return {
            name,
            healthy: Boolean(primary) && healthyMembers >= majority,
            primary: primary?.name ?? null,
            healthyMembers,
            totalMembers: members.length,
            requiredForMajority: majority,
            members
        };
    } catch (error) {
        return {
            name,
            healthy: false,
            primary: null,
            healthyMembers: 0,
            totalMembers: 0,
            requiredForMajority: 0,
            members: [],
            error: error.message
        };
    } finally {
        if (connection) await connection.close();
    }
}

async function getApiNodeStatus(address) {
    try {
        const response = await fetch(`http://${address}/api/health`, {
            signal: AbortSignal.timeout(3000)
        });
        const health = await response.json();
        return {
            name: health.service || address,
            healthy: response.ok && health.database === "connected",
            uptimeSeconds: health.uptimeSeconds,
            error: response.ok ? undefined : health.message
        };
    } catch (error) {
        return {
            name: address,
            healthy: false,
            error: error.message
        };
    }
}

exports.getClusterStatus = async (_req, res) => {
    try {
        const admin = mongoose.connection.db.admin();
        const [serverStatus, shardStatus] = await Promise.all([
            admin.command({ serverStatus: 1 }),
            admin.command({ listShards: 1 })
        ]);
        const shardMonitorUris = JSON.parse(
            process.env.MONGODB_SHARD_MONITOR_URIS || "{}"
        );

        const replicaSets = [];
        const configUri = process.env.MONGODB_CONFIG_REPLICA_URI;
        if (configUri) {
            replicaSets.push(
                await getReplicaSetStatus(configUri, "configRS")
            );
        }

        for (const shard of shardStatus.shards) {
            const [replicaSet, hosts] = shard.host.split("/");
            if (!replicaSet || !hosts) {
                replicaSets.push({
                    name: shard._id,
                    healthy: false,
                    primary: null,
                    healthyMembers: 0,
                    totalMembers: 0,
                    requiredForMajority: 0,
                    members: [],
                    error: "Could not read shard replica-set address"
                });
                continue;
            }

            replicaSets.push(
                await getReplicaSetStatus(
                    shardMonitorUris[replicaSet] ||
                        `mongodb://${hosts}/admin?replicaSet=${encodeURIComponent(replicaSet)}`,
                    replicaSet
                )
            );
        }

        const apiAddresses = (process.env.API_PEERS || "")
            .split(",")
            .map((address) => address.trim())
            .filter(Boolean);
        const apiNodes = apiAddresses.length
            ? await Promise.all(apiAddresses.map(getApiNodeStatus))
            : [{
                name: process.env.SERVICE_INSTANCE || "local-backend",
                healthy: true,
                uptimeSeconds: Math.floor(process.uptime())
            }];
        const router = serverStatus.msg === "isdbgrid";
        const writeCommandsTotal =
            serverStatus.metrics?.commands?.insert?.total ??
            serverStatus.opcounters?.insert ??
            0;
        const mongoHealthy =
            router &&
            replicaSets.length > 0 &&
            replicaSets.every((replicaSet) => replicaSet.healthy);

        return res.status(200).json({
            success: true,
            data: {
                healthy: mongoHealthy && apiNodes.some((node) => node.healthy),
                router,
                mongoVersion: serverStatus.version,
                mongoUptimeSeconds: serverStatus.uptime,
                activeConnections: serverStatus.connections?.current ?? 0,
                insertCommandsTotal: writeCommandsTotal,
                shardCount: shardStatus.shards.length,
                writePolicy: "retryable writes acknowledged by majority",
                replicaSets,
                apiNodes
            }
        });
    } catch (error) {
        return res.status(503).json({
            success: false,
            message: "Could not retrieve cluster status",
            error: error.message
        });
    }
};
