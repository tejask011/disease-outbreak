require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const Case = require("../models/Case");
const { predictOutbreak } = require("../services/outbreakService");

// ✅ CONNECT DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

// ✅ GENERATE CSV
const generateCSV = async () => {
  try {
    console.log("📊 Fetching data from DB...");

    const allData = await Case.find();

    if (!allData.length) {
      console.log("❌ No data found");
      return;
    }

    // 👉 Group by city + area
    const grouped = {};

    allData.forEach((r) => {
      const key = `${r.city}_${r.area}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    let rows = [];

    console.log("⚙️ Processing areas...");

    for (let key in grouped) {
      const data = grouped[key];

      const result = await predictOutbreak({
        data,
        weather: null // you can improve later
      });

      // ✅ Extract features
      if (result._featuresList && result._featuresList.length > 0) {
        rows.push(...result._featuresList);
      }
    }

    if (!rows.length) {
      console.log("❌ No feature rows generated");
      return;
    }

    // ✅ CSV HEADER
    const header =
      "avg,growth,spike,acceleration,weatherImpact,caseFactor,rule_score\n";

    const csvRows = rows
      .map(
        (r) =>
          `${r.avg},${r.growth},${r.spike},${r.acceleration},${r.weatherImpact},${r.caseFactor},${r.ruleScore}`
      )
      .join("\n");

    const filePath = path.join(__dirname, "../../../ml/training_data.csv");

    fs.writeFileSync(filePath, header + csvRows);

    console.log("✅ CSV GENERATED at:", filePath);
    console.log(`📈 Total rows: ${rows.length}`);

  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }
};

// ✅ START SCRIPT
const start = async () => {
  await connectDB();
  await generateCSV();
  process.exit();
};

start();