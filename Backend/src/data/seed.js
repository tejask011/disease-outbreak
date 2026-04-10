// Seed script — run once to populate DB with initial 7 days of data
// Usage: node src/data/seed.js

require("../config/env");
const mongoose = require("mongoose");
const Case = require("../models/Case");
const { data } = require("./dummyData");

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Case.deleteMany({});
    console.log("🗑️ Cleared old data");

    // Insert dummy data
    await Case.insertMany(data);
    console.log(`✅ Seeded ${data.length} records`);

    // Verify
    const count = await Case.countDocuments();
    console.log(`📊 Total records in DB: ${count}`);

    const sample = await Case.findOne();
    console.log("📝 Sample record:", JSON.stringify(sample, null, 2));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedDB();
