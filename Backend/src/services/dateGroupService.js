const Case = require("../models/Case");

async function groupByDate(city, disease) {
  const result = await Case.aggregate([
    {
      $match: { city, disease }
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          }
        },
        totalCases: { $sum: "$cases" }
      }
    },
    {
      $sort: { "_id.date": 1 }
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        totalCases: 1
      }
    }
  ]);

  return result;
}

module.exports = { groupByDate };