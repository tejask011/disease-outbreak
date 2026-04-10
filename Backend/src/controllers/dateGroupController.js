const { groupByDate } = require("../services/dateGroupService");

exports.getDateWiseData = async (req, res) => {
  try {
    const { city, disease } = req.query;

    const data = await groupByDate(city, disease);

    res.json({
      message: "Date-wise grouped data",
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};