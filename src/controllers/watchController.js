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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchLater = exports.watchLater = void 0;
const watch_model_1 = require("../model/watch.model");
const watchLater = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { video_id } = req.body;
        if (!video_id)
            return res.status(200).json({ message: "video_id is required" });
        if (!req.userId)
            return res.status(200).json({ message: "user_id is required" });
        const video = yield watch_model_1.watchModel.findOne({
            user_id: req.userId,
            video_id,
        });
        // delete if already exits
        if (video) {
            yield watch_model_1.watchModel.findByIdAndDelete(video._id);
            return res
                .status(200)
                .json({ message: "video removed from watch later" });
        }
        if (video)
            return res
                .status(200)
                .json({ message: "video already in watch later", video });
        const watch = new watch_model_1.watchModel({
            user_id: req.userId,
            video_id,
            user: req.userId,
            video: video_id,
        });
        yield watch.save();
        res.status(200).json({ message: "video added to watch later" });
    }
    catch (error) {
        console.log(error, "error");
        res
            .status(400)
            .json({ message: "failed to add video to watch later list" });
    }
});
exports.watchLater = watchLater;
const getWatchLater = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const watch = yield watch_model_1.watchModel.find({ user_id: req.userId });
        res.status(200).json(watch);
    }
    catch (error) {
        res.status(400).json({ message: "failed to get watch later list" });
    }
});
exports.getWatchLater = getWatchLater;
