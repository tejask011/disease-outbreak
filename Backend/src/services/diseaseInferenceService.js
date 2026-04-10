// services/diseaseInferenceService.js

function inferDiseaseProbabilities(records) {
  let totals = {};
  let totalCases = 0;

  records.forEach((r) => {
    const disease = (r.disease || "unknown").toLowerCase();
    const cases = Number(r.cases) || 0;

    if (!totals[disease]) totals[disease] = 0;

    totals[disease] += cases;
    totalCases += cases;
  });

  let probs = {};

  for (let d in totals) {
    probs[d] = totalCases > 0 ? totals[d] / totalCases : 0;
  }

  return probs;
}

module.exports = { inferDiseaseProbabilities };