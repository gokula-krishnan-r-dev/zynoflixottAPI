"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const messageController_1 = __importDefault(require("./controllers/messageController"));
const sockets = (socket) => {
    console.log("User connected.");
    const messageController = new messageController_1.default(socket);
    socket.on("join-room", messageController.joinRoom);
    socket.on("send-message", messageController.sendMessage);
    // socket.on("add-heart", messageController.addHeart);
    // socket.on("typing-started", typingController.typingStarted);
    // socket.on("typing-stoped", typingController.typingStoped);
    // socket.on("new-room-created", roomController.newRoomCreated);
    // socket.on("room-removed", roomController.roomRemoved);
    // socket.on("is-online", roomController.isOnline);
    // socket.on("add-online-user", roomController.addOnlineUser);
    // socket.on("remove-online-user", roomController.removeOnlineUser);
    // socket.on("add-emote", roomController.addEmote);
    // socket.on("add-poll", roomController.addPoll);
    // socket.on("get-poll", roomController.getPoll);
    // socket.on("add-pin", roomController.addPin);
    // socket.on("off-online", roomController.offOnline);
    socket.on("disconnect", (socket) => {
        console.log("User left.", socket);
    });
};
exports.default = sockets;
