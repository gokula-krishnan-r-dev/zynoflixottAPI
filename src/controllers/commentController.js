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
exports.getCommentByVideoId = exports.getCommentById = exports.getComment = exports.CreateComment = void 0;
const comment_model_1 = __importDefault(require("../model/comment.model"));
const CreateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create a new comment
        const comment = yield comment_model_1.default.create({
            userId: req.userId,
            videoId: req.params.video_id,
            content: req.body.content,
            user: req.userId,
        });
        res.status(201).json({ comment });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Somthing Went Wrong!" });
    }
});
exports.CreateComment = CreateComment;
const getComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all comments
        const comments = yield comment_model_1.default.find();
        res.status(200).json({ comments });
    }
    catch (error) {
        res.status(500).json({ error: "Somthing Went Wrong!" });
    }
});
exports.getComment = getComment;
const getCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get a comment by ID
        const comment = yield comment_model_1.default.findById(req.params.id);
        res.status(200).json({ comment });
    }
    catch (error) {
        res.status(500).json({ error: "Somthing Went Wrong!" });
    }
});
exports.getCommentById = getCommentById;
const getCommentByVideoId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get all comments by video ID
        const comments = yield comment_model_1.default.find({
            videoId: req.params.video_id,
        })
            .populate("user")
            .sort({ createdAt: -1 });
        res.status(200).json({ comments });
    }
    catch (error) {
        res.status(500).json({ error: "Somthing Went Wrong!" });
    }
});
exports.getCommentByVideoId = getCommentByVideoId;
