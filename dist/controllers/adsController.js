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
exports.activeAds = exports.getAds = exports.createAds = void 0;
const ads_model_1 = __importDefault(require("../model/ads.model"));
const createAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ads_video = req.files["ads_video"][0].location;
        if (!ads_video) {
            return res.status(400).json({ error: "Please provide a video" });
        }
        const { title, link } = req.body;
        if (!title || !link) {
            return res.status(400).json({ error: "Please provide a title and link" });
        }
        const ads = yield ads_model_1.default.create({
            title,
            video: ads_video,
            link,
        });
        res.status(201).json(ads);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something Went wrong!" });
    }
});
exports.createAds = createAds;
const getAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.query;
        if (query) {
            const ads = yield ads_model_1.default.find({ title: { $regex: query, $options: "i" } });
            return res.status(200).json(ads);
        }
        const ads = yield ads_model_1.default.find({});
        res.status(200).json(ads);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something Went wrong!" });
    }
});
exports.getAds = getAds;
const activeAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const ads = yield ads_model_1.default.findById(id);
        if (!ads) {
            return res.status(404).json({ error: "Ads not found" });
        }
        ads.active = !ads.active;
        yield ads.save();
        res.status(200).json(ads);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something Went wrong!" });
    }
});
exports.activeAds = activeAds;
