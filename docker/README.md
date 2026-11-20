# Local sharded cluster demo

This Compose environment runs only the MongoDB data layer:

- Two `mongos` routers and two shards.
- Three-member replica sets for each shard and the config servers.
- Hashed `userId` sharding for workout writes.
- Retryable MongoDB writes with majority acknowledgement.

This is a local development/demo topology, not production high availability:
all database containers run on one Docker host and MongoDB authentication is
disabled. The router and three monitoring seed members are published only on
loopback. The backend and frontend run separately on the host.

## Start

1. Start the database cluster from the repository root:

   ```sh
   docker compose up -d --remove-orphans
   ```

   `--remove-orphans` removes old backend/frontend containers from the previous
   all-in-one Compose setup, if present.

2. Merge the variables in `backend/env.cluster.example` into `backend/.env`.
   Set unique random values for `ADMIN_API_KEY` and `JWT_SECRET`; keep any
   existing backend environment values. Keep both router addresses in
   `MONGODB_URI` so the driver can use the second router if one fails.
3. Run the backend outside Docker from the `backend` directory with
   `npm start`.
4. Run the frontend outside Docker from the `frontend` directory with
   `npm run dev`. Set `VITE_API_URL=http://localhost:3000` in its environment.
5. Sign in as the static Analyst/Admin, open **Cluster monitor**, and enter
   `ADMIN_API_KEY`. The dashboard polls cluster health every 10 seconds.

The host backend connects through routers at `127.0.0.1:27030` and
`127.0.0.1:27031`. The config and shard monitoring ports (`27021`-`27023`)
are loopback-only. Named volumes preserve data across container restarts.
Workout writes are routed by hashed `userId`; the backend requires majority
acknowledgement and retries transient replica-set elections. The multi-city
report uses a partial covering index and returns `Server-Timing` for its
server-side duration. The backend builds its required indexes before listening;
the first start may wait for index creation on an existing data set.
The backend is stateless and can run as multiple host processes behind a load
balancer, all using the same two-router URI and JWT secret. Hashed `userId`
sharding distributes writes across users; one user's writes remain on one shard.

## Failure checks

- Stop one shard member, for example `docker compose stop mongo-shard-1a`.
  The remaining two voting members retain a majority, so that shard can keep
  accepting writes. Restart it with `docker compose start mongo-shard-1a`.
- Stop one router with `docker compose stop mongos`; the driver can use the
  second router. Restart it with `docker compose start mongos`.

Do not stop two voting members in the same replica set: without a majority,
MongoDB correctly refuses writes rather than acknowledging data it cannot
replicate.

MongoDB replica sets use a single elected primary, so the cluster does not
accept conflicting writes from independent primaries. Elections, retryable
writes, and bounded backend retries handle brief member failures; the admin
monitor reports replica-set health and the current primary rather than offering
manual conflict decisions. This local Compose deployment still runs on one
Docker host and cannot survive a host failure.
