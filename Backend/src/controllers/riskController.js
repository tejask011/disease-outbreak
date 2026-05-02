// controllers/riskController.js

const { predictOutbreak } = require("../services/outbreakService");
const { getWeather } = require("../services/weatherService");
const { geocode } = require("../services/geoCoderService");
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

// Small delay helper to respect Nominatim rate limits (1 req/sec)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


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

    // GRACEFUL EMPTY STATE — distinguish between truly empty DB vs. no recent data
    if (!records.length) {
      // Check if the database has ANY records at all (regardless of date/city filters)
      const totalCount = await Case.countDocuments();

      if (totalCount === 0) {
        return res.json({
          success: true,
          data: [],
          reason: "empty_database",
          message: "No outbreak data found. Please upload a CSV dataset to begin monitoring."
        });
      } else {
        return res.json({
          success: true,
          data: [],
          reason: "no_recent_data",
          totalRecords: totalCount,
          message: "Database has records, but no cases match the last 30-day window. Historical data may be outdated."
        });
      }
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

    const groupedKeys = Object.keys(grouped);

    // Process in chunks of 5 to avoid AI rate limits but prevent timeouts
    for (let i = 0; i < groupedKeys.length; i += 5) {
      const chunkKeys = groupedKeys.slice(i, i + 5);
      
      const chunkPromises = chunkKeys.map(async (areaKey) => {
        const areaName = grouped[areaKey][0]?.area || "Unknown";
        const areaCity = grouped[areaKey][0]?.city || "Unknown";
        const actualWeather = weatherCache[areaCity] || null;

        const result = await predictOutbreak({
          data: grouped[areaKey],
          weather: actualWeather,
        });

        // 📍 Geocode each area to get real lat/lng
        try {
          const coords = await geocode(areaName, areaCity);
          if (coords) {
            result.lat = coords.lat;
            result.lng = coords.lng;
          }
        } catch (geoErr) {
          console.error(`❌ Geocode failed for ${areaName}, ${areaCity}:`, geoErr.message);
        }
        
        return result;
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);

      // Delay between chunks to respect Nominatim and Groq AI rate limits
      if (i + 5 < groupedKeys.length) {
        await delay(1000); 
      }
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