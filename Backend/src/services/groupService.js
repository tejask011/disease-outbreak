// services/groupService.js

const Case = require("../models/Case");

// ✅ Group by city + area + disease
async function groupCases() {
  const result = await Case.aggregate([
    {
      $group: {
        _id: {
          city: "$city",
          area: "$area",
          disease: "$disease",
        },
        totalCases: { $sum: "$cases" },
        recordCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        city: "$_id.city",
        area: "$_id.area",
        disease: "$_id.disease",
        totalCases: 1,
        recordCount: 1,
      },
    },
  ]);

  return result;
}

module.exports = { groupCases };