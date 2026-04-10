const express = require("express");
const router = express.Router();

const { getAIAnalysis } = require("../services/aiService");

// 🔥 Route to test Gemini with real input
router.post("/ai-analysis", async (req, res) => {
  try {
    const { records, weather } = req.body;

    if (!records || !weather) {
      return res.status(400).json({
        success: false,
        message: "records and weather are required"
      });
    }

    const result = await getAIAnalysis(records, weather);

    res.json({
      success: true,
      result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;