"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const secret = process.env.JWT_SECRET || "demo";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.userId = decoded.userId; // Add userId to request object
        next();
    }
    catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};
exports.authMiddleware = authMiddleware;
