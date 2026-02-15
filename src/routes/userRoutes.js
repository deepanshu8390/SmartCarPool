const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getPastTrips } = require("../controllers/userController");
const { auth } = require("../middlewares/auth");

router.get("/profile", auth, getProfile);
router.patch("/profile", auth, updateProfile);
router.get("/trips", auth, getPastTrips);

module.exports = router;
