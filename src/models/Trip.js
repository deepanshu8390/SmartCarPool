const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    trip_id: { type: String, required: true, unique: true },
    ride_ids: [{ type: String }],
    cab_type: { type: String, enum: ["5-seater", "7-seater"], required: true },
    total_passengers: { type: Number, default: 0 },
    total_luggage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["WAITING", "MATCHED", "IN_PROGRESS", "COMPLETED", "EXPIRED", "CANCELLED"],
      default: "WAITING",
    },
    total_distance_km: { type: Number },
  },
  { timestamps: true }
);

tripSchema.index({ trip_id: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Trip", tripSchema);
