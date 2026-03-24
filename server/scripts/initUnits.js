const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Unit = require("../models/Unit");
const connectDB = require("../config/db");

// Load env variables
dotenv.config();

// Define your fixed units structure based on actual building layout
// 5 floors, 5 units per floor (25 total units)
const fixedUnits = [
  // Floor 1
  {
    unitNumber: "101",
    type: "studio",
    price: 15000,
    floor: "1",
    description: "Studio unit on floor 1",
  },
  {
    unitNumber: "102",
    type: "one-bedroom",
    price: 20000,
    floor: "1",
    description: "One bedroom unit on floor 1",
  },
  {
    unitNumber: "103",
    type: "one-bedroom",
    price: 20000,
    floor: "1",
    description: "One bedroom unit on floor 1",
  },
  {
    unitNumber: "104",
    type: "two-bedroom",
    price: 28000,
    floor: "1",
    description: "Two bedroom unit on floor 1",
  },
  {
    unitNumber: "105",
    type: "three-bedroom",
    price: 35000,
    floor: "1",
    description: "Three bedroom unit on floor 1",
  },

  // Floor 2
  {
    unitNumber: "201",
    type: "studio",
    price: 15000,
    floor: "2",
    description: "Studio unit on floor 2",
  },
  {
    unitNumber: "202",
    type: "one-bedroom",
    price: 20000,
    floor: "2",
    description: "One bedroom unit on floor 2",
  },
  {
    unitNumber: "203",
    type: "one-bedroom",
    price: 20000,
    floor: "2",
    description: "One bedroom unit on floor 2",
  },
  {
    unitNumber: "204",
    type: "two-bedroom",
    price: 28000,
    floor: "2",
    description: "Two bedroom unit on floor 2",
  },
  {
    unitNumber: "205",
    type: "three-bedroom",
    price: 35000,
    floor: "2",
    description: "Three bedroom unit on floor 2",
  },

  // Floor 3
  {
    unitNumber: "301",
    type: "studio",
    price: 15000,
    floor: "3",
    description: "Studio unit on floor 3",
  },
  {
    unitNumber: "302",
    type: "one-bedroom",
    price: 20000,
    floor: "3",
    description: "One bedroom unit on floor 3",
  },
  {
    unitNumber: "303",
    type: "one-bedroom",
    price: 20000,
    floor: "3",
    description: "One bedroom unit on floor 3",
  },
  {
    unitNumber: "304",
    type: "two-bedroom",
    price: 28000,
    floor: "3",
    description: "Two bedroom unit on floor 3",
  },
  {
    unitNumber: "305",
    type: "three-bedroom",
    price: 35000,
    floor: "3",
    description: "Three bedroom unit on floor 3",
  },

  // Floor 4
  {
    unitNumber: "401",
    type: "studio",
    price: 15000,
    floor: "4",
    description: "Studio unit on floor 4",
  },
  {
    unitNumber: "402",
    type: "one-bedroom",
    price: 20000,
    floor: "4",
    description: "One bedroom unit on floor 4",
  },
  {
    unitNumber: "403",
    type: "one-bedroom",
    price: 20000,
    floor: "4",
    description: "One bedroom unit on floor 4",
  },
  {
    unitNumber: "404",
    type: "two-bedroom",
    price: 28000,
    floor: "4",
    description: "Two bedroom unit on floor 4",
  },
  {
    unitNumber: "405",
    type: "three-bedroom",
    price: 35000,
    floor: "4",
    description: "Three bedroom unit on floor 4",
  },

  // Floor 5
  {
    unitNumber: "501",
    type: "studio",
    price: 15000,
    floor: "5",
    description: "Studio unit on floor 5",
  },
  {
    unitNumber: "502",
    type: "one-bedroom",
    price: 20000,
    floor: "5",
    description: "One bedroom unit on floor 5",
  },
  {
    unitNumber: "503",
    type: "one-bedroom",
    price: 20000,
    floor: "5",
    description: "One bedroom unit on floor 5",
  },
  {
    unitNumber: "504",
    type: "two-bedroom",
    price: 28000,
    floor: "5",
    description: "Two bedroom unit on floor 5",
  },
  {
    unitNumber: "505",
    type: "three-bedroom",
    price: 35000,
    floor: "5",
    description: "Three bedroom unit on floor 5",
  },
];

const initializeUnits = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if units already exist
    const existingUnits = await Unit.countDocuments();

    if (existingUnits > 0) {
      console.log(
        `⚠️  Units already exist in the database (${existingUnits} units found).`,
      );
      console.log(
        "If you want to reinitialize, please delete all units first.",
      );
      process.exit(0);
    }

    // Create all fixed units
    const createdUnits = await Unit.insertMany(fixedUnits);

    console.log("✅ Units initialized successfully!");
    console.log(`📦 Total units created: ${createdUnits.length}`);
    console.log("\nUnit Summary:");

    // Display summary by type
    const summary = createdUnits.reduce((acc, unit) => {
      acc[unit.type] = (acc[unit.type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} units`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing units:", error.message);
    process.exit(1);
  }
};

initializeUnits();
