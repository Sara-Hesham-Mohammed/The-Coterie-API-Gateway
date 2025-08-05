import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

// App setup
const app = express();
dotenv.config({
  path: "./config/.env",
});
const PORT = process.env.PORT;

/********** PROXY SET UP *************/
const setProxy = (portNum) => {
  return createProxyMiddleware({
    target: `http://0.0.0.0:${portNum}/`, // target host with the same base path
    changeOrigin: true, // needed for virtual hosted sites
  });
};
//DATABASE PROXY
const databaseProxy = setProxy(3001);
//EXTERNAL API PROXY
const eventsAPIProxy = setProxy(3002);
//GraphRec API PROXY
const recSysAPIProxy = setProxy(8000);
//Embeddings and Clustering API PROXY
const clusterAPIProxy = setProxy(8080);
//Embeddings and Clustering API PROXY
const embedAPIProxy = setProxy(5000);

//these are the main (BASE) endpoints, anything extra should be in their OWN files NOT HERE
app.use("/database", databaseProxy);
app.use("/recommendations", recSysAPIProxy);
app.use("/events", eventsAPIProxy);
app.use("/cluster", clusterAPIProxy);
app.use("/embed", embedAPIProxy);

//for testing purposes
app.get("/", (req, res) => {
    console.log("Root endpoint hit - sending welcome message.");
    res.send("Welcome to the API Gateway! Use /TEST for the test endpoint.");
});

app.use("/TEST", async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] TEST endpoint hit - Method: ${
      req.method
    }, IP: ${req.ip}`
  );
  console.log("About to send JSON response..."); // New log
  res.json({
    message: "TEST endpoint working",
    timestamp: new Date().toISOString(),
    method: req.method,
  });
  console.log("JSON response sent (or attempted)..."); // New log
});
/***********************/
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`API GATEWAY Listening on port ${PORT}`);
});

// App failsafes? ig
app.use((req, res, next) => {
  console.log("Request received");
  next();
});
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
