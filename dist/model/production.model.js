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
exports.ProductionCompany = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ProductionCompanySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    founderName: { type: String },
    about: { type: String },
    email: { type: String, required: true },
    contactNumber: { type: String },
    password: { type: String },
    logo: { type: String },
    backgroundImage: {
        type: String,
        default: "https://via.placeholder.com/150",
    },
    membership: { type: String, default: "free" },
    isMembership: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    socialMedia: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        youtube: { type: String },
    },
}, {
    timestamps: true,
});
exports.ProductionCompany = mongoose_1.default.model("ProductionCompany", ProductionCompanySchema);
