function waitForPrimary(name, hosts) {
  const set = new Mongo(
    `mongodb://${hosts.join(",")}/admin?replicaSet=${name}`
  );
  const admin = set.getDB("admin");
  const deadline = Date.now() + 120000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const hello = admin.runCommand({ hello: 1 });
      if (hello.isWritablePrimary) return;
    } catch (error) {
      lastError = error;
    }
    sleep(1000);
  }

  throw new Error(
    `Timed out waiting for ${name} to elect a primary${lastError ? `: ${lastError.message}` : ""}`
  );
}

function initializeSet(name, hosts, configServer = false) {
  const primary = new Mongo(
    `mongodb://${hosts[0]}/admin?directConnection=true`
  );
  const admin = primary.getDB("admin");
  let currentConfig;
  try {
    currentConfig = admin.runCommand({ replSetGetConfig: 1 }).config;
  } catch (error) {
    if (error.code !== 94 && error.codeName !== "NotYetInitialized") {
      throw error;
    }
  }

  const config = {
    _id: name,
    members: hosts.map((host, index) => ({ _id: index, host })),
    ...(configServer ? { configsvr: true } : {}),
  };

  if (!currentConfig) {
    const result = admin.runCommand({
      replSetInitiate: 1,
      config,
    });
    if (!result.ok) throw new Error(`Could not initialize ${name}: ${result.errmsg}`);
  } else {
    if (currentConfig._id !== name) {
      throw new Error(`Expected ${name}, found ${currentConfig._id}`);
    }

    const currentMembers = currentConfig.members.map((member) => member.host);
    if (
      currentMembers.length !== hosts.length ||
      hosts.some((host) => !currentMembers.includes(host))
    ) {
      config.version = currentConfig.version + 1;
      const replicaSet = new Mongo(
        `mongodb://${hosts.join(",")}/admin?replicaSet=${name}`
      );
      const result = replicaSet.getDB("admin").runCommand({
        replSetReconfig: config,
      });
      if (!result.ok) {
        throw new Error(`Could not update ${name} members: ${result.errmsg}`);
      }
    }
  }

  waitForPrimary(name, hosts);
}

initializeSet(
  "cfgRS",
  ["mongo-config-1:27017", "mongo-config-2:27017", "mongo-config-3:27017"],
  true
);
initializeSet(
  "shard1RS",
  ["mongo-shard-1a:27017", "mongo-shard-1b:27017", "mongo-shard-1c:27017"]
);
initializeSet(
  "shard2RS",
  ["mongo-shard-2a:27017", "mongo-shard-2b:27017", "mongo-shard-2c:27017"]
);
