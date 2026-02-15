// send welcome email and OTP email using nodemailer
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendWelcomeMail(email, name) {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env.SMTP_USER || "noreply@ridepooling.com",
      to: email,
      subject: "Welcome! You are now part of our journey",
      html: `
        <h2>Hello ${name},</h2>
        <p>Welcome to Smart Airport Ride Pooling!</p>
        <p><strong>You are now part of our journey.</strong></p>
        <p>Share rides, save money, and travel smarter.</p>
        <br/>
        <p>Happy travels!</p>
        <p>Team Ride Pooling</p>
      `,
      text: `Hello ${name}, Welcome to Smart Airport Ride Pooling! You are now part of our journey. Share rides, save money, and travel smarter. Happy travels! - Team Ride Pooling`,
    });
    return true;
  } catch (err) {
    console.error("Welcome mail error:", err.message);
    return false;
  }
}

async function sendOtpMail(email, otp, type) {
  try {
    const transport = getTransporter();
    let subject = "Your Login OTP - Smart Airport Ride Pooling";
    if (type === "signup") subject = "Your Signup OTP - Smart Airport Ride Pooling";
    await transport.sendMail({
      from: process.env.SMTP_USER || "noreply@ridepooling.com",
      to: email,
      subject: subject,
      html: `
        <h2>Your OTP</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>Valid for 10 minutes. Do not share with anyone.</p>
        <br/>
        <p>Team Ride Pooling</p>
      `,
      text: `Your OTP is ${otp}. Valid for 10 minutes. Do not share with anyone. - Team Ride Pooling`,
    });
    return true;
  } catch (err) {
    console.error("OTP mail error:", err.message);
    return false;
  }
}

module.exports = {
  sendWelcomeMail,
  sendOtpMail,
};
