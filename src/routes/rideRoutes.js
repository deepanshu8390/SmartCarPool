const express = require("express");
const router = express.Router();
const { bookRide, getRide, cancelRide } = require("../controllers/rideController");
const { auth } = require("../middlewares/auth");
const { validate } = require("../middlewares/validate");
const { rideSchema } = require("../validators/rideValidator");

router.post("/rides", auth, validate(rideSchema), bookRide);
router.get("/rides/:id", auth, getRide);
router.post("/rides/:id/cancel", auth, cancelRide);

module.exports = router;
