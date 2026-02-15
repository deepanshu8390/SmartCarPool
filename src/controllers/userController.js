// get profile, update profile, get past trips list
const User = require("../models/User");
const Ride = require("../models/Ride");
const response = require("../utils/response");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("name email phone role lastLoginAt createdAt")
      .lean();
    if (!user) return response.notFound(res, "User not found");
    return response.success(res, user);
  } catch (err) {
    return response.error(res, err.message || "Failed to get profile", 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    )
      .select("name email phone role")
      .lean();
    if (!user) return response.notFound(res, "User not found");
    return response.success(res, user);
  } catch (err) {
    return response.error(res, err.message || "Failed to update profile", 500);
  }
};

const getPastTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const rides = await Ride.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Ride.countDocuments({ user_id: req.user._id });

    return response.success(res, {
      data: rides,
      page,
      limit,
      total,
    });
  } catch (err) {
    return response.error(res, err.message || "Failed to get past trips", 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPastTrips,
};
