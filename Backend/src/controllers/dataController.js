// controllers/dataController.js

const Case = require("../models/Case");

// ✅ Add single disease record (NEW FORMAT)
exports.addManualData = async (req, res) => {
  try {
    const { area, city, date, disease, cases } = req.body;

    if (!area || !city || !disease || !cases) {
      return res.status(400).json({
        success: false,
        error: "area, city, disease, cases are required",
      });
    }

    const newCase = new Case({
      area,
      city,
      date: date ? new Date(date) : new Date(),
      disease: disease.toLowerCase(),
      cases: Number(cases),
    });

    await newCase.save();

    res.json({
      success: true,
      message: "Data added successfully",
      data: newCase,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};