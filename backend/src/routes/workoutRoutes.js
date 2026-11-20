const express = require("express");
const router = express.Router();

const workoutController = require("../controllers/workoutController");
const { protect } = require("../middleware/auth");

router.post("/", protect, workoutController.createWorkout);

router.get(
    "/public/multi-city",
    workoutController.getPublicMultiCity
);

router.get(
    "/public/user/:userId/recent",
    workoutController.getPublicRecentWorkouts
);

router.get(
    "/user/:userId/recent",
    protect,
    workoutController.getRecentWorkouts
);

module.exports = router;
