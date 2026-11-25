console.log("PhishBlock Analyze Route Loaded");
const express = require("express");
const router = express.Router();
const Scan = require("../models/Scan");
const advanced = require("../services/advancedAnalyzer");
const threatChecker = require("../services/threatChecker");
router.post("/", async (req, res) => {

  const { url } = req.body;
  console.log("Incoming URL:", url);

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }


  try {

    const result = advanced.analyze(url);

    if (result.error) {
      return res.status(400).json(result);
    }

    const threatResult = await threatChecker.checkThreat(url);

    const {
      homoglyphScore,
      entropyScore,
      brandScore,
      domainScore
    } = result.features;

    let { finalScore, verdict } = result.fused;

    if (threatResult.threatDetected) {
      finalScore = 95;
      verdict = "High Risk";
    }

    await Scan.create({
      url,
      homoglyphScore,
      entropyScore,
      brandScore,
      domainScore,
      finalScore,
      verdict
    });

    res.json({
      url,
      features: result.features,
      fused: { finalScore, verdict },
      threatIntel: threatResult
    });

  } catch (err) {

    res.status(500).json({
      error: "Internal server error"
    });

  }

});
module.exports = router;