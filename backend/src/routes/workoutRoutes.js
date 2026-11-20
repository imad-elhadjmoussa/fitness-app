const express = require("express");
const router = express.Router();

const workoutController = require("../controllers/workoutController");

// Insert workout log
router.post("/", workoutController.createWorkout);

// Retrieve last 20 activities for a user
router.get(
    "/user/:userId/recent",
    workoutController.getRecentWorkouts
);

// Find users with workouts in different cities
router.get(
    "/users-with-city-changes",
    workoutController.getUsersWithWorkoutsInDifferentCities
);

module.exports = router;