const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    ride_id: { type: String, required: true, unique: true },
    trip_id: { type: String },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pickup: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    drop: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String },
    },
    passenger_count: { type: Number, required: true },
    luggage_count: { type: Number, required: true },
    max_detour_km: { type: Number, required: true },
    cab_type: { type: String, enum: ["5-seater", "7-seater"], required: true },
    status: {
      type: String,
      enum: ["PENDING", "MATCHED", "WAITING", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
    fare: { type: Number },
  },
  { timestamps: true }
);

rideSchema.index({ trip_id: 1 });
rideSchema.index({ user_id: 1 });
rideSchema.index({ status: 1 });

module.exports = mongoose.model("Ride", rideSchema);
