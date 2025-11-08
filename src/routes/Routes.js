const express = require("express");
const router = express.Router();
const { loginUserv2 } = require("../controllers/authController");
const { getRoleUser } = require("../controllers/userController");
const { UpdateStatusAccount } = require("../controllers/userController");
const { getTime } = require("../controllers/qrController");
const {
  sendEmail,
  checkTokenNewPassword,
  setNewPassword
} = require("../controllers/ResetPasswordController");
const { authenticate,authorizePlatformRole } = require("../middleware/authenticate");

const path = require("path");

// POST /app/login
router.post("/login", loginUserv2);
router.post("/getroleinformation",authenticate, getRoleUser);
router.post("/devices",authenticate, UpdateStatusAccount);
router.post("/gettime",authenticate, getTime);
router.post("/mail", sendEmail);
router.get("/checktokennewpassword", checkTokenNewPassword);
router.post("/setnewpassword", setNewPassword);


router.get("/login/forgot", (req, res) => {
  return res.sendFile(
    path.join(__dirname, "..", "public", "ResetPassword.html")
  );
});
router.get("/register", (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "Register.html"));
});
router.get("/registercomp.html", (req, res) => {
  return res.sendFile(
    path.join(__dirname, "..", "public", "registercomp.html")
  );
});

module.exports = router;
