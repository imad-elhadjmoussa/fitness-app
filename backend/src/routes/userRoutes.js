const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Public registration
router.post("/", userController.createUser);

// Authenticated routes
// Authenticated users can list accounts (athletes filtered client-side for leaderboard)
router.get("/", protect, userController.getUsers);

router.get("/:userId", protect, userController.getUser);

router.patch("/:userId/profile", protect, userController.updateUserProfile);

module.exports = router;
