// src/services/featureService.js

function computeFeatures(areaData) {
  const features = {
    growth: 0,
    trend: 0,
    environment: 0,
    early_signal: 0
  };

  if (!areaData || areaData.length === 0) return features;

  const sorted = areaData.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // ✅ Growth (7 vs prev 7)
  if (sorted.length >= 14) {
    const last7 = sorted.slice(-7);
    const prev7 = sorted.slice(-14, -7);

    const sum = arr => arr.reduce((s, d) => s + (d.cases || 0), 0);

    const last = sum(last7);
    const prev = sum(prev7);

    features.growth = prev ? (last - prev) / prev : 0;
  }

  // ✅ Trend
  if (sorted.length >= 7) {
    const first = sorted[0].cases || 0;
    const last = sorted[sorted.length - 1].cases || 0;

    features.trend = (last - first) / sorted.length;
  }

  // ✅ Environment
  let envCount = 0;
  let envScore = 0;

  sorted.forEach(d => {
    if (d.temperature != null && d.humidity != null) {
      let s = 0;

      if (d.temperature >= 25 && d.temperature <= 35) s++;
      if (d.humidity >= 70) s++;

      envScore += s / 2;
      envCount++;
    }
  });

  features.environment = envCount ? envScore / envCount : 0;

  // ✅ Early signal
  if (sorted.length >= 10) {
    const last3 = sorted.slice(-3);
    const prev7 = sorted.slice(-10, -3);

    const avg = arr =>
      arr.reduce((s, d) => s + (d.cases || 0), 0) / arr.length;

    const lastAvg = avg(last3);
    const prevAvg = avg(prev7);

    if (prevAvg > 0 && lastAvg > prevAvg * 1.5) {
      features.early_signal = 1;
    }
  }

  console.log("🔥 Feature List:", Object.values(features).filter(v => v !== 0).length);

  return features;
}

module.exports = { computeFeatures };