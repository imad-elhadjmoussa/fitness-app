const express = require("express");
const adminController = require("../controllers/adminController");
const requireAdminKey = require("../middleware/adminKey");

const router = express.Router();

router.get("/cluster", requireAdminKey, adminController.getClusterStatus);

module.exports = router;
