const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Create new user
router.post("/", userController.createUser);

// Update user profile
router.patch("/:userId/profile", userController.updateUserProfile);



module.exports = router;