// find a trip that can fit this ride, or create new trip, or add ride to existing trip
const Ride = require("../models/Ride");
const Trip = require("../models/Trip");
const pricingService = require("../services/pricingService");
const cryptoUtils = require("../utils/crypto");
const constants = require("../config/constants");

async function findMatchingTrip(rideData) {
  const limits = constants.CAB_LIMITS[rideData.cab_type];
  const expiryTime = new Date(Date.now() - constants.TRIP_EXPIRY_MINUTES * 60 * 1000);

  const openTrips = await Trip.find({
    status: constants.TRIP_STATUS.WAITING,
    cab_type: rideData.cab_type,
    createdAt: { $gt: expiryTime },
  })
    .sort({ createdAt: 1 })
    .lean();

  for (let i = 0; i < openTrips.length; i++) {
    const trip = openTrips[i];
    const rides = await Ride.find({ ride_id: { $in: trip.ride_ids } }).lean();
    let totalPassengers = 0;
    let totalLuggage = 0;
    for (let j = 0; j < rides.length; j++) {
      totalPassengers = totalPassengers + rides[j].passenger_count;
      totalLuggage = totalLuggage + rides[j].luggage_count;
    }

    const newPassengers = totalPassengers + rideData.passenger_count;
    const newLuggage = totalLuggage + rideData.luggage_count;

    if (newPassengers <= limits.maxPassengers && newLuggage <= limits.maxLuggage) {
      return trip;
    }
  }
  return null;
}

async function createNewTrip(rideData) {
  const trip_id = cryptoUtils.generateUUID();
  const trip = await Trip.create({
    trip_id,
    ride_ids: [],
    cab_type: rideData.cab_type,
    total_passengers: 0,
    total_luggage: 0,
    status: constants.TRIP_STATUS.WAITING,
  });
  return trip;
}

async function addRideToTrip(ride, trip) {
  const rides = await Ride.find({ ride_id: { $in: trip.ride_ids } }).lean();
  const allRides = [...rides, ride];
  const passengerCount = allRides.length;
  const totalDistanceKm = 25;
  const fare = pricingService.calculateFare(totalDistanceKm, passengerCount);

  await Trip.updateOne(
    { trip_id: trip.trip_id },
    {
      $push: { ride_ids: ride.ride_id },
      $inc: {
        total_passengers: ride.passenger_count,
        total_luggage: ride.luggage_count,
      },
      $set: {
        status: constants.TRIP_STATUS.MATCHED,
        total_distance_km: totalDistanceKm,
      },
    }
  );

  await Ride.updateOne(
    { ride_id: ride.ride_id },
    { $set: { status: constants.RIDE_STATUS.MATCHED, fare, trip_id: trip.trip_id } }
  );

  return fare;
}

async function expireOldTrips() {
  const expiryTime = new Date(Date.now() - constants.TRIP_EXPIRY_MINUTES * 60 * 1000);
  await Trip.updateMany(
    { status: constants.TRIP_STATUS.WAITING, createdAt: { $lt: expiryTime } },
    { $set: { status: constants.TRIP_STATUS.EXPIRED } }
  );
}

module.exports = {
  findMatchingTrip,
  createNewTrip,
  addRideToTrip,
  expireOldTrips,
};
