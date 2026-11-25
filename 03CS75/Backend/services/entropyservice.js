const { suspiciousKeywords } = require("../config/keywords.json");

function analyzeURLEntropy(url) {
  try {
    const u = new URL(url);
    const full = u.href;
    const hostname = u.hostname;

    let score = 0;

    if (full.length > 100) score += 20;
    if (hostname.split(".").length > 4) score += 20;

    suspiciousKeywords.forEach(k => {
      if (full.toLowerCase().includes(k)) score += 10;
    });

    if (/[a-zA-Z0-9]{20,}/.test(full)) score += 20;

    return { entropyScore: Math.min(score, 100) };

  } catch {
    return { entropyScore: 0 };
  }
}

module.exports = analyzeURLEntropy;