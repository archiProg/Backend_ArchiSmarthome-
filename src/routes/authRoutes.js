const express = require("express");
const router = express.Router();
const {  loginUser, registerUser } = require("../controllers/authController");

// POST /app/auth/login
router.post("/Login", loginUser);
router.post("/register", registerUser);

module.exports = router;