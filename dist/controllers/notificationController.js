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
exports.GetNotificationById = exports.GetNotification = exports.SendNotification = void 0;
const notification_model_1 = __importDefault(require("../model/notification.model"));
const SendNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, message, receiver } = req.body;
    const notification = new notification_model_1.default({
        title,
        message,
        receiver,
        send: false,
        sender: req.userId,
        user: req.userId,
    });
    try {
        yield notification.save();
        res.status(201).json(notification);
    }
    catch (error) {
        res.status(500).json({ error: "" });
    }
});
exports.SendNotification = SendNotification;
const GetNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const notifications = yield notification_model_1.default
            .find({
            receiver: userId,
        })
            .populate("user")
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: "" });
    }
});
exports.GetNotification = GetNotification;
const GetNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notification_model_1.default.findById(req.params.id);
        res.status(200).json(notification);
    }
    catch (error) {
        res.status(500).json({ error: "" });
    }
});
exports.GetNotificationById = GetNotificationById;
