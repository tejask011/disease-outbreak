const express = require("express");
const router = express.Router();

const { addManualData } = require("../controllers/dataController");

// Manual entry only — CSV upload is handled by /api/upload
router.post("/manual", addManualData);

module.exports = router;
