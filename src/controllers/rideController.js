// book ride, get one ride, cancel ride
const Ride = require("../models/Ride");
const Trip = require("../models/Trip");
const matchingService = require("../services/matchingService");
const cryptoUtils = require("../utils/crypto");
const response = require("../utils/response");
const constants = require("../config/constants");

const bookRide = async (req, res) => {
  try {
    await matchingService.expireOldTrips();

    const pickup_lat = req.body.pickup_lat;
    const pickup_lng = req.body.pickup_lng;
    const drop_lat = req.body.drop_lat;
    const drop_lng = req.body.drop_lng;
    const pickup_address = req.body.pickup_address;
    const drop_address = req.body.drop_address;
    const passenger_count = req.body.passenger_count;
    const luggage_count = req.body.luggage_count;
    let max_detour_km = req.body.max_detour_km != null ? req.body.max_detour_km : 5;
    const cab_type = req.body.cab_type;

    const ride_id = cryptoUtils.generateUUID();

    const rideData = {
      ride_id,
      user_id: req.user._id,
      pickup_lat,
      pickup_lng,
      drop_lat,
      drop_lng,
      passenger_count,
      luggage_count,
      max_detour_km,
      cab_type,
    };

    const existingRide = await Ride.findOne({
      user_id: req.user._id,
      status: { $in: [constants.RIDE_STATUS.PENDING, constants.RIDE_STATUS.WAITING] },
    });
    if (existingRide) {
      return response.error(res, "You already have a pending ride", 409);
    }

    let trip = await matchingService.findMatchingTrip(rideData);

    if (!trip) {
      trip = await matchingService.createNewTrip(rideData);
      const ride = await Ride.create({
        ride_id,
        trip_id: trip.trip_id,
        user_id: req.user._id,
        pickup: { lat: pickup_lat, lng: pickup_lng, address: pickup_address },
        drop: { lat: drop_lat, lng: drop_lng, address: drop_address },
        passenger_count,
        luggage_count,
        max_detour_km,
        cab_type,
        status: constants.RIDE_STATUS.WAITING,
      });

      await Trip.updateOne(
        { trip_id: trip.trip_id },
        {
          $push: { ride_ids: ride_id },
          $inc: { total_passengers: passenger_count, total_luggage: luggage_count },
        }
      );

      return response.created(res, {
        ride_id: ride.ride_id,
        trip_id: trip.trip_id,
        status: constants.RIDE_STATUS.WAITING,
        message: "Waiting for more passengers",
      });
    }

    const ride = await Ride.create({
      ride_id,
      user_id: req.user._id,
      pickup: { lat: pickup_lat, lng: pickup_lng, address: pickup_address },
      drop: { lat: drop_lat, lng: drop_lng, address: drop_address },
      passenger_count,
      luggage_count,
      max_detour_km,
      cab_type,
      status: constants.RIDE_STATUS.PENDING,
    });

    const fare = await matchingService.addRideToTrip(ride, trip);

    return response.created(res, {
      ride_id: ride.ride_id,
      trip_id: trip.trip_id,
      status: constants.RIDE_STATUS.MATCHED,
      fare,
      message: "Matched with other passengers",
    });
  } catch (err) {
    return response.error(res, err.message || "Failed to book ride", 500);
  }
};

const getRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      ride_id: req.params.id,
      user_id: req.user._id,
    }).lean();
    if (!ride) return response.notFound(res, "Ride not found");
    return response.success(res, ride);
  } catch (err) {
    return response.error(res, err.message || "Failed to get ride", 500);
  }
};

const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      ride_id: req.params.id,
      user_id: req.user._id,
    });
    if (!ride) return response.notFound(res, "Ride not found");
    if (ride.status === constants.RIDE_STATUS.CANCELLED) {
      return response.error(res, "Ride already cancelled", 400);
    }

    await Ride.updateOne(
      { ride_id: ride.ride_id },
      { $set: { status: constants.RIDE_STATUS.CANCELLED } }
    );

    if (ride.trip_id) {
      const trip = await Trip.findOne({ trip_id: ride.trip_id });
      if (trip) {
        const newRideIds = trip.ride_ids.filter((id) => id !== ride.ride_id);
        const newStatus =
          newRideIds.length === 0 ? constants.TRIP_STATUS.CANCELLED : constants.TRIP_STATUS.WAITING;
        await Trip.updateOne(
          { trip_id: ride.trip_id },
          {
            $set: {
              ride_ids: newRideIds,
              status: newStatus,
              total_passengers: trip.total_passengers - ride.passenger_count,
              total_luggage: trip.total_luggage - ride.luggage_count,
            },
          }
        );
      }
    }

    return response.success(res, { message: "Ride cancelled successfully" });
  } catch (err) {
    return response.error(res, err.message || "Failed to cancel ride", 500);
  }
};

module.exports = {
  bookRide,
  getRide,
  cancelRide,
};
