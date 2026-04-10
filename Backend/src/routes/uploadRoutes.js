// routes/uploadRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const { parseCSV } = require("../services/csvService");
const Case = require("../models/Case");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const parsedData = await parseCSV(req.file.path);

    console.log("📦 Parsed CSV:", parsedData); // 🔥 DEBUG

    if (!parsedData.length) {
      return res.status(400).json({
        success: false,
        error: "CSV contains no valid data",
      });
    }

    // 🔥 ADD SOURCE TAG (VERY IMPORTANT)
    const finalData = parsedData.map((r) => ({
      ...r,
      source: "csv_v2", // mark new data
    }));

    // 🔥 INSERT WITHOUT STOPPING ON ERRORS
    const result = await Case.insertMany(finalData, {
      ordered: false,
    });

    console.log("✅ Inserted Count:", result.length);

    fs.unlinkSync(req.file.path);

    const cities = [...new Set(finalData.map((r) => r.city))];

    res.json({
      success: true,
      message: "CSV uploaded successfully ✅",
      inserted: result.length,
      cities,
    });

  } catch (err) {
    console.error("❌ Upload Error:", err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;