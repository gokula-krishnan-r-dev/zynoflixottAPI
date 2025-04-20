"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tvOsSchema = new mongoose_1.Schema({
    accessToken: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    success: {
        type: Boolean,
        default: false,
    },
    uuid: {
        type: String,
    },
    otp: {
        type: String,
    },
    userId: {
        type: String,
        ref: "User",
    },
});
const TvOsModel = (0, mongoose_1.model)("TvOs", tvOsSchema);
exports.default = TvOsModel;
