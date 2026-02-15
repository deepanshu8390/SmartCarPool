const express = require("express");
const router = express.Router();
const { getTrip } = require("../controllers/tripController");
const { auth } = require("../middlewares/auth");

router.get("/trips/:id", auth, getTrip);

module.exports = router;
