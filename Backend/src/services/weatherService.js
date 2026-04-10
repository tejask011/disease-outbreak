// services/weatherService.js
// Fetches real weather data from OpenWeatherMap API

const axios = require("axios");

const getWeather = async (city) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn("⚠️ No OpenWeather API key, using defaults");
      return getDefaultWeather(city);
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      city,
      temp: data.main.temp,
      humidity: data.main.humidity,
      rainfall: data.rain ? data.rain["1h"] || data.rain["3h"] || 0 : 0,
      contaminatedWater: false, // no API for this, default false
    };

    console.log("🌤️ Weather fetched:", weather);
    return weather;

  } catch (err) {
    console.error("❌ Weather API error:", err.message);
    return getDefaultWeather(city);
  }
};

// Fallback if API fails
const getDefaultWeather = (city) => ({
  city,
  temp: 30,
  humidity: 70,
  rainfall: 0,
  contaminatedWater: false,
});

module.exports = { getWeather };
