// otp generate hash verify, and uuid for ride id
const crypto = require("crypto");

function generateOTP(length) {
  if (length == null) length = 6;
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function verifyOTP(otp, hashedOtp) {
  return hashOTP(otp) === hashedOtp;
}

function generateUUID() {
  return crypto.randomUUID();
}

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  generateUUID,
};
