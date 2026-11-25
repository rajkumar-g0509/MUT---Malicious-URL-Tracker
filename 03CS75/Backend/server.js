const connectDB = require("./config/db");
connectDB();
const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");
const dashboardRoute = require("./routes/dashboard");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/analyze", analyzeRoute);
app.use("/api/dashboard", dashboardRoute);
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`MUT Backend running on http://localhost:${PORT}`);
});