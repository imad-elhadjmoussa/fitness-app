const express = require("express");
const cors = require("cors");
const workoutRoutes = require("./routes/workoutRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const os = require("node:os");
const mongoose = require("mongoose");

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", async (_req, res) => {
    try {
        await mongoose.connection.db.admin().command({ ping: 1 });
        return res.json({
            success: true,
            message: "FitPulse API is running",
            service: process.env.SERVICE_INSTANCE || os.hostname(),
            database: "connected",
            uptimeSeconds: Math.floor(process.uptime())
        });
    } catch (error) {
        return res.status(503).json({
            success: false,
            message: "Database unavailable",
            service: process.env.SERVICE_INSTANCE || os.hostname(),
            database: "disconnected",
            error: error.message
        });
    }
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
