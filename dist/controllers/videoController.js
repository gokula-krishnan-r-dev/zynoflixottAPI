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
exports.getCategories = exports.getLikes = exports.postVideoLike = exports.postVideoViews = exports.trendingVideos = exports.BannerVideoFromAdmin = exports.addBannerVideo = exports.searchVideo = exports.findVideoByLanguage = exports.activeBanner = exports.findVideoByCategory = exports.bannerVideo = exports.findVideoByUserId = exports.findVideoById = exports.allVideos = exports.CreateBannervideos = exports.Createvideos = exports.SearchVideo = void 0;
const uuid_1 = require("uuid");
const sharp = require("sharp");
const video_model_1 = __importDefault(require("../model/video.model"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_1 = require("../service/db/s3/s3");
const banner_model_1 = __importDefault(require("../model/banner.model"));
const view_model_1 = __importDefault(require("../model/view.model"));
const like_model_1 = __importDefault(require("../model/like.model"));
// Function to upload image to S3 after resizing
const uploadImageToS3 = (imageBuffer, options) => __awaiter(void 0, void 0, void 0, function* () {
    const key = (0, uuid_1.v4)() + ".jpeg";
    const uploadParams = {
        Bucket: s3_1.bucketName,
        Body: imageBuffer,
        ContentType: options.contentType,
        Key: options.path + key,
    };
    const command = new client_s3_1.PutObjectCommand(uploadParams);
    yield s3_1.s3.send(command);
    return key;
});
// Function to resize and compress image
const resizeAndCompressImage = (imageBuffer, options) => __awaiter(void 0, void 0, void 0, function* () {
    return yield sharp(imageBuffer)
        .resize(options.resize)
        .jpeg(options.jpeg)
        .toBuffer();
});
const SearchVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        console.log(error);
        res.json({
            error: "somthing went wrong !",
        });
    }
});
exports.SearchVideo = SearchVideo;
// Route : /create_videos
const Createvideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, language, status, duration, category, is_feature_video, user, created_by_id, created_by_name, } = req.body;
        // Assuming thumbnail, preview_video, and orginal_video are available in req.files
        const thumbnail = req.files["thumbnail"][0].location;
        const preview_video = req.files["preview_video"][0].location;
        const original_video = req.files["orginal_video"][0].location;
        // Define configurations for image qualities
        const imageQualities = {
            medium: { resize: { width: 480, height: 360 }, jpeg: { quality: 70 } },
            small: { resize: { width: 110, height: 100 }, jpeg: { quality: 50 } },
            high: { resize: { width: 720, height: 540 }, jpeg: { quality: 90 } },
        };
        // Fetch the image from the S3 URL and convert to Buffer
        let fetchedImage = yield fetch(thumbnail);
        let originalImageBuffer = Buffer.from(yield fetchedImage.arrayBuffer());
        // Process each image quality configuration
        const processedImages = {};
        for (const [quality, options] of Object.entries(imageQualities)) {
            const compressedImageBuffer = yield resizeAndCompressImage(originalImageBuffer, options);
            const s3UploadResult = yield uploadImageToS3(compressedImageBuffer, {
                contentType: "image/jpeg",
                path: "thumbnail_ott/compressed/",
            });
            processedImages[quality] = {
                caption: "caption",
                path: s3UploadResult,
                width: options.resize.width,
                height: options.resize.height,
                type: "image/jpeg",
            };
        }
        const newVideo = yield video_model_1.default.create({
            title,
            description,
            thumbnail,
            preview_video,
            original_video,
            language,
            user,
            status,
            duration,
            category,
            is_feature_video,
            created_by_id,
            created_by_name,
            processedImages,
        });
        res.status(201).json({ video: newVideo });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.Createvideos = Createvideos;
const CreateBannervideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, language, status, duration, category, created_by_id, created_by_name, } = req.body;
        // Assuming thumbnail, preview_video, and orginal_video are available in req.files
        const thumbnail = req.files["thumbnail"][0].location;
        const preview_video = req.files["preview_video"][0].location;
        // Define configurations for image qualities
        const imageQualities = {
            medium: { resize: { width: 480, height: 360 }, jpeg: { quality: 70 } },
            small: { resize: { width: 110, height: 100 }, jpeg: { quality: 50 } },
            high: { resize: { width: 720, height: 540 }, jpeg: { quality: 90 } },
        };
        // Fetch the image from the S3 URL and convert to Buffer
        let fetchedImage = yield fetch(thumbnail);
        let originalImageBuffer = Buffer.from(yield fetchedImage.arrayBuffer());
        // Process each image quality configuration
        const processedImages = {};
        for (const [quality, options] of Object.entries(imageQualities)) {
            const compressedImageBuffer = yield resizeAndCompressImage(originalImageBuffer, options);
            const s3UploadResult = yield uploadImageToS3(compressedImageBuffer, {
                contentType: "image/jpeg",
                path: "thumbnail_ott/compressed/",
            });
            processedImages[quality] = {
                caption: "caption",
                path: s3UploadResult,
                width: options.resize.width,
                height: options.resize.height,
                type: "image/jpeg",
            };
        }
        const newVideo = yield video_model_1.default.create({
            title,
            description,
            thumbnail,
            preview_video,
            language,
            status,
            duration,
            category,
            is_banner_video: true,
            created_by_id,
            created_by_name,
            processedImages,
        });
        res.status(201).json({ video: newVideo });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.CreateBannervideos = CreateBannervideos;
// Get all videos
const allVideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videos = yield video_model_1.default.find({})
            .populate("viewsId")
            .populate("likesId")
            .populate("user");
        res.status(200).json({ videos });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.allVideos = allVideos;
// find video by id
const findVideoById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.findById(req.params.video_id);
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.findVideoById = findVideoById;
const findVideoByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.find({
            created_by_id: req.userId,
        })
            .populate("viewsId")
            .populate("likesId")
            .populate("user");
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
    }
});
exports.findVideoByUserId = findVideoByUserId;
// Banner Video
const bannerVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const quary = req.query.quary;
        if (quary === "all") {
            const video = yield video_model_1.default.find({});
            return res
                .status(200)
                .json({ video, message: "Banner Video", status: 200 });
        }
        if (quary) {
            const searchQuery = req.query.search;
            const video = yield video_model_1.default.find({
                $or: [
                    { title: { $regex: searchQuery, $options: "i" } },
                    { description: { $regex: searchQuery, $options: "i" } },
                    { category: { $regex: searchQuery, $options: "i" } },
                    { language: { $regex: searchQuery, $options: "i" } },
                    { created_by_name: { $regex: searchQuery, $options: "i" } },
                ],
            });
            return res
                .status(200)
                .json({ video, message: "Banner Video", status: 200 });
        }
        else {
            const video = yield video_model_1.default.find({});
            return res
                .status(200)
                .json({ video, message: "Banner Video", status: 200 });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.bannerVideo = bannerVideo;
// Finder By Category
const findVideoByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.find({ category: req.params.category });
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.findVideoByCategory = findVideoByCategory;
// Active Banner
const activeBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video_id = req.params.video_id;
        const video = yield video_model_1.default.findById(video_id);
        if (!video) {
            return res.status(404).json({ error: "Video not found!" });
        }
        video.is_active_video = !video.is_active_video;
        yield video.save();
        res
            .status(200)
            .json({ video, message: "Active Banner Video", status: 200 });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.activeBanner = activeBanner;
// Finder By Language
const findVideoByLanguage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.find({ language: req.params.language });
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.findVideoByLanguage = findVideoByLanguage;
// Search Video
const searchVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.find({
            title: { $regex: req.params.search, $options: "i" },
            description: { $regex: req.params.search, $options: "i" },
            category: { $regex: req.params.search, $options: "i" },
            language: { $regex: req.params.search, $options: "i" },
            created_by_name: { $regex: req.params.search, $options: "i" },
        }).populate("View");
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.searchVideo = searchVideo;
const addBannerVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield banner_model_1.default.find({
            videoId: req.params.video_id,
            title: req.params.title,
            description: req.params.description,
        });
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.addBannerVideo = addBannerVideo;
// GET Banner
const BannerVideoFromAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.find({}).populate("Banner");
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.BannerVideoFromAdmin = BannerVideoFromAdmin;
// GET trending videos
const trendingVideos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video = yield video_model_1.default.find({
            views: { $gt: 1000 },
        });
        res.status(200).json({ video });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.trendingVideos = trendingVideos;
// POST video views
const postVideoViews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video_id = req.params.video_id;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!video_id) {
            return res.status(400).json({ error: "Video not found" });
        }
        const existingView = yield view_model_1.default.find({
            video_id: video_id,
            user_id: userId,
        });
        if ((existingView === null || existingView === void 0 ? void 0 : existingView.length) > 0) {
            return res.status(200).json({ message: "View already added" });
        }
        const video = yield view_model_1.default.create({
            video_id: req.params.video_id,
            views: 1,
            user_id: req.userId,
        });
        yield video.save();
        const videoData = yield video_model_1.default.findById(req.params.video_id);
        videoData.views += 1;
        videoData.viewsId.push(video._id);
        yield videoData.save();
        res.status(200).json({ video, videoData });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.postVideoViews = postVideoViews;
