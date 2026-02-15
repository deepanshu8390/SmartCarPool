const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, sparse: true },
    googleId: { type: String, sparse: true },
    role: { type: String, default: "passenger", enum: ["passenger"] },
    lastLoginAt: { type: Date },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 });

module.exports = mongoose.model("User", userSchema);
