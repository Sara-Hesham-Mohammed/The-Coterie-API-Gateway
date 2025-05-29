import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware, pkg } from 'http-proxy-middleware';
const { Filter, Options, RequestHandler } = pkg;


// App setup
const app = express();
dotenv.config({
    path: "./config/.env"
});
const PORT = process.env.PORT;

/********** PROXY SET UP *************/
const setProxy = (portNum)=>{
    return createProxyMiddleware({
        target: `http://localhost:${portNum}/`, // target host with the same base path
        changeOrigin: true, // needed for virtual hosted sites
      });
    
}
//DATABASE PROXY
const databaseProxy = setProxy(3001);
//EXTERNAL API PROXY
const externalAPIsProxy = setProxy(3002);
//GraphRec API PROXY
const graphRecAPIProxy = setProxy(8000);
//Embeddings and Clustering API PROXY
const embedClusterAPIProxy = setProxy(8080);

//these are the main (BASE) endpoints, anything extra should be in their OWN files NOT HERE 
app.use('/database', databaseProxy); 
app.use('/graphRec', graphRecAPIProxy); 
app.use('/externalAPIs', externalAPIsProxy); 
app.use('/embedClusterAPIProxy', embedClusterAPIProxy); 



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
