"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = exports.getMessageById = exports.getRoom = void 0;
const room_model_1 = __importDefault(require("../model/room.model"));
const message_model_1 = __importDefault(require("../model/message.model"));
const crypto_1 = require("crypto");
const getRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const rooms = yield room_model_1.default.find({
            userId: { $in: [userId] },
        }).sort({ updatedAt: -1 });
        if (!rooms) {
            return res.status(404).json({ message: "Room not found" });
        }
        const showonlyUserIdhasuserId = rooms.map((room) => {
            return room.userId.map((id) => {
                if (id === userId) {
                    return room;
                }
            });
        });
        return res.status(200).json(showonlyUserIdhasuserId.map((room) => room[0]));
    }
    catch (error) {
        console.error("Error getting room:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getRoom = getRoom;
const getMessageById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId } = req.params;
        if (!roomId)
            return res.status(400).json({ message: "Room ID is required" });
        const messages = yield message_model_1.default.find({ roomId }).populate("userId");
        if (!messages) {
            return res.status(404).json({ message: "Messages not found" });
        }
        return res.status(200).json(messages);
    }
    catch (error) {
        console.error("Error getting message:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMessageById = getMessageById;
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userIds, name } = req.body;
        if (!userIds)
            return res.status(400).json({ message: "User IDs are required" });
        const room = new room_model_1.default({
            userId: userIds,
            user: userIds,
            capacity: userIds.length,
            roomId: (0, crypto_1.randomUUID)().split("-").join(""),
            name,
        });
        yield room.save();
        return res.status(201).json(room);
    }
    catch (error) {
        console.error("Error creating room:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createRoom = createRoom;
