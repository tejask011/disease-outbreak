// services/outbreakService.js

const { inferDiseaseProbabilities } = require("./diseaseInferenceService");
const { getAIAnalysis } = require("./aiService");

// Sort
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

// 📈 Growth
const calculateGrowth = (values) => {
  if (values.length < 2) return 0;

  const first = values[0] + 0.001;
  const last = values[values.length - 1] + 0.001;

  return Math.min(Math.log(last / first), 1);
};

// 🚨 Spike Detection (sudden jump)
const detectSpike = (values) => {
  if (values.length < 2) return 0;

  const prev = values[values.length - 2];
  const last = values[values.length - 1];

  if (last > prev * 1.5) return 1; // strong spike
  if (last > prev * 1.2) return 0.5; // moderate spike

  return 0;
};

// ⚡ Acceleration (growth speed increasing)
const detectAcceleration = (values) => {
  if (values.length < 3) return 0;

  const d1 = values[1] - values[0];
  const d2 = values[2] - values[1];

  if (d2 > d1 * 1.5) return 1;
  if (d2 > d1) return 0.5;

  return 0;
};

// 🌦️ Weather impact
const getWeatherImpact = (weather, disease) => {
  if (!weather) return 0.5;

  const { temp = 25, humidity = 50, rainfall = 0 } = weather;

  let impact = 0.5;

  if (disease.includes("dengue") || disease.includes("malaria")) {
    if (humidity > 60) impact += 0.2;
    if (rainfall > 1) impact += 0.2;
    if (temp > 25 && temp < 35) impact += 0.1;
  }

  if (disease.includes("flu") || disease.includes("viral")) {
    if (temp < 25) impact += 0.2;
  }

  return Math.min(impact, 1);
};

// 🎯 Risk level
const getRiskMeta = (score) => {
  if (score >= 0.7) return { level: "HIGH", color: "#FF4D4D" };
  if (score >= 0.4) return { level: "MEDIUM", color: "#FFA500" };
  return { level: "LOW", color: "#00C853" };
};

const formatPercent = (val) =>
  Math.min(Math.round(val * 100), 100) + "%";

// MAIN FUNCTION
const predictOutbreak = async ({ data, weather }) => {
  const city = data[0]?.city || "Unknown";
  const area = data[0]?.area || "Unknown";

  const sorted = sortByDate(data);
  const grouped = groupByDate(sorted);

  // 🤖 AI
  let ai = await getAIAnalysis(data, weather);
  const safeAI = ai?.riskFactor || 0.6;

  let diseaseHistory = {};

  for (let date in grouped) {
    const daily = grouped[date];
    const probs = inferDiseaseProbabilities(daily);

    for (let d in probs) {
      if (!diseaseHistory[d]) diseaseHistory[d] = [];

      const hybrid = probs[d]; // clean base

      diseaseHistory[d].push(hybrid);
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

    // 🚨 EARLY SIGNAL COMBINATION
    const earlySignal =
      spike * 0.5 +
      acceleration * 0.5;

    // 🔥 FINAL RISK SCORE
        const score =
      avg * 0.25 +          // ↓ reduce flattening
      growth * 0.3 +        // ↑ more trend importance
      weatherImpact * 0.1 +
      earlySignal * 0.25 +  // 🔥 BIG impact
      safeAI * 0.1;
    return {
      disease: d.toLowerCase(),
      probability: avg,
      score,
      spike,
      acceleration,
    };
  });

  results = results.filter((r) => r.probability > 0);

  results.sort((a, b) => b.score - a.score);

  const top = results[0];
  const meta = getRiskMeta(top.score);

  return {
    area,
    city,

    weather,

    prediction: {
      disease: top.disease,
      confidence: formatPercent(top.probability),
      riskScore: Number(top.score.toFixed(2)),
      aiFactor: safeAI,
      earlyWarning:
        top.spike || top.acceleration
          ? "⚠️ Early outbreak signal detected"
          : "No immediate spike detected",
      expectedOutbreak: "~3-7 days",
      level: meta.level,
      color: meta.color,
    },

    topDiseases: results.slice(0, 3).map((d) => ({
      name: d.disease,
      probability: formatPercent(d.probability),
    })),

    summary: `⚠️ ${top.disease} risk increasing in ${area} due to rising trend, early signals and weather conditions.`,
  };
};

module.exports = { predictOutbreak };