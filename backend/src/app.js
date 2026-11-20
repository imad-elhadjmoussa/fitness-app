const express = require("express");
const workoutRoutes = require("./routes/workoutRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api/workouts", workoutRoutes);
app.use("/api/users", userRoutes);

module.exports = app;