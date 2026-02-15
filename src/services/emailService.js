// OTP and welcome emails sent via SendGrid API only (no SMTP).
// Interview: We use SendGrid's HTTP API so emails are reliable and no port/firewall issues.
const sgMail = require("@sendgrid/mail");

const FROM_NAME = "Smart Airport Ride Pooling";

function getFromEmail() {
  return process.env.SENDGRID_FROM_EMAIL || "noreply@example.com";
}

function isSendGridConfigured() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.error("SendGrid: Set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in .env");
    return false;
  }
  sgMail.setApiKey(key);
  return true;
}

async function sendWelcomeMail(email, name) {
  if (!isSendGridConfigured()) return false;
  try {
    await sgMail.send({
      to: email,
      from: { name: FROM_NAME, email: getFromEmail() },
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
    console.error("Welcome mail error (SendGrid):", err.message);
    if (err.response?.body) console.error("SendGrid response:", err.response.body);
    return false;
  }
}

async function sendOtpMail(email, otp, type) {
  if (!isSendGridConfigured()) return false;
  try {
    const subject =
      type === "signup"
        ? "Your Signup OTP - Smart Airport Ride Pooling"
        : "Your Login OTP - Smart Airport Ride Pooling";
    await sgMail.send({
      to: email,
      from: { name: FROM_NAME, email: getFromEmail() },
      subject,
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
    console.error("OTP mail error (SendGrid):", err.message);
    if (err.response?.body) console.error("SendGrid response:", JSON.stringify(err.response.body));
    return false;
  }
}

module.exports = {
  sendWelcomeMail,
  sendOtpMail,
};
