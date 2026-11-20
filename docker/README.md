# Local sharded cluster demo

This Compose environment runs only the MongoDB data layer:

- A `mongos` router and two shards.
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
   existing backend environment values.
3. Run the backend outside Docker from the `backend` directory with
   `npm start`.
4. Run the frontend outside Docker from the `frontend` directory with
   `npm run dev`. Set `VITE_API_URL=http://localhost:3000` in its environment.
5. Sign in as the static Analyst/Admin, open **Cluster monitor**, and enter
   `ADMIN_API_KEY`. The dashboard polls cluster health every 10 seconds.

The host backend connects to the `mongos` router at
`mongodb://127.0.0.1:27030`. The config and shard monitoring ports
(`27021`-`27023`) are loopback-only. Named volumes preserve data across
container restarts.

## Failure checks

- Stop one shard member, for example `docker compose stop mongo-shard-1a`.
  The remaining two voting members retain a majority, so that shard can keep
  accepting writes. Restart it with `docker compose start mongo-shard-1a`.

Do not stop two voting members in the same replica set: without a majority,
MongoDB correctly refuses writes rather than acknowledging data it cannot
replicate.

MongoDB replica sets use a single elected primary, so the cluster does not
accept conflicting writes from independent primaries. Elections and retryable
writes handle brief member failures; the admin monitor reports replica-set
health and the current primary rather than offering manual conflict decisions.
