// routes/riskRoutes.js

const express = require("express");
const router = express.Router();

const controller = require("../controllers/riskController");

// ✅ MAIN API (working)
router.get("/calculate", controller.calculateRiskHandler);

// ❌ Removed broken POST route (was causing crash)

module.exports = router;