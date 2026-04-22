// controllers/riskController.js

const { predictOutbreak } = require("../services/outbreakService");
const { getWeather } = require("../services/weatherService");
const Case = require("../models/Case");

// Group records by area AND city to prevent data merging across cities (e.g., CIDCO in Nashik vs Aurangabad)
const groupByArea = (records) => {
  const grouped = {};

  records.forEach((item) => {
    const area = item.area || "Unknown";
    const city = item.city || "Unknown";
    const key = `${area}_${city}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return grouped;
};


// ✅ MAIN API
const calculateRiskHandler = async (req, res) => {
  try {
    const { city } = req.query;
    // 🔍 CITY FILTER (Optional)

    if (city && city.trim() !== "") {
      console.log(`🔍 [API HIT] Risk Calculation for city: ${city}`);
    } else {
      console.log(`🌐 [API HIT] Global Risk Calculation (All Cities)`);
    }

    // 🔥 30 DAY WINDOW (Inclusive of full current day)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Inclusion of full day
    
    // Allow for data slightly in the "future" (up to 24h) to handle timezone drift
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);

    let records;

    // 🔍 BASE QUERY (last 30 days)
    let query = {
      date: {
        $gte: last30Days,
        $lte: tomorrow, // inclusive of today + jitter for timezones
      },
    };

    // add city filter if present
    if (city && city.trim() !== "") {
      query.city = { $regex: city, $options: "i" };
    }


    // 🔍 Try recent data first
    records = await Case.find(query).sort({ date: 1 });

    // ⚠️ FALLBACK → if no recent data
    if (!records.length) {
      console.log("⚠️ No recent data → using full dataset");

      let fallbackQuery = {};

      if (city && city.trim() !== "") {
        fallbackQuery.city = { $regex: city, $options: "i" };
      }

      records = await Case.find(fallbackQuery).sort({ date: 1 });
    }

    // GRACEFUL EMPTY STATE
    if (!records.length) {
      return res.json({
        success: true,
        data: [],
        message: "Monitoring active: No cases found in the last 30 days."
      });
    }

    // 🔍 Localized Weather Engine
    const citiesToFetch = [...new Set(records.map(r => r.city))];
    const weatherCache = {};
    
    console.log(`🌤️ Fetching localized weather for cities: ${citiesToFetch.join(", ")}`);
    
    for (const c of citiesToFetch) {
      try {
        weatherCache[c] = await getWeather(c);
      } catch (e) {
        console.error(`❌ Weather fetch failed for ${c}:`, e.message);
        weatherCache[c] = { temp: 25, humidity: 60, rainfall: 0 };
      }
    }

    const grouped = groupByArea(records);
    const results = [];

    for (let area in grouped) {
      const areaCity = grouped[area][0]?.city || "Unknown";
      const actualWeather = weatherCache[areaCity] || null;

      const result = await predictOutbreak({
        data: grouped[area],
        weather: actualWeather,
      });

      results.push(result);
    }


    res.json({
      success: true,
      data: results,
    });

  } catch (err) {
    console.error("❌ Risk error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ✅ EXPORT
module.exports = {
  calculateRiskHandler,
};