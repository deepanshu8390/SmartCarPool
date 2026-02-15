// Google login - verify idToken and find or create user
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// check if idToken from frontend is valid and get email, name from Google
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (err) {
    throw new Error("Invalid Google token");
  }
}

// if user already has this googleId or same email, return that user. else create new user
async function findOrCreateGoogleUser(profile) {
  let user = await User.findOne({ googleId: profile.googleId });
  if (user) {
    user.lastLoginAt = new Date();
    await user.save();
    return { user: user, isNew: false };
  }
  user = await User.findOne({ email: profile.email });
  if (user) {
    user.googleId = profile.googleId;
    user.lastLoginAt = new Date();
    await user.save();
    return { user: user, isNew: false };
  }
  user = await User.create({
    name: profile.name,
    email: profile.email,
    googleId: profile.googleId,
    role: "passenger",
    lastLoginAt: new Date(),
  });
  return { user: user, isNew: true };
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = {
  verifyGoogleToken,
  findOrCreateGoogleUser,
  generateToken,
};
