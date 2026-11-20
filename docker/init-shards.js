const configuredShards = [
  {
    name: "shard1RS",
    connection:
      "shard1RS/mongo-shard-1a:27017,mongo-shard-1b:27017,mongo-shard-1c:27017",
  },
  {
    name: "shard2RS",
    connection:
      "shard2RS/mongo-shard-2a:27017,mongo-shard-2b:27017,mongo-shard-2c:27017",
  },
];

const existingShards = db.adminCommand({ listShards: 1 }).shards || [];
for (const shard of configuredShards) {
  if (!existingShards.some((existing) => existing._id === shard.name)) {
    sh.addShard(shard.connection);
  }
}

sh.enableSharding("fitpulse");
const configDb = db.getSiblingDB("config");
if (!configDb.collections.findOne({ _id: "fitpulse.workoutlogs" })) {
  sh.shardCollection("fitpulse.workoutlogs", { userId: "hashed" });
}
