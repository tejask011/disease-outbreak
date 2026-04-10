require("dotenv").config();

const { getAIAnalysis } = require("./src/services/aiService");

const testGemini = async () => {
  try {
    const records = [
      { disease: "dengue", cases: 30 },
      { disease: "flu", cases: 10 }
    ];

    const weather = {
      temp: 30,
      humidity: 80,
      rainfall: 60
    };

    console.log("Sending test data to Gemini...\n");

    const result = await getAIAnalysis(records, weather);

    console.log("✅ AI RESULT:");
    console.log(result);

  } catch (err) {
    console.error("❌ ERROR:", err.message);
  }
};

testGemini();