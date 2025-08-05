import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

// Load environment variables
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT || 3000; // Fallback port if .env is missing

// App setup
const app = express();

/********** PROXY SET UP *************/
const setProxy = (host, portNum) => {
  let url_target;
  if(host){
    url_target = `http://${host}:${portNum}`;
  }else{
    url_target = `http://localhost:${portNum}`;

  }
  return createProxyMiddleware({
    target: url_target, // Prefer localhost over 0.0.0.0
    changeOrigin: true,
    ws: true, // support websockets
    logLevel: "debug", // helpful for debugging
    onError(err, req, res) {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Proxy error", details: err.message });
    },
  });
};

// all PROXIES
const databaseProxy = setProxy('db-api-container',3001);
const eventsAPIProxy = setProxy('events-api-container',3002);
const recSysAPIProxy = setProxy('rec-engine-container',8000);
const clusterAPIProxy = setProxy('clustering-container',8080);
const embedAPIProxy = setProxy('embeddings-container',5000);

// Proxy endpoints
app.use("/database", databaseProxy);
app.use("/recommendations", recSysAPIProxy);
app.use("/events", eventsAPIProxy);
app.use("/cluster", clusterAPIProxy);
app.use("/embed", embedAPIProxy);

// Root test
app.get("/", (req, res) => {
  console.log("Root endpoint hit - sending welcome message.");
  res.send("Welcome to the API Gateway! Use /TEST for the test endpoint.");
});

// Test endpoint
app.use("/TEST", (req, res) => {
  console.log(`[${new Date().toISOString()}] TEST endpoint hit`);
  res.json({
    message: "TEST endpoint working",
    timestamp: new Date().toISOString(),
    method: req.method,
  });
});

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Request received for ${req.url}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API GATEWAY Listening on port ${PORT}`);
});
