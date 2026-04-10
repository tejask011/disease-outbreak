const express = require("express");
const router = express.Router();

const { getDateWiseData } = require("../controllers/dateGroupController");

router.get("/", getDateWiseData);

module.exports = router;