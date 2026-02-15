// main app - routes and middleware
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../env") });
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/rideRoutes");
const tripRoutes = require("./routes/tripRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
// CORS: allow all origins and URLs (origin: true = reflect request origin)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests" },
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    db: "connected",
    uptime: process.uptime(),
  });
});

app.use(authRoutes);
app.use(userRoutes);
app.use(rideRoutes);
app.use(tripRoutes);

app.use(errorHandler);

const startServer = async function () {
  await connectDB();
  const PORT = process.env.PORT || 6313;
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

module.exports = app;
module.exports.startServer = startServer;
