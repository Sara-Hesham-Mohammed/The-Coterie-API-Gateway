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
    target: `http://localhost:${portNum}/`, // target host with the same base path
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

//for testing purposes, this endpoint simulates a 30-second async task
app.use("/", async (req, res) => {
  console.log("IN EL BTA3");
  
});

app.use("/TEST", async (req, res) => {
 console.log(`[${new Date().toISOString()}] TEST endpoint hit - Method: ${req.method}, IP: ${req.ip}`);
 res.json({ 
   message: "TEST endpoint working", 
   timestamp: new Date().toISOString(),
   method: req.method 
 });
});
/***********************/
app.listen(PORT, async () => {
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
