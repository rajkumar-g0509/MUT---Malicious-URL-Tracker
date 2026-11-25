const mongoose = require("mongoose");

const ScanSchema = new mongoose.Schema({
  url: String,
  homoglyphScore: Number,
  entropyScore: Number,
  brandScore: Number,
  domainScore: Number, 
  finalScore: Number,
  verdict: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Scan", ScanSchema);