//Handles request → calls service → sends response

const { groupCases } = require("../services/groupService");

exports.getGroupedData = async (req, res) => {
  try {
    const data = await groupCases();

    res.json({
      message: "Grouped data",
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};