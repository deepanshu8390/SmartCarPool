// zod schema for book ride - pickup drop coords, passengers, cab type etc
const { z } = require("zod");
const constants = require("../config/constants");

const rideSchema = z
  .object({
    pickup_lat: z.number().min(-90).max(90),
    pickup_lng: z.number().min(-180).max(180),
    drop_lat: z.number().min(-90).max(90),
    drop_lng: z.number().min(-180).max(180),
    pickup_address: z.string().max(255).optional(),
    drop_address: z.string().max(255).optional(),
    passenger_count: z.number().int().min(1),
    luggage_count: z.number().int().min(0),
    max_detour_km: z.number().min(0).max(50),
    cab_type: z.enum(["5-seater", "7-seater"]),
  })
  .refine((data) => !(data.pickup_lat === data.drop_lat && data.pickup_lng === data.drop_lng), {
    message: "Pickup and drop cannot be the same",
    path: ["drop_lat"],
  })
  .refine(
    (data) => {
      const limits = constants.CAB_LIMITS[data.cab_type];
      return (
        data.passenger_count <= limits.maxPassengers &&
        data.luggage_count <= limits.maxLuggage
      );
    },
    { message: "Passenger or luggage exceeds cab capacity", path: ["passenger_count"] }
  );

module.exports = { rideSchema };
