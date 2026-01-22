import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import routor from "./src/routes/router";
import Chat from "./src/Chat";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";

// Check if running in production (Vercel)
const isProduction = process.env.NODE_ENV === "production";

// Configure environment variables
dotenv.config();

// Attempt to load router and Chat modules dynamically in production
let routerModule: any;
let ChatModule: any;

try {
  if (isProduction) {
    // In production, check for compiled JS files
    try {
      routerModule = require("./src/routes/router").default;
    } catch (err) {
      console.error("Error loading router module:", err);
      routerModule = null;
    }

    try {
      ChatModule = require("./src/Chat").default;
    } catch (err) {
      console.error("Error loading Chat module:", err);
      ChatModule = null;
    }
  } else {
    // In development, use the imported values
    routerModule = routor;
    ChatModule = Chat;
  }
} catch (error) {
  console.error("Module loading error:", error);
}

const MONGODB_URI =
  "mongodb://localhost:27017/ott";
// "mongodb+srv://gokul:UPw3fCb6kDmF5CsE@cluster0.klfb9oe.mongodb.net/ott?retryWrites=true&w=majority"
mongoose.connect(MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const connectToMongoDB = mongoose.connection;

connectToMongoDB.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

connectToMongoDB.once("open", () => {
  console.log("Connected to MongoDB");
});

// Initialize Chat if available
if (ChatModule) {
  try {
    ChatModule();
  } catch (error) {
    console.error("Error initializing Chat module:", error);
  }
}

const app: Express = express();
const port = process.env.PORT || 8080;
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://13.200.249.153",
        "http://localhost:3000",
        "http://13.200.249.153:3000",
        "http://zynoflixott.com",
        "http://www.zynoflixott.com",
        "http://zynoflixott.com:3000",
        "http://www.zynoflixott.com:3000",
        "https://zynoflixott.com",
        "https://www.zynoflixott.com",
        "http://localhost:3001",
        "https://zynoflixott-web.vercel.app",
        "https://2a9e-203-192-241-134.ngrok-free.app",
        "https://zynoflix-ott-api.vercel.app",
        "https://zynoflix-ott-api-*.vercel.app",
        "https://api.zynoflixott.com",
        "http://api.zynoflixott.com",
        "https://www.api.zynoflixott.com",
        "http://www.api.zynoflixott.com",
      ];

      // Check if origin is in allowedOrigins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check for wildcard matches (for subdomains)
      for (const pattern of allowedOrigins) {
        if (
          pattern.includes("*") &&
          new RegExp(pattern.replace("*", ".*")).test(origin)
        ) {
          return callback(null, true);
        }
      }

      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept,Origin",
    exposedHeaders: "Content-Range,X-Content-Range",
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running");
});

// Add a health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "API is operational",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(bodyParser.json({ limit: "50mb" })); // Reduced limit for better performance
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Only attach the router if it was loaded successfully
if (routerModule) {
  app.use("/api", routerModule);
} else {
  app.use("/api", (req: Request, res: Response) => {
    res.status(500).json({ error: "API routes not available" });
  });
}

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
