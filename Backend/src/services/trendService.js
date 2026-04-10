const { groupByDate } = require("./dateGroupService");

async function calculateTrend(city, disease) {
  const data = await groupByDate(city, disease);

  if (data.length === 0) return null;

  // Last 7 days
  const last7 = data.slice(-7);

  // Average of last 7 days
  const avg7 =
    last7.reduce((sum, d) => sum + d.totalCases, 0) / last7.length;

  // Today cases (latest day)
  const todayCases = last7[last7.length - 1].totalCases;

  // Growth %
  const growthRate = ((todayCases - avg7) / avg7) * 100;

  // Trend detection
  let trend = "STABLE";
  if (growthRate > 10) trend = "INCREASING";
  else if (growthRate < -10) trend = "DECREASING";

  return {
    avgLast7Days: avg7,
    todayCases,
    growthRate,
    trend,
  };
}

module.exports = { calculateTrend };