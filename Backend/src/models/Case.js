// models/Case.js

const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },

  // ✅ NEW STRUCTURE (AI + hybrid compatible)
  disease: {
    type: String,
    required: true,
  },
  cases: {
    type: Number,
    required: true,
    default: 0,
  },
  source: {
  type: String,
  default: "old",
},
});

// ✅ Optimized index for fast queries
caseSchema.index({ city: 1, area: 1, date: -1 });

module.exports = mongoose.model("Case", caseSchema);