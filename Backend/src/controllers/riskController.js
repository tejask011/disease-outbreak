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

    if (!city) {
      return res.status(400).json({
        success: false,
        error: "City is required",
      });
    }

    const records = await Case.find({
      city: { $regex: city, $options: "i" },
    }).sort({ date: 1 });

    if (!records.length) {
      return res.json({
        success: false,
        error: "No data found",
      });
    }

    const weather = await getWeather(city);
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