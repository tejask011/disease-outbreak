<<<<<<< HEAD
const axios = require("axios");

/**
 * Normalize state names that are stored as single words
 * e.g., "westbengal" → "West Bengal", "andhrapradesh" → "Andhra Pradesh"
 */
const STATE_NAME_MAP = {
  "westbengal": "West Bengal",
  "andhrapradesh": "Andhra Pradesh",
  "madhyapradesh": "Madhya Pradesh",
  "uttarpradesh": "Uttar Pradesh",
  "himachalpradesh": "Himachal Pradesh",
  "arunachalpradesh": "Arunachal Pradesh",
  "jammuandkashmir": "Jammu and Kashmir",
  "tamilnadu": "Tamil Nadu",
  "chhattisgarh": "Chhattisgarh",
  "uttarakhand": "Uttarakhand",
  "jharkhand": "Jharkhand",
  "telangana": "Telangana",
  "karnataka": "Karnataka",
  "maharashtra": "Maharashtra",
  "rajasthan": "Rajasthan",
  "gujarat": "Gujarat",
  "punjab": "Punjab",
  "bihar": "Bihar",
  "odisha": "Odisha",
  "kerala": "Kerala",
  "meghalaya": "Meghalaya",
  "sikkim": "Sikkim",
  "tripura": "Tripura",
  "mizoram": "Mizoram",
  "manipur": "Manipur",
  "goa": "Goa",
  "nagaland": "Nagaland",
  "assam": "Assam",
  "haryana": "Haryana",
};

const normalizeState = (raw) => {
  const key = (raw || "").toLowerCase().replace(/\s+/g, "");
  return STATE_NAME_MAP[key] || raw;
};

/**
 * Geocodes an area and city/state in India using OpenCage API (or Nominatim as fallback)
 * Note: In this dataset, `area` is often the actual city name and `city` is actually the state name.
 */
