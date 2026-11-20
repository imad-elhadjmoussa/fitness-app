const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./src/app");
const connectDB = require("./src/config/db");
const WorkoutLog = require("./src/models/WorkoutLog");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();
    await WorkoutLog.createIndexes();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();