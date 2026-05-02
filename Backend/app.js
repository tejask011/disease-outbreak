require("./src/config/env");
const connectDB = require("./src/config/db");
connectDB();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

var app = express();

// Middleware
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// ========== ROUTES ==========

// CSV Upload (symptom-level data)
app.use("/api/upload", require("./src/routes/uploadRoutes"));

// Manual data entry
app.use("/api/data", require("./src/routes/dataRoutes"));

// Risk prediction engine
app.use("/api/risk", require("./src/routes/riskRoutes"));

// Aggregation & trends
app.use("/api/group", require("./src/routes/groupRoutes"));
app.use("/api/date-group", require("./src/routes/dateGroupRoutes"));
app.use("/api/trend", require("./src/routes/trendRoutes"));

const aiRoutes = require("./src/routes/aiRoutes");

app.use("/api", aiRoutes);
// Test route
app.get("/", (req, res) => {
  res.send("🦠 Risk Outbreak API Running");
});

// 404 handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});



module.exports = app;