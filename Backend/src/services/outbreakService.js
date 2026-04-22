const { inferDiseaseProbabilities } = require("./diseaseInferenceService");
const { getAIAnalysis } = require("./aiService");
const { getMLScores } = require("./mlService");

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

// Dynamic weather impact based on disease category
const getWeatherImpact = (weather, disease) => {
  if (!weather) return 0.5;
  const d = disease.toLowerCase();
  const { temp = 25, humidity = 50, rainfall = 0 } = weather;
  let impact = 0.5;

  // Category 1: Vector-borne (Mosquitoes)
  if (d.includes("dengue") || d.includes("malaria") || d.includes("chikungunya") || d.includes("zika")) {
    if (humidity > 60) impact += 0.2;
    if (temp > 24 && temp < 34) impact += 0.15;
    if (rainfall > 0 && rainfall < 5) impact += 0.1; // small puddles
  }
  // Category 2: Water-borne / Hygiene
  else if (d.includes("cholera") || d.includes("typhoid") || d.includes("diarrhea") || d.includes("hepatitis")) {
    if (rainfall > 8) impact += 0.3; // flooding/contamination
    if (temp > 28) impact += 0.1; // bacterial growth
  }
  // Category 3: Respiratory / Viral
  else if (d.includes("flu") || d.includes("covid") || d.includes("pneumonia") || d.includes("cold")) {
    if (temp < 18) impact += 0.3; // cold weather spread
    if (humidity < 40) impact += 0.1; // dry air
  }

  return Math.min(impact, 1);
};

// Risk level recalibrated for higher sensitivity and clearer separation
const getRiskMeta = (score) => {
  if (score >= 0.70) return { level: "HIGH", color: "#FF4D4D" };
  if (score >= 0.45) return { level: "MEDIUM", color: "#FFA500" };
  return { level: "LOW", color: "#00C853" };
};

// Expected outbreak timing logic
const getExpectedOutbreak = (score, growth, spike) => {
  if (score >= 0.70 && spike === 1) return "Immediate (1-3 days)";
  if (score >= 0.55) return "Within a week";
  if (score >= 0.40) return "Possible in 1-2 weeks";
  return "Stable - Monitor only";
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
        prediction: { disease: "No Data", riskScore: 0, level: "LOW", color: "#00C853" },
        topDiseases: [],
        summary: "No data available",
      };
    }

    const city = data[0]?.city || "Unknown";
    const area = data[0]?.area || "Unknown";

    const sorted = sortByDate(data);
    const grouped = groupByDate(sorted);

    const ai = await getAIAnalysis(data, weather);
    const aiRiskFactor = ai?.riskFactor || 0.6;

    // MAGNITUDE CALCULATION
    const totalCases = data.reduce((sum, r) => sum + (r.cases || 0), 0);
    const caseFactor = Math.min(totalCases / 100, 1); // 100+ cases is serious volume

    // 🔥 HARDENED VOLUME MULTIPLIER (More aggressive towards low data)
    let volumeMultiplier = 1.0;
    if (totalCases < 30) volumeMultiplier = 0.3; // Very harsh for tiny samples
    else if (totalCases < 75) volumeMultiplier = 0.7;



    const caseTotals = {};
    data.forEach((r) => {
      const d = (r.disease || "unknown").toLowerCase();
      caseTotals[d] = (caseTotals[d] || 0) + (r.cases || 0);
    });

    let diseaseHistory = {};
    for (let date in grouped) {
      const daily = grouped[date];
      const totalDailyCases = daily.reduce((sum, r) => sum + (r.cases || 0), 0);
      
      inferDiseaseProbabilities(daily);

      for (let d in caseTotals) {
        if (!diseaseHistory[d]) diseaseHistory[d] = [];
        const dailyCases = daily
          .filter(r => (r.disease || "").toLowerCase() === d)
          .reduce((sum, r) => sum + (r.cases || 0), 0);
        
        diseaseHistory[d].push({
          conc: totalDailyCases > 0 ? dailyCases / totalDailyCases : 0,
          count: dailyCases
        });
      }
    }

    // INTERNAL GHOST HANDLING (For ML stability only)
    let diseaseKeys = Object.keys(diseaseHistory);
    const originalKeys = [...diseaseKeys]; 
    
    if (diseaseKeys.length < 3) {
      const fallbacks = ["general", "viral", "bacterial"];
      fallbacks.forEach((d) => {
        if (!diseaseKeys.includes(d)) {
          diseaseKeys.push(d);
          diseaseHistory[d] = [{ conc: 0.01, count: 0 }];
        }
      });
    }

    let featureList = diseaseKeys.map((d) => {
      const entries = diseaseHistory[d] || [{ conc: 0, count: 0 }];
      const avg = entries.reduce((a, b) => a + b.conc, 0) / entries.length;
      const counts = entries.map(e => e.count);

      return {
        avg,
        growth: calculateGrowth(counts),
        spike: detectSpike(counts),
        acceleration: detectAcceleration(counts),
        weatherImpact: getWeatherImpact(weather, d),
        caseFactor
      };
    });

    const mlScores = await getMLScores(featureList);

    let results = diseaseKeys.map((d, i) => {
      const f = featureList[i];
      const mlScore = mlScores[i] || 0.5;

      // 🔥 VOLUME-FIRST SENSITIVITY (Redistributed weights)
      let ruleScore =
        f.avg * 0.30 +           
        f.growth * 0.25 +        
        f.caseFactor * 0.20 +    
        f.weatherImpact * 0.10 + 
        (f.spike + f.acceleration) * 0.15;

      ruleScore = ruleScore * volumeMultiplier;

      // Rule-Dominance: 85% Rules, 15% ML (Balanced for high accuracy)
      const combinedRisk = Math.min(0.85 * ruleScore + 0.15 * mlScore, 1);

      return {
        disease: d,
        probability: f.avg,
        riskScore: Math.round(combinedRisk * 100),
        confidence: Math.round((0.8 - Math.abs(mlScore - 0.5)) * 100) + "%",
        growth: f.growth,
        spike: f.spike,
        combinedRiskValue: combinedRisk,
        isGhost: !originalKeys.includes(d)
      };
    });


    // 🔥 FILTER GHOSTS FROM FINAL UI OUTPUT
    const realResults = results.filter(r => !r.isGhost && r.probability > 0);
    
    // Fallback if no real results matched (unlikely but safe)
    const finalResultsForSort = realResults.length > 0 ? realResults : results;
    finalResultsForSort.sort((a, b) => b.riskScore - a.riskScore);
    
    const top = finalResultsForSort[0];
    const meta = getRiskMeta(top.combinedRiskValue);
    const expectedOutbreak = getExpectedOutbreak(top.combinedRiskValue, top.growth, top.spike);

    return {
      area,
      city,
      weather: weather || { temp: 25, humidity: 50, rainfall: 0 },
      prediction: {
        disease: top.disease,
        confidence: top.confidence,
        riskScore: top.riskScore,
        level: meta.level,
        color: meta.color,
        expectedOutbreak,
      },
      // Only show top 3 REAL diseases
      topDiseases: realResults.slice(0, 3).map((d) => ({
        name: d.disease,
        probability: formatPercent(d.probability),
        caseCount: caseTotals[d.disease] || 0,
        level: d.riskScore > 75 ? "HIGH" : d.riskScore > 45 ? "MEDIUM" : "LOW",
      })),
      summary: `${top.disease} indicates ${meta.level.toLowerCase()} risk level in ${area}. ${
        top.riskScore > 70 ? "Immediate attention advised." : "Monitor local trends."
      }`,
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