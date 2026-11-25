const brands = require("../config/brands.json");

function analyzeBrandMismatch(url) {
  try {
    const u = new URL(url);
    const hostname = u.hostname.toLowerCase();
    const full = url.toLowerCase();

    let score = 0;

    for (const brand in brands) {
      if (full.includes(brand)) {
        const officialDomains = brands[brand];

        const isOfficial = officialDomains.some(domain =>
          hostname.endsWith(domain)
        );

        if (!isOfficial) {
          score += 40;
        }
      }
    }

    return { brandScore: Math.min(score, 100) };

  } catch {
    return { brandScore: 0 };
  }
}

module.exports = analyzeBrandMismatch;