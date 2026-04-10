const fs = require("fs");
const csv = require("csv-parser");

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const { area, city, date } = row;

        // ✅ Case 1: Already normalized format
        if (row.disease && row.cases) {
          const casesValue = parseInt(row.cases);

          if (!isNaN(casesValue) && casesValue > 0) {
            results.push({
              area,
              city,
              date,
              disease: row.disease.toLowerCase(),
              cases: casesValue,
            });
          }
        }

        // ✅ Case 2: Wide format (dynamic disease columns)
        else {
          const { area, city, date, ...rest } = row;

          Object.keys(rest).forEach((key) => {
            const value = parseInt(rest[key]);

            if (!isNaN(value) && value > 0) {
              results.push({
                area,
                city,
                date,
                disease: key
                  .replace("Cases", "") // remove "Cases"
                  .replace(/([A-Z])/g, " $1") // split camelCase
                  .trim()
                  .toLowerCase(),
                cases: value,
              });
            }
          });
        }
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};

module.exports = { parseCSV };