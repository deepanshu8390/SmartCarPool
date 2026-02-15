// get single trip details with all rides in it
const Trip = require("../models/Trip");
const Ride = require("../models/Ride");
const response = require("../utils/response");

const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ trip_id: req.params.id }).lean();
    if (!trip) return response.notFound(res, "Trip not found");

    const rides = await Ride.find({ ride_id: { $in: trip.ride_ids } })
      .select("user_id ride_id pickup drop status fare passenger_count luggage_count")
      .lean();

    return response.success(res, {
      ...trip,
      rides,
    });
  } catch (err) {
    return response.error(res, err.message || "Failed to get trip", 500);
  }
};

module.exports = {
  getTrip,
};
