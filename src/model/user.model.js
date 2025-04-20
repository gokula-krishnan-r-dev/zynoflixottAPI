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
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserProfileSchema = new mongoose_1.Schema({
    profilePic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    contact: { type: String },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    backgroundPic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    followingId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "user_profile",
        },
    ],
    description: {
        type: String,
        default: " voluptatum voluptate distinctio, nostrum hic voluptatibus nisi. Eligendi voluptatibus numquam maxime voluptatem labore similique qui illo est magnam adipisci autem quisquam, quia incidunt excepturi, possimus odit praesentium? Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus neque praesentium voluptates atque quisquam ratione voluptatem vitae ducimus cupiditate necessitatibus? Expedita odit eius, adipisci vero cupiditate quas ea asperiores.",
    },
    following: Number,
    membership: { type: String, default: "free" },
    isMembership: { type: Boolean, default: false },
    membershipId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Membership" },
    is_active: { type: Boolean, default: true },
}, { timestamps: true });
const User = mongoose_1.default.model("user_profile", UserProfileSchema);
exports.User = User;
