const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validate } = require("../middlewares/validate");
const { signupSchema, loginSchema, verifyOtpSchema } = require("../validators/authValidator");

// signup - send OTP to email
router.post("/signup", validate(signupSchema), authController.signupOtp);
// login - send OTP to email
router.post("/login", validate(loginSchema), authController.loginOtp);
// verify the OTP and get token
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
// Google login - send idToken from Google, get token back (no OTP)
router.post("/google", authController.googleLogin);

module.exports = router;