const geocode = async (area, city) => {
  try {
    // Normalize the state name (city field often contains state like "westbengal")
    const normalizedState = normalizeState(city);
    const query = `${area}, ${normalizedState}, India`;

    console.log("🌍 Query:", query);

    // Try OpenCage if key exists
    if (process.env.OPENCAGE_KEY) {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${process.env.OPENCAGE_KEY}&limit=5&countrycode=in`;
      const res = await axios.get(url);

      if (res.data.results && res.data.results.length > 0) {
        const results = res.data.results;

        // 🔥 smart selection
        let result = results.find(r => {
          const name =
            r.components.suburb ||
            r.components.village ||
            r.components.town ||
            r.components.city ||
            "";

          return name.toLowerCase().includes(area.toLowerCase());
        });

        if (!result) {
          result = results.find(r =>
            r.components._type === "suburb" ||
            r.components._type === "village"
          );
        }
        if (!result) {
          result = results[0];
        }

        console.log("📍 Selected (OpenCage):", result.formatted);
        console.log("📍 Coords:", result.geometry);

        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
        };
      }
    }

    // Fallback to Nominatim (Free, no key needed) if OpenCage fails or no key
    console.log("⚠️ No OpenCage key or no results, trying Nominatim fallback...");
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=1`;
    const nRes = await axios.get(nominatimUrl, {
      headers: { "User-Agent": "DiseaseOutbreakApp/1.0" }
    });

    if (nRes.data && nRes.data.length > 0) {
      console.log("📍 Selected (Nominatim):", nRes.data[0].display_name);
      return {
        lat: parseFloat(nRes.data[0].lat),
        lng: parseFloat(nRes.data[0].lon),
      };
    }

    // 🚀 FALLBACK 1.5: Try area + state (ignoring the city if it's different)
    // Actually, let's just try "city, India" if area fails, because city might be "kolhapur"
    console.log(`⚠️ Full query failed. Trying city-only: "${city}, India"`);
    const cityOnlyUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", India")}&countrycodes=in&format=json&limit=1`;
    const cityRes = await axios.get(cityOnlyUrl, {
      headers: { "User-Agent": "DiseaseOutbreakApp/1.0" }
    });

    if (cityRes.data && cityRes.data.length > 0) {
      console.log("📍 City Fallback (Nominatim):", cityRes.data[0].display_name);
      return {
        lat: parseFloat(cityRes.data[0].lat),
        lng: parseFloat(cityRes.data[0].lon),
      };
    }

    // 🚀 FALLBACK 2: Try just "area, India" (since area is often the actual city name like "gwalior")
    console.log(`⚠️ Full query failed. Trying area-only: "${area}, India"`);
    const areaOnlyUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(area + ", India")}&countrycodes=in&format=json&limit=1`;
    const areaRes = await axios.get(areaOnlyUrl, {
      headers: { "User-Agent": "DiseaseOutbreakApp/1.0" }
    });

    if (areaRes.data && areaRes.data.length > 0) {
      console.log("📍 Area Fallback (Nominatim):", areaRes.data[0].display_name);
      return {
        lat: parseFloat(areaRes.data[0].lat),
        lng: parseFloat(areaRes.data[0].lon),
      };
    }

    // 🚀 FALLBACK 3: Try just the normalized state name
    console.log(`⚠️ Area-only also failed. Trying state-only: "${normalizedState}, India"`);
    const stateOnlyUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(normalizedState + ", India")}&countrycodes=in&format=json&limit=1`;
    const stateRes = await axios.get(stateOnlyUrl, {
      headers: { "User-Agent": "DiseaseOutbreakApp/1.0" }
    });

    if (stateRes.data && stateRes.data.length > 0) {
      console.log("📍 State Fallback (Nominatim):", stateRes.data[0].display_name);
      return {
        lat: parseFloat(stateRes.data[0].lat),
        lng: parseFloat(stateRes.data[0].lon),
      };
    }

    console.log(`❌ All geocoding attempts failed for: ${area}, ${city}`);
    return null;

  } catch (err) {
    console.log("❌ Geocode failed:", err.message);
=======
// services/geoCoderService.js
// Geocodes area + city to lat/lng coordinates using Nominatim (free, no API key needed)

const axios = require("axios");

// In-memory cache to avoid redundant API calls within the same server session
const geoCache = {};

const geocode = async (area, city) => {
  // Build a unique cache key
  const cacheKey = `${area.toLowerCase().trim()}_${city.toLowerCase().trim()}`;

  if (geoCache[cacheKey]) {
    console.log("📍 Cache hit:", cacheKey);
    return geoCache[cacheKey];
  }

  try {
    // Try specific area + city first
    let coords = await tryGeocode(`${area}, ${city}, India`);

    // Fallback: just city
    if (!coords) {
      console.log(`⚠️ Area-level geocode failed, falling back to city: ${city}`);
      coords = await tryGeocode(`${city}, India`);
    }

    if (coords) {
      geoCache[cacheKey] = coords;
      console.log(`📍 Geocoded [${area}, ${city}] → [${coords.lat}, ${coords.lng}]`);
    } else {
      console.log(`❌ Geocode failed completely for: ${area}, ${city}`);
    }

    return coords;
  } catch (err) {
    console.error("❌ Geocode error:", err.message);
>>>>>>> 1a26d20 ( listen port added)
    return null;
  }
};

<<<<<<< HEAD
/**
 * Batch geocode helper to stay compatible with riskController
 */
const batchGeocode = async (items) => {
  const results = new Map();
  const seen = new Set();
  
  for (const item of items) {
    const key = `${(item.area || "").toLowerCase().trim()}_${(item.city || "").toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      const coords = await geocode(item.area, item.city);
      if (coords) {
        results.set(key, coords);
      }
      // Add a 1.5s delay for Nominatim rate limits (strict 1 req/sec policy)
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return results;
};

module.exports = { geocode, batchGeocode };
=======
const tryGeocode = async (query) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=1`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent": "DiseaseOutbreakApp/1.0",
      },
      timeout: 5000,
    });

    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon),
      };
    }

    return null;
  } catch (err) {
    console.error("❌ Nominatim request failed:", err.message);
    return null;
  }
};

module.exports = { geocode };
>>>>>>> 1a26d20 ( listen port added)
