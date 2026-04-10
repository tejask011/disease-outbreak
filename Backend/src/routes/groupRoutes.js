//Defines API endpoint (/api/group)

const express = require("express");
const router = express.Router();

const { getGroupedData } = require("../controllers/groupController");

router.get("/", getGroupedData);

module.exports = router;