// POST add Like to video
const postVideoLike = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video_id = req.params.video_id;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!video_id) {
            return res.status(400).json({ error: "Video not found" });
        }
        const existingLike = yield like_model_1.default.find({
            video_id: video_id,
        });
        const videoData = yield video_model_1.default.findById(video_id);
        if (!videoData) {
            return res.status(400).json({ error: "Video not found" });
        }
        if ((existingLike === null || existingLike === void 0 ? void 0 : existingLike.length) === 0) {
            const newLike = new like_model_1.default({
                video_id: video_id,
                user_id: userId,
            });
            yield newLike.save();
            videoData.likes += 1;
            videoData.likesId.push(newLike._id);
            yield videoData.save();
            return res.status(200).json({ message: "Like added", videoData });
        }
        if (existingLike === null || existingLike === void 0 ? void 0 : existingLike[0].user_id.includes(userId)) {
            // User already liked the video, so remove the like
            videoData.likes -= 1;
            videoData.likesId.pull(existingLike._id);
            yield videoData.save();
            existingLike[0].user_id = existingLike[0].user_id.filter((id) => id !== userId);
            yield existingLike[0].save();
            return res.status(200).json({ message: "Like removed", videoData });
        }
        existingLike[0].user_id.push(userId);
        yield existingLike[0].save();
        videoData.likes += 1;
        videoData.likesId.push(existingLike._id);
        yield videoData.save();
        res.status(200).json({ message: "Like added", videoData });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.postVideoLike = postVideoLike;
//GET Like as per user_id
const getLikes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const video_id = req.params.video_id;
        const like = yield like_model_1.default.find({ video_id });
        res.status(200).json({ like });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getLikes = getLikes;
const categories = [
    {
        id: 1,
        label: "Drama Short",
        value: "drama_short",
        description: "Short films that depict realistic characters and emotional themes.",
    },
    {
        id: 2,
        label: "Comedy Short",
        value: "comedy_short",
        description: "Short films designed to entertain and amuse with humor.",
    },
    {
        id: 3,
        label: "Horror Short",
        value: "horror_short",
        description: "Short films that aim to evoke fear and suspense.",
    },
    {
        id: 4,
        label: "Science Fiction Short",
        value: "sci_fi_short",
        description: "Short films that explore futuristic concepts and speculative fiction.",
    },
    {
        id: 5,
        label: "Animated Short",
        value: "animated_short",
        description: "Short films created through animation techniques.",
    },
    {
        id: 6,
        label: "Experimental Short",
        value: "experimental_short",
        description: "Short films that push the boundaries of traditional filmmaking.",
    },
    {
        id: 7,
        label: "Foreign Language Short",
        value: "foreign_language_short",
        description: "Short films produced in languages other than the primary language of the region.",
    },
    {
        id: 8,
        label: "Music Video",
        value: "music_video",
        description: "Short films that accompany and visually represent a piece of music.",
    },
];
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ categories });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getCategories = getCategories;
