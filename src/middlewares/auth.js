// check if user sent valid token and set req.user
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const response = require("../utils/response");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : "";
    if (!token) {
      return response.unauthorized(res, "Access denied. No token provided.");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return response.unauthorized(res, "User not found.");
    }
    if (user.isBlocked) {
      return response.forbidden(res, "Account is blocked.");
    }
    req.user = user;
    next();
  } catch (err) {
    return response.unauthorized(res, "Invalid or expired token.");
  }
};

module.exports = { auth };
