const express = require("express");
const cors = require("cors");
const workoutRoutes = require("./routes/workoutRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
    cors({
        origin: true,
        credentials: true
    })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "FitPulse API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/users", userRoutes);

module.exports = app;
