// cab capacity and status strings
const CAB_LIMITS = {
  "5-seater": { maxPassengers: 4, maxLuggage: 5 },
  "7-seater": { maxPassengers: 6, maxLuggage: 7 },
};

const RIDE_STATUS = {
  PENDING: "PENDING",
  MATCHED: "MATCHED",
  WAITING: "WAITING",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

const TRIP_STATUS = {
  WAITING: "WAITING",
  MATCHED: "MATCHED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
};

const TRIP_EXPIRY_MINUTES = 30;
const OTP_EXPIRY_MINUTES = 10;

module.exports = {
  CAB_LIMITS,
  RIDE_STATUS,
  TRIP_STATUS,
  TRIP_EXPIRY_MINUTES,
  OTP_EXPIRY_MINUTES,
};
