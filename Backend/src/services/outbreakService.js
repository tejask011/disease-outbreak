const { inferDiseaseProbabilities } = require("./diseaseInferenceService");
const { getAIAnalysis } = require("./aiService");

// Sort by date
const sortByDate = (data) =>
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

// Group by date
const groupByDate = (data) => {
  let grouped = {};
  data.forEach((r) => {
    const key = new Date(r.date).toISOString().split("T")[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });
  return grouped;
};

// Growth
const calculateGrowth = (values) => {
  if (values.length < 2) return 0;
  const first = values[0] + 0.001;
  const last = values[values.length - 1] + 0.001;
  return Math.min(Math.log(last / first), 1);
};

// Spike
const detectSpike = (values) => {
  if (values.length < 2) return 0;
  const prev = values[values.length - 2];
  const last = values[values.length - 1];
  if (last > prev * 1.5) return 1;
  if (last > prev * 1.2) return 0.5;
  return 0;
};

// Acceleration
const detectAcceleration = (values) => {
  if (values.length < 3) return 0;
  const d1 = values[1] - values[0];
  const d2 = values[2] - values[1];
  if (d2 > d1 * 1.5) return 1;
  if (d2 > d1) return 0.5;
  return 0;
};

// Weather
const getWeatherImpact = (weather, disease) => {
  if (!weather) return 0.5;

  const { temp = 25, humidity = 50, rainfall = 0 } = weather;
  let impact = 0.5;

  if (disease.includes("dengue") || disease.includes("malaria")) {
    if (humidity > 60) impact += 0.2;
    if (rainfall > 1) impact += 0.2;
    if (temp > 25 && temp < 35) impact += 0.1;
  }

  return Math.min(impact, 1);
};

// Risk level
const getRiskMeta = (score) => {
  if (score >= 0.7) return { level: "HIGH", color: "#FF4D4D" };
  if (score >= 0.55) return { level: "MEDIUM", color: "#FFA500" };
  return { level: "LOW", color: "#00C853" };
};

// ✅ NEW: Expected Outbreak Logic
const getExpectedOutbreak = (score, growth, spike) => {
  if (score >= 0.75 && spike === 1) return "Immediate (1-3 days)";
  if (score >= 0.65 && growth > 0.5) return "Within a week";
  if (score >= 0.55) return "Possible in 1-2 weeks";
  return "Low risk";
};

// Format %
const formatPercent = (val) =>
  Math.min(Math.round(val * 100), 95) + "%";

// MAIN FUNCTION
const predictOutbreak = async ({ data, weather }) => {
  try {
    if (!data || data.length === 0) {
      return {
        area: "Unknown",
        city: "Unknown",
        prediction: {
          disease: "No Data",
          confidence: "0%",
          riskScore: 0,
          level: "LOW",
          color: "#00C853",
          expectedOutbreak: "N/A",
        },
        topDiseases: [],
        summary: "No data available",
      };
    }

    const city = data[0]?.city || "Unknown";
    const area = data[0]?.area || "Unknown";

    const sorted = sortByDate(data);
    const grouped = groupByDate(sorted);

    const ai = await getAIAnalysis(data, weather);
    const safeAI = ai?.riskFactor || 0.6;

    const totalCases = data.reduce((sum, r) => sum + (r.cases || 0), 0);
    const caseFactor = Math.min(totalCases / 100, 1);

    const caseTotals = {};
    data.forEach((r) => {
      const d = (r.disease || "unknown").toLowerCase();
      caseTotals[d] = (caseTotals[d] || 0) + (r.cases || 0);
    });

    let diseaseHistory = {};

    for (let date in grouped) {
      const daily = grouped[date];
      const probs = inferDiseaseProbabilities(daily);

      for (let d in probs) {
        if (!diseaseHistory[d]) diseaseHistory[d] = [];
        diseaseHistory[d].push(probs[d]);
      }
    }

    let results = Object.keys(diseaseHistory).map((d) => {
      const values = diseaseHistory[d];

      const avg =
        values.reduce((a, b) => a + b, 0) / values.length;

      const growth = calculateGrowth(values);
      const spike = detectSpike(values);
      const acceleration = detectAcceleration(values);
      const weatherImpact = getWeatherImpact(weather, d);

      let score =
        avg * 0.3 +
        growth * 0.2 +
        weatherImpact * 0.1 +
        (spike + acceleration) * 0.2 +
        safeAI * 0.1 +
        caseFactor * 0.3;

      const finalScore = Math.min(score * 1.05, 1);

      return {
        disease: d,
        probability: avg,
        score: finalScore,
        growth,
        spike,
      };
    });

    if (!results.length) {
      return {
        area,
        city,
        prediction: {
          disease: "No Data",
          confidence: "0%",
          riskScore: 0,
          level: "LOW",
          color: "#00C853",
          expectedOutbreak: "N/A",
        },
        topDiseases: [],
        summary: "No results generated",
      };
    }

    results.sort((a, b) => b.score - a.score);
    const top = results[0];

    const meta = getRiskMeta(top.score);

    // ✅ USE expected outbreak
    const expectedOutbreak = getExpectedOutbreak(
      top.score,
      top.growth,
      top.spike
    );

    return {
      area,
      city,
      weather,

      prediction: {
        disease: top.disease,
        confidence: formatPercent(
          0.6 * top.probability + 0.4 * safeAI
        ),
        riskScore: Number(top.score.toFixed(2)),
        level: meta.level,
        color: meta.color,
        expectedOutbreak, // ✅ ADDED
      },

      topDiseases: results.slice(0, 3).map((d) => ({
        name: d.disease,
        probability: formatPercent(d.probability),
        caseCount: caseTotals[d.disease] || 0,
      })),

      summary: `${top.disease} risk increasing in ${area}`,
    };

  } catch (err) {
    console.log("❌ OUTBREAK ERROR:", err.message);

    return {
      area: "Error",
      city: "Error",
      prediction: {
        disease: "Error",
        confidence: "0%",
        riskScore: 0,
        level: "LOW",
        color: "#00C853",
        expectedOutbreak: "N/A",
      },
      topDiseases: [],
      summary: "System error occurred",
    };
  }
};

module.exports = { predictOutbreak };