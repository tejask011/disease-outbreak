const fs = require("fs");
const { predictOutbreak } = require("../services/outbreakService");

// ⚠️ Instead of API, directly use DB or mock data loader
const sampleData = require("./sampleData.json"); // temporary

const generateDataset = async () => {
  let rows = [];

  for (let entry of sampleData) {
    const result = await predictOutbreak({
      data: entry.data,
      weather: entry.weather
    });

    const pred = result.prediction;

    // ⚠️ We need features → so modify outbreakService later if needed
    rows.push({
      avg: entry.avg,
      growth: entry.growth,
      spike: entry.spike,
      acceleration: entry.acceleration,
      weatherImpact: entry.weatherImpact,
      caseFactor: entry.caseFactor,
      rule_score: pred.riskScore
    });
  }

  const csv = [
    "avg,growth,spike,acceleration,weatherImpact,caseFactor,rule_score",
    ...rows.map(r =>
      `${r.avg},${r.growth},${r.spike},${r.acceleration},${r.weatherImpact},${r.caseFactor},${r.rule_score}`
    )
  ].join("\n");

  fs.writeFileSync("training_data.csv", csv);
  console.log("✅ Dataset generated");
};

generateDataset();