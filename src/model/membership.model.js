"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const membershipSchema = new mongoose_1.default.Schema({
    user_id: {
        type: String,
        required: true,
    },
    membershipType: {
        type: String,
        default: "monthly",
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    isVideo_uploaded: {
        type: Boolean,
        default: false,
    },
    paymentStatus: {
        type: String,
        default: "pending",
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        default: "card",
    },
}, {
    timestamps: true,
});
const MembershipModel = mongoose_1.default.model("Membership", membershipSchema);
exports.default = MembershipModel;
