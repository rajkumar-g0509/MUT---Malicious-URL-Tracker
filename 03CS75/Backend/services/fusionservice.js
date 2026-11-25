const config = require("../config/scoring.json");
function fuseRisk(homo, entropy, brand, domain, keyword) {
  if (brand >= 80) {
    return { finalScore: 95, verdict: "High Risk" };
  }
  if (keyword >= 20 && (entropy >= 20 || homo >= 20)) {
    return { finalScore: 80, verdict: "High Risk" };
  }
  let signals = 0;
  if (homo >= 20) signals++;
  if (entropy >= 20) signals++;
  if (keyword >= 20) signals++;
  if (domain >= 20) signals++;
  if (signals >= 2) {
    return { finalScore: 70, verdict: "Suspicious" };
  }
  const finalScore = Math.round(
    (0.25 * homo) +
    (0.25 * entropy) +
    (0.2 * brand) +
    (0.15 * domain) +
    (0.15 * keyword)
  );
  let verdict = "Safe";
  if (finalScore > 70) verdict = "High Risk";
  else if (finalScore > 35) verdict = "Suspicious";
  return { finalScore, verdict };
}