const knownBrands = [
  "google","gmail","youtube","facebook","instagram","whatsapp",
  "amazon","flipkart","ebay",
  "paypal","paytm","phonepe","gpay","stripe",
  "apple","icloud","microsoft","outlook","office365",
  "netflix","spotify","hotstar",
  "linkedin","twitter",
  "dropbox","adobe","salesforce",
  "zoom","slack",
  "github","gitlab",
  "aws","azure",
  "hdfc","icici","sbi","axisbank","kotak",
  "bankofamerica","wellsfargo","chase"
];

const suspiciousKeywords = [
  "login","verify","secure","account",
  "update","confirm","bank","signin"
];

const suspiciousTLDs = [
  ".xyz",".tk",".top",".gq",".ml",".cf"
];

function getDomainName(hostname) {
  return hostname.split(".")[0];
}

function normalizeDomain(domain) {
  return domain
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "l")
    .replace(/3/g, "e")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "l");
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function isLegitimateDomain(hostname, brand) {
  return (
    hostname === `${brand}.com` ||
    hostname === `www.${brand}.com` ||
    hostname.endsWith(`.${brand}.com`)
  );
}

function calculateEntropy(str) {
  const freq = {};
  for (let char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  const len = str.length;

  for (let char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

function analyzeHomoglyph(domain, normalized) {
  let score = 0;
  if (domain !== normalized) score += 40;
  if (/[0-9]/.test(domain)) score += 20;
  return Math.min(score, 100);
}

function analyzeBrand(domain, normalized, hostname) {
  let score = 0;
  let detectedBrand = null;

  for (let brand of knownBrands) {

    if (isLegitimateDomain(hostname, brand)) {
      continue;
    }

    const normalizedBrand = normalizeDomain(brand);
    const dist = levenshtein(normalized, normalizedBrand);

    if (normalized === normalizedBrand && domain !== brand) {
      return { score: 100, detectedBrand: brand };
    }

    if (dist === 1) {
      return { score: 95, detectedBrand: brand };
    }

    if (dist === 2) {
      score = Math.max(score, 80);
      detectedBrand = brand;
    }

    if (normalized.includes(normalizedBrand)) {
      score = Math.max(score, 70);
      detectedBrand = brand;
    }
  }

  return { score: Math.min(score, 100), detectedBrand };
}

function analyzeKeywords(domain) {
  let score = 0;
  suspiciousKeywords.forEach(k => {
    if (domain.includes(k)) score += 20;
  });
  return Math.min(score, 100);
}

function analyzeEntropy(domain) {
  const entropy = calculateEntropy(domain);
  if (entropy > 3.5) return 40;
  if (entropy > 3.0) return 20;
  return 0;
}

function analyzeDomain(hostname) {
  let score = 0;
  suspiciousTLDs.forEach(tld => {
    if (hostname.endsWith(tld)) score += 30;
  });
  return Math.min(score, 100);
}

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

  return { finalScore: 0, verdict: "Safe" };
}

function analyze(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    const domain = getDomainName(hostname);
    const normalized = normalizeDomain(domain);

    for (let brand of knownBrands) {
      if (isLegitimateDomain(hostname, brand)) {
        return {
          url,
          features: {
            homoglyphScore: 0,
            entropyScore: 0,
            brandScore: 0,
            domainScore: 0,
            keywordScore: 0,
            detectedBrand: brand
          },
          fused: {
            finalScore: 0,
            verdict: "Safe"
          }
        };
      }
    }

    const homoglyphScore = analyzeHomoglyph(domain, normalized);
    const entropyScore = analyzeEntropy(domain);
    const brandResult = analyzeBrand(domain, normalized, hostname);
    const brandScore = brandResult.score;
    const detectedBrand = brandResult.detectedBrand;
    const keywordScore = analyzeKeywords(domain);
    const domainScore = analyzeDomain(hostname);

    const fused = fuseRisk(
      homoglyphScore,
      entropyScore,
      brandScore,
      domainScore,
      keywordScore
    );

    return {
      url,
      features: {
        homoglyphScore,
        entropyScore,
        brandScore,
        domainScore,
        keywordScore,
        detectedBrand
      },
      fused
    };

  } catch {
    return { error: "Invalid URL" };
  }
}

module.exports = { analyze };