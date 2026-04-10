// server/data/dummyData.js
// Used by seed script to populate initial database

// Generate dates relative to today for the last 4 days
const today = new Date();
const day = (offset) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().split("T")[0];
};

const data = [
  // -------- KOTHRUD --------
  {
    area: "Kothrud",
    city: "Pune",
    date: day(4),
    feverCases: 10,
    plateletDropCases: 2,
    coughCases: 3,
    vomitingCases: 1,
    jointPainCases: 2,
    suspectedTests: 3
  },
  {
    area: "Kothrud",
    city: "Pune",
    date: day(3),
    feverCases: 15,
    plateletDropCases: 4,
    coughCases: 2,
    vomitingCases: 1,
    jointPainCases: 3,
    suspectedTests: 5
  },
  {
    area: "Kothrud",
    city: "Pune",
    date: day(2),
    feverCases: 22,
    plateletDropCases: 7,
    coughCases: 2,
    vomitingCases: 1,
    jointPainCases: 4,
    suspectedTests: 8
  },
  {
    area: "Kothrud",
    city: "Pune",
    date: day(1),
    feverCases: 30,
    plateletDropCases: 12,
    coughCases: 2,
    vomitingCases: 1,
    jointPainCases: 5,
    suspectedTests: 12
  },

  // -------- HINJEWADI --------
  {
    area: "Hinjewadi",
    city: "Pune",
    date: day(4),
    feverCases: 8,
    plateletDropCases: 1,
    coughCases: 6,
    vomitingCases: 1,
    jointPainCases: 1,
    suspectedTests: 2
  },
  {
    area: "Hinjewadi",
    city: "Pune",
    date: day(3),
    feverCases: 10,
    plateletDropCases: 1,
    coughCases: 7,
    vomitingCases: 1,
    jointPainCases: 1,
    suspectedTests: 3
  },
  {
    area: "Hinjewadi",
    city: "Pune",
    date: day(2),
    feverCases: 12,
    plateletDropCases: 1,
    coughCases: 8,
    vomitingCases: 1,
    jointPainCases: 1,
    suspectedTests: 4
  },
  {
    area: "Hinjewadi",
    city: "Pune",
    date: day(1),
    feverCases: 14,
    plateletDropCases: 1,
    coughCases: 9,
    vomitingCases: 1,
    jointPainCases: 1,
    suspectedTests: 5
  }
];

// Weather is now fetched live from OpenWeatherMap API
// This is kept only as a reference/fallback
const weather = {
  city: "Pune",
  temp: 32,
  humidity: 75,
  rainfall: 120,
  contaminatedWater: false
};

module.exports = { data, weather };