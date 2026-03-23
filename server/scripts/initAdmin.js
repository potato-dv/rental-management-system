const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const connectDB = require("../config/db");

// Load env variables
dotenv.config();

const initializeAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      console.log("Admin user already exists:", adminExists.email);
      process.exit(0);
    }

    // Get admin credentials from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || "admin@rental.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminName = process.env.ADMIN_NAME || "Admin";

    // Create admin user
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      contactNumber: "0000000000",
      address: "Admin Office",
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error initializing admin:", error.message);
    process.exit(1);
  }
};

initializeAdmin();
