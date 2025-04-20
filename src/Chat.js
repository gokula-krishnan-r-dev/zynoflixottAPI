"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const socket_1 = __importDefault(require("./socket"));
const chat = require("express")();
// const http = require("http").createServer(chat);
const http_1 = __importDefault(require("http"));
// const io = require("socket.io")(http);
const PORT = process.env.PORT || 3003;
const httpServer = http_1.default.createServer(chat);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:3000",
            "*",
            "http://localhost:3000/chat",
            "zynoflixott.com",
            "www.zynoflixott.com",
            "https://zynoflixott.com",
            "https://www.zynoflixott.com",
            "http://zynoflixott.com",
            "http://www.zynoflixott.com",
            "https://chat.zynoflixott.com",
            "http://chat.zynoflixott.com",
            "https://zynoflixott.com/",
            "http://localhost:3001",
            "https://zynoflixott-web.vercel.app",
        ],
    },
});
const Chat = () => {
    io.on("connection", socket_1.default);
    httpServer.listen(PORT, () => {
        console.log("Server is running at http://localhost:3003");
    });
    return chat;
};
exports.default = Chat;
