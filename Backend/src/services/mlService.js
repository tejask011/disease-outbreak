const axios = require("axios");

const getMLScores = async (featuresArray) => {
  try {
    const res = await axios.post(
      "http://localhost:5001/predict",
      featuresArray
    );
    return res.data.ml_scores;
  } catch (err) {
    console.log("❌ ML ERROR:", err.message);
    return featuresArray.map(() => 0.5); // fallback
  }
  console.log("🔥 Calling ML once", featuresArray.length);
};

module.exports = { getMLScores };