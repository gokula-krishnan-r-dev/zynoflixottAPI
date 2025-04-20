"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = "mongodb+srv://gokul:UPw3fCb6kDmF5CsE@cluster0.klfb9oe.mongodb.net/?retryWrites=true&w=majority";
mongoose_1.default.connect(MONGODB_URI, {
// useNewUrlParser: true,
// useUnifiedTopology: true,
});
const connectToMongoDB = mongoose_1.default.connection;
connectToMongoDB.on("error", console.error.bind(console, "MongoDB connection error:"));
connectToMongoDB.once("open", () => {
    console.log("Connected to MongoDB");
});
exports.default = connectToMongoDB;
