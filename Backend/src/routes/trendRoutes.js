const express = require("express");
const router = express.Router();

const { getTrend } = require("../controllers/trendController");

router.get("/", getTrend);

module.exports = router;