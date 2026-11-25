const express = require("express");
const router = express.Router();
const Scan = require("../models/Scan");

router.get("/stats", async (req, res) => {

  try {

    const totalScans = await Scan.countDocuments();

    const highRisk = await Scan.countDocuments({
      verdict: "High Risk"
    });

    const suspicious = await Scan.countDocuments({
      verdict: "Suspicious"
    });

    const safe = await Scan.countDocuments({
      verdict: "Safe"
    });

    const recentScans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalScans,
      highRisk,
      suspicious,
      safe,
      recentScans
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Dashboard error" });

  }

});

router.get("/analytics", async (req, res) => {

  try {

    const safe = await Scan.countDocuments({ verdict: "Safe" });
    const suspicious = await Scan.countDocuments({ verdict: "Suspicious" });
    const highRisk = await Scan.countDocuments({ verdict: "High Risk" });

    res.json({
      riskDistribution: {
        safe,
        suspicious,
        highRisk
      }
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Analytics error" });

  }

});

module.exports = router;