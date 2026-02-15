const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    phone: { type: String, required: true },
    otpHash: { type: String, required: true },
    type: { type: String, enum: ["signup", "login"], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpSchema.index({ phone: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
