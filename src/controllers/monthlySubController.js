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
exports.uploadVideoCount = exports.updateMonthlySub = exports.getMonthlySub = exports.monthlySub = void 0;
const membership_model_1 = __importDefault(require("../model/membership.model"));
const user_model_1 = require("../model/user.model");
const Razorpay = require("razorpay");
const monthlySub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, currency, membershipType } = req.body;
    const razorpayInstance = new Razorpay({
        key_id: process.env.PAY_KEY_ID,
        key_secret: process.env.PAY_KEY_SECRET,
    });
    const options = {
        amount: amount, // amount in smallest currency unit
        currency: currency || "INR",
        receipt: "order_rcptid_11",
        payment_capture: "0",
    };
    try {
        const orderRazo = yield razorpayInstance.orders.create(options);
        const order = yield membership_model_1.default.create({
            user_id: req.userId,
            amount: options.amount,
            transactionId: orderRazo.id,
            order: orderRazo,
            membershipType,
        });
        yield order.save();
        const user = yield user_model_1.User.findById(req.userId);
        user.membership === "active";
        user.membershipId = order._id;
        user.isMembership = true;
        yield user.save();
        res.status(200).json({ order });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.monthlySub = monthlySub;
const getMonthlySub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield membership_model_1.default.find({
            user_id: req.userId,
        });
        res.status(200).json({ order });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getMonthlySub = getMonthlySub;
//  PUT update monthly subscription
const updateMonthlySub = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.userId;
        const { status, isVideo_uploaded } = req.body;
        const order = yield membership_model_1.default.findById(req.params.id);
        if (order.paymentStatus === "success") {
            res.status(400).json({ error: "Payment already done!" });
            return;
        }
        if (order.user_id !== user_id) {
            res
                .status(400)
                .json({ error: "You are not authorized to update this order!" });
            return;
        }
        order.paymentStatus = status;
        if (isVideo_uploaded) {
            order.isVideo_uploaded = isVideo_uploaded;
        }
        yield order.save();
        const user = yield user_model_1.User.findById(user_id);
        user.membership = "active";
        yield user.save();
        res.status(200).json({ order, status: "success" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.updateMonthlySub = updateMonthlySub;
const uploadVideoCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.userId;
        const order = yield membership_model_1.default.findById(req.params.id);
        if (!order) {
            res.status(400).json({ error: "No order found!" });
            return;
        }
        if (order.user_id !== user_id) {
            res
                .status(400)
                .json({ error: "You are not authorized to update this order!" });
            return;
        }
        if (order.paymentStatus !== "success") {
            res.status(400).json({ error: "Payment not done!" });
            return;
        }
        if (order.isVideo_uploaded) {
            res.status(400).json({ error: "Video already uploaded!" });
            return;
        }
        if (order.isVideo_uploaded) {
            res.status(400).json({ error: "Video already uploaded!" });
            return;
        }
        order.isVideo_uploaded = true;
        yield order.save();
        res.status(200).json({ order, status: "success" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.uploadVideoCount = uploadVideoCount;
