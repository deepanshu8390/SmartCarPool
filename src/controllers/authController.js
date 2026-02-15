// auth related functions - signup, login, verify otp, google login
const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const cryptoUtils = require("../utils/crypto");
const emailService = require("../services/emailService");
const response = require("../utils/response");
const constants = require("../config/constants");
const googleService = require("../services/googleAuthService");

// step 1 signup - user gives name email phone, we send otp on email
const signupOtp = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;

    // check if this email or phone already used
    const userFound = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
    if (userFound) {
      return response.error(res, "Email or phone already registered", 409);
    }

    const otpCode = cryptoUtils.generateOTP(6);
    const hashedOtp = cryptoUtils.hashOTP(otpCode);

    // delete old signup otp for this phone if any
    await Otp.deleteMany({ phone: phone, type: "signup" });
    await Otp.create({
      phone: phone,
      email: email,
      name: name,
      otpHash: hashedOtp,
      type: "signup",
      expiresAt: new Date(Date.now() + constants.OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    const emailSent = await emailService.sendOtpMail(email, otpCode, "signup");
    if (!emailSent) {
      return response.error(res, "Failed to send OTP email. Check SMTP config or try again.", 500);
    }
    return response.success(res, { message: "OTP sent to your email" }, 200);
  } catch (err) {
    return response.error(res, err.message || "Failed to send OTP", 500);
  }
};

// step 1 login - user gives phone, we send otp on his email
const loginOtp = async (req, res) => {
  try {
    const phone = req.body.phone;
    const user = await User.findOne({ phone: phone });
    if (!user) {
      return response.error(res, "User not found. Please signup first.", 404);
    }
    if (!user.email) {
      return response.error(res, "No email. Use Google login.", 400);
    }

    const otpCode = cryptoUtils.generateOTP(6);
    const hashedOtp = cryptoUtils.hashOTP(otpCode);
    await Otp.deleteMany({ phone: phone, type: "login" });
    await Otp.create({
      phone: phone,
      email: user.email,
      otpHash: hashedOtp,
      type: "login",
      expiresAt: new Date(Date.now() + constants.OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    const emailSent = await emailService.sendOtpMail(user.email, otpCode, "login");
    if (!emailSent) {
      return response.error(res, "Failed to send OTP email. Check SMTP config or try again.", 500);
    }
    return response.success(res, { message: "OTP sent to your email" }, 200);
  } catch (err) {
    return response.error(res, err.message || "Failed to send OTP", 500);
  }
};

// step 2 - user enters otp, we verify and give token
const verifyOtp = async (req, res) => {
  try {
    const phone = req.body.phone;
    const otp = req.body.otp;
    const type = req.body.type;

    const otpRow = await Otp.findOne({ phone: phone, type: type }).sort({ createdAt: -1 });
    if (!otpRow) {
      return response.error(res, "OTP not found or expired", 400);
    }
    if (new Date() > otpRow.expiresAt) {
      await Otp.deleteOne({ _id: otpRow._id });
      return response.error(res, "OTP expired", 400);
    }
    if (!cryptoUtils.verifyOTP(otp, otpRow.otpHash)) {
      return response.error(res, "Invalid OTP", 400);
    }

    await Otp.deleteOne({ _id: otpRow._id });

    if (type === "signup") {
      const newUser = await User.create({
        name: otpRow.name || "User",
        email: otpRow.email,
        phone: otpRow.phone,
        role: "passenger",
        lastLoginAt: new Date(),
      });
      await emailService.sendWelcomeMail(newUser.email, newUser.name);
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );
      return response.created(res, {
        user: { id: newUser._id, name: newUser.name, email: newUser.email, phone: newUser.phone },
        token: token,
        message: "You are now part of our journey",
      });
    }

    if (type === "login") {
      const user = await User.findOne({ phone: phone });
      if (!user) return response.error(res, "User not found", 404);
      user.lastLoginAt = new Date();
      await user.save();
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );
      return response.success(res, {
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
        token: token,
      });
    }
  } catch (err) {
    return response.error(res, err.message || "Failed to verify OTP", 500);
  }
};

// Google login - frontend sends idToken from Google, we create/find user and return our token
const googleLogin = async (req, res) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return response.error(res, "idToken is required", 400);
    }
    const profile = await googleService.verifyGoogleToken(idToken);
    const result = await googleService.findOrCreateGoogleUser(profile);
    const token = googleService.generateToken(result.user);
    if (result.isNew) {
      await emailService.sendWelcomeMail(result.user.email, result.user.name);
    }
    return response.success(res, {
      user: {
        id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
      },
      token: token,
      message: result.isNew ? "You are now part of our journey" : undefined,
    });
  } catch (err) {
    return response.error(res, err.message || "Google login failed", 401);
  }
};

module.exports = {
  signupOtp,
  loginOtp,
  verifyOtp,
  googleLogin,
};
