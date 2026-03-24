const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Rental Management API is running" });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/units", require("./routes/unitRoutes"));
app.use("/api/tenants", require("./routes/tenantRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/leases", require("./routes/leaseRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
