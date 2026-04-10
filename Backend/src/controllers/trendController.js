// controllers/trendController.js

const { calculateTrend } = require("../services/trendService");

const getTrend = async (req, res) => {
  try {
    const { city, disease } = req.query;

    if (!city || !disease) {
      return res.status(400).json({
        success: false,
        error: "city and disease are required",
      });
    }

    const result = await calculateTrend(city, disease);

    if (!result) {
      return res.json({
        success: false,
        message: "No data found",
      });
    }

    res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error("❌ Trend error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = { getTrend };