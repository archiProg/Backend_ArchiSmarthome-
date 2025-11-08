const express = require("express");
const router = express.Router();
const { loginUserv3 } = require("../controllers/authController");

// POST /app/v3/login
router.post("/login", loginUserv3);

module.exports = router;