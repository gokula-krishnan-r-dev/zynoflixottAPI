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
dotenv_1.default.config();
const MONGODB_URI = "mongodb+srv://gokula2323:wqSbxeNfSxVd1eyw@cluster0.vd91zsm.mongodb.net/ott?retryWrites=true&w=majority";
// "mongodb+srv://gokul:UPw3fCb6kDmF5CsE@cluster0.klfb9oe.mongodb.net/ott?retryWrites=true&w=majority"
mongoose_1.default.connect(MONGODB_URI, {
// useNewUrlParser: true,
// useUnifiedTopology: true,
});
dotenv_1.default.config();
const connectToMongoDB = mongoose_1.default.connection;
connectToMongoDB.on("error", console.error.bind(console, "MongoDB connection error:"));
connectToMongoDB.once("open", () => {
    console.log("Connected to MongoDB");
});
(0, Chat_1.default)();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
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
            // Add other origins if needed, potentially from environment variables
        ];
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Allow standard methods including OPTIONS for preflight
    allowedHeaders: "Content-Type,Authorization,X-Requested-With,Accept,Origin", // Allow common headers
}));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use(body_parser_1.default.json({ limit: "22200000mb" })); // Adjust the limit as needed
app.use(body_parser_1.default.urlencoded({ limit: "522222222222220mb", extended: true }));
app.use("/api", router_1.default);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
