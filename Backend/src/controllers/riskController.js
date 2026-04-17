// controllers/riskController.js

const { predictOutbreak } = require("../services/outbreakService");
const { getWeather } = require("../services/weatherService");
const Case = require("../models/Case");

// Group records by area
const groupByArea = (records) => {
  const grouped = {};

  records.forEach((item) => {
    const area = item.area || "Unknown";
    if (!grouped[area]) grouped[area] = [];
    grouped[area].push(item);
  });

  return grouped;
};

// ✅ MAIN API
const calculateRiskHandler = async (req, res) => {
  try {
    const { city } = req.query;

    // 🔥 30 DAY WINDOW
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    let records;

    // 🔍 BASE QUERY (last 30 days)
    let query = {
      date: {
        $gte: last30Days,
        $lte: today, // avoid future dates
      },
    };

    // add city filter if present
    if (city && city.trim() !== "") {
      query.city = { $regex: city, $options: "i" };
    }

    // 🔍 Try recent data first
    records = await Case.find(query).sort({ date: 1 });

    // ⚠️ FALLBACK → if no recent data
    if (!records.length) {
      console.log("⚠️ No recent data → using full dataset");

      let fallbackQuery = {};

      if (city && city.trim() !== "") {
        fallbackQuery.city = { $regex: city, $options: "i" };
      }

      records = await Case.find(fallbackQuery).sort({ date: 1 });
    }

    if (!records.length) {
      return res.json({
        success: false,
        error: "No data found",
      });
    }

    // Weather only if city is provided
    const weather = city ? await getWeather(city) : null;

    const grouped = groupByArea(records);

    let results = [];

    for (let area in grouped) {
      const result = await predictOutbreak({
        data: grouped[area],
        weather,
      });

      results.push(result);
    }

    res.json({
      success: true,
      data: results,
    });

  } catch (err) {
    console.error("❌ Risk error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ EXPORT
module.exports = {
  calculateRiskHandler,
};