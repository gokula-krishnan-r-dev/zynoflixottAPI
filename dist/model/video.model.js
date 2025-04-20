"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const videoSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user_profile",
    },
    followerCount: {
        type: Number,
        default: 0,
    },
    certification: {
        type: String,
        default: "U",
    },
    thumbnail: String,
    preview_video: String,
    original_video: String,
    language: [
        {
            type: String,
            default: "English",
        },
    ],
    views: {
        type: Number,
        default: 0,
    },
    viewsId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "View",
        },
    ],
    likesId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Like",
        },
    ],
    status: {
        type: Boolean,
        default: true,
    },
    duration: String,
    category: {
        type: [String],
        default: ["General"],
    },
    is_banner_video: {
        type: Boolean,
        default: false,
    },
    is_active_video: {
        type: Boolean,
        default: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    created_by_id: {
        type: String,
        required: true,
    },
    created_by_name: {
        type: String,
        required: true,
    },
    processedImages: {
        type: Object,
        default: {},
    },
}, {
    timestamps: true,
});
const VideoModel = mongoose_1.default.model("videos", videoSchema);
exports.default = VideoModel;
