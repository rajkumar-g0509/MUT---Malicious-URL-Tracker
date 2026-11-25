const CONFUSABLES = require("../config/confusables.json");
function findConfusables(hostname) {
  const detected = [];
  for (const ch of hostname) {
    for (const ascii in CONFUSABLES) {
      if (CONFUSABLES[ascii].includes(ch)) {
        detected.push({ char: ch, looksLike: ascii });
      }
    }
  }
  return detected;
}
function analyzeHomoglyph(url) {
  try {
    const hostname = new URL(url).hostname;
    const isPunycode = hostname.startsWith("xn--");
    const confusables = findConfusables(hostname);
    let score = 0;
    if (isPunycode) score += 40;
    score += confusables.length * 20;
    return {
      hostname,
      homoglyphScore: Math.min(score, 100),
      confusables
    };
  } catch {
    return { homoglyphScore: 0, confusables: [] };
  }
}
module.exports = analyzeHomoglyph;