import express, { json } from "express";
import path, { dirname } from "path"
import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import {serve} from "inngest/express"
import { inngest, functions } from "./lib/inngest.js";
const app = express();
const isVercel = process.env.VERCEL === "1";

const __dirname = path.resolve();

app.use(express.json())
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))


app.use("/api/ingest",serve({client:inngest, functions}));

app.get("/health",(req,res)=>{
    res.status(200).json({msg:"success from backend (health)"})
})

app.get("/",(req,res)=>{
    res.status(200).json({msg:"backend is running"})
})

app.get("/book",(req,res)=>{
    res.status(200).json({msg:"success from backend (book)"})
})

// make app ready for deployment

if(ENV.NODE_ENV == "production" && !isVercel){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("/{*any}",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    });
}

let isConnected = false;

app.use((req,res,next)=>{
    if(!isConnected){
        connectDB();
    }
    next();
})

const StartServer = async()=>{
    
    try {
        await connectDB();
        app.listen(ENV.PORT,()=>{
        console.log("Server is running:",ENV.PORT)
         })
    } catch (error) {
        console.error("Error",error);
    }
};

if (!isVercel) {
    StartServer();
}

export default app;