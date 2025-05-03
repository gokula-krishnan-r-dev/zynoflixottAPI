"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./src/routes/router"));
const Chat_1 = __importDefault(require("./src/Chat"));
const body_parser_1 = __importDefault(require("body-parser"));
// Check if running in production (Vercel)
const isProduction = process.env.NODE_ENV === "production";
// Configure environment variables
dotenv_1.default.config();
// Attempt to load router and Chat modules dynamically in production
let routerModule;
let ChatModule;
try {
    if (isProduction) {
        // In production, check for compiled JS files
        try {
            routerModule = require("./src/routes/router").default;
        }
        catch (err) {
            console.error("Error loading router module:", err);
            routerModule = null;
        }
        try {
            ChatModule = require("./src/Chat").default;
        }
        catch (err) {
            console.error("Error loading Chat module:", err);
            ChatModule = null;
        }
    }
    else {
        // In development, use the imported values
        routerModule = router_1.default;
        ChatModule = Chat_1.default;
    }
}
catch (error) {
    console.error("Module loading error:", error);
}
const MONGODB_URI = "mongodb+srv://gokula2323:wqSbxeNfSxVd1eyw@cluster0.vd91zsm.mongodb.net/ott?retryWrites=true&w=majority";
// "mongodb+srv://gokul:UPw3fCb6kDmF5CsE@cluster0.klfb9oe.mongodb.net/ott?retryWrites=true&w=majority"
mongoose_1.default.connect(MONGODB_URI, {
// useNewUrlParser: true,
// useUnifiedTopology: true,
});
const connectToMongoDB = mongoose_1.default.connection;
connectToMongoDB.on("error", console.error.bind(console, "MongoDB connection error:"));
connectToMongoDB.once("open", () => {
    console.log("Connected to MongoDB");
});
// Initialize Chat if available
if (ChatModule) {
    try {
        ChatModule();
    }
    catch (error) {
        console.error("Error initializing Chat module:", error);
    }
}
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
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
            if (pattern.includes("*") &&
                new RegExp(pattern.replace("*", ".*")).test(origin)) {
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
}));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server is running");
});
// Add a health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "API is operational",
        timestamp: new Date().toISOString(),
        cors: "enabled",
        environment: process.env.NODE_ENV || "development",
    });
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.use(body_parser_1.default.json({ limit: "50mb" })); // Reduced limit for better performance
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
// Only attach the router if it was loaded successfully
if (routerModule) {
    app.use("/api", routerModule);
}
else {
    app.use("/api", (req, res) => {
        res.status(500).json({ error: "API routes not available" });
    });
}
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map