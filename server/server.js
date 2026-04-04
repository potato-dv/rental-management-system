const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0) {
      if (!isProduction) {
        return callback(null, true);
      }
      const error = new Error("Not allowed by CORS");
      error.status = 403;
      return callback(error);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error("Not allowed by CORS");
    error.status = 403;
    return callback(error);
  },
  optionsSuccessStatus: 204,
};

const rateLimitWindowMs = parsePositiveInt(
  process.env.RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000,
);
const rateLimitMax = parsePositiveInt(process.env.RATE_LIMIT_MAX, 1000);
const authRateLimitMax = parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20);
const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || "1mb";

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: requestBodyLimit }));
app.use(mongoSanitize());
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Rental Management API is running" });
});

// Routes
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/units", require("./routes/unitRoutes"));
app.use("/api/tenants", require("./routes/tenantRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/leases", require("./routes/leaseRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Global error handler
app.use((err, req, res, next) => {
  if (isProduction) {
    console.error(err.message);
  } else {
    console.error(err.stack);
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message:
      status >= 500 && isProduction
        ? "Internal Server Error"
        : err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
