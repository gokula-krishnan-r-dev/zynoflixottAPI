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
const message_model_1 = __importDefault(require("../model/message.model"));
const room_model_1 = __importDefault(require("../model/room.model"));
const BaseController_1 = __importDefault(require("../service/BaseController"));
class MessageController extends BaseController_1.default {
    constructor() {
        super(...arguments);
        this.joinRoom = (_a) => __awaiter(this, [_a], void 0, function* ({ roomId, userId, name }) {
            var _b;
            try {
                if (!roomId || !userId || !name) {
                    console.log("Invalid roomId, userId, or name");
                    return;
                }
                this.socket.join(roomId);
                console.log(userId, "userId");
                const savedRoomId = roomId;
                let skt = this.socket.broadcast;
                skt = savedRoomId ? skt.to(savedRoomId) : skt;
                const roomCount = ((_b = this.socket.adapter.rooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.size) || 0;
                console.log("Number of users in room:", roomCount);
                const room = yield room_model_1.default.findOne({ roomId });
                if (room) {
                    skt.emit("get-user", { roomId, isOnline: true, userId });
                    return;
                }
                skt.emit("get-user", { roomId, isOnline: true, userId });
            }
            catch (error) {
                console.error("Error saving message:", error);
            }
        });
        this.sendMessage = (_c) => __awaiter(this, [_c], void 0, function* ({ content, roomId, sender }) {
            try {
                let skt = this.socket.broadcast;
                skt = roomId ? skt.to(roomId) : skt;
                const newMessage = new message_model_1.default({
                    content,
                    roomId,
                    room: roomId,
                    userId: sender,
                    sender,
                });
                yield newMessage.save();
                skt.emit("message-from-server", { content, sender });
            }
            catch (error) {
                console.error("Error saving message:", error);
            }
        });
    }
}
exports.default = MessageController;
