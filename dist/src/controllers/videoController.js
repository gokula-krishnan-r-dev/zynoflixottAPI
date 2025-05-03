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
exports.createBanner = exports.getRating = exports.rateVideo = exports.getCategories = exports.getLikes = exports.postVideoLike = exports.postVideoViews = exports.trendingVideos = exports.BannerVideoFromAdmin = exports.addBannerVideo = exports.searchVideo = exports.findVideoByLanguage = exports.activeBanner = exports.findVideoByCategory = exports.bannerVideo = exports.findVideoByUserId = exports.findVideoById = exports.allVideos = exports.CreateBannervideos = exports.Createvideos = exports.SearchVideo = exports.uploadVideo = void 0;
const video_model_1 = __importDefault(require("../model/video.model"));
const user_model_1 = require("../model/user.model");
const like_model_1 = __importDefault(require("../model/like.model"));
const blobHelpers_1 = require("./blobHelpers");
const banner_model_1 = __importDefault(require("../model/banner.model"));
const view_model_1 = __importDefault(require("../model/view.model"));
// Remove the resizeImage function since it's not compatible with Azure Blob Storage
// We'll need to implement Azure-specific image processing if needed later
const uploadVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if the user is authorized to upload a video
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "User not found" });
        }
        // Assuming thumbnail, preview_video, and orginal_video are available in req.files
        const thumbnail = (0, blobHelpers_1.getFileUrl)(req.files["thumbnail"][0]);
        const preview_video = (0, blobHelpers_1.getFileUrl)(req.files["preview_video"][0]);
        const original_video = (0, blobHelpers_1.getFileUrl)(req.files["orginal_video"][0]);
        // Define configurations for image qualities
        const configurations = {
            thumbnail: {
                width: 320,
                height: 180,
            },
            low: {
                width: 640,
                height: 360,
            },
            medium: {
                width: 854,
                height: 480,
            },
            high: {
                width: 1280,
                height: 720,
            },
            hd: {
                width: 1920,
                height: 1080,
            },
        };
        // Create the video data
        const video = yield video_model_1.default.create({
            title: req.body.title,
            description: req.body.description,
            thumbnail: thumbnail,
            preview_video: preview_video,
            orginal_video: original_video,
            userId: userId,
            tags: req.body.tags,
            categories: req.body.categories,
            duration: req.body.duration,
            visibility: req.body.visibility,
            configs: configurations,
        });
        // Add the video to the user's videos array
        yield user_model_1.User.findByIdAndUpdate(userId, {
            $push: { videos: video._id },
        });
        res.status(201).json({ message: "Video uploaded", video });
    }
    catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ error: "Error uploading video", details: error.message });
    }
});
exports.uploadVideo = uploadVideo;
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
        console.log(req.files);
        const exitingsVideo = yield video_model_1.default.find({ title: title });
        if (exitingsVideo.length > 0) {
            return res.status(400).json({ error: "Video already exists" });
        }
        // Assuming thumbnail, preview_video, and orginal_video are available in req.files
        const thumbnail = (0, blobHelpers_1.getFileUrl)(req.files["thumbnail"][0]);
        const preview_video = (0, blobHelpers_1.getFileUrl)(req.files["preview_video"][0]);
        const original_video = (0, blobHelpers_1.getFileUrl)(req.files["orginal_video"][0]);
        // Define configurations for image qualities
        const imageQualities = {
            medium: { width: 480, height: 360 },
            small: { width: 110, height: 100 },
            high: { width: 720, height: 540 },
        };
        // For Azure Blob Storage, we're not performing image processing here
        // If image processing is needed, a separate Azure Function or service should be implemented
        const processedImages = {
            medium: {
                caption: "caption",
                path: thumbnail,
                width: imageQualities.medium.width,
                height: imageQualities.medium.height,
                type: "image/jpeg",
            },
            small: {
                caption: "caption",
                path: thumbnail,
                width: imageQualities.small.width,
                height: imageQualities.small.height,
                type: "image/jpeg",
            },
            high: {
                caption: "caption",
                path: thumbnail,
                width: imageQualities.high.width,
                height: imageQualities.high.height,
                type: "image/jpeg",
            }
        };
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
        const thumbnail = (0, blobHelpers_1.getFileUrl)(req.files["thumbnail"][0]);
        const preview_video = (0, blobHelpers_1.getFileUrl)(req.files["preview_video"][0]);
        // Define configurations for image qualities
        const imageQualities = {
            medium: { width: 480, height: 360 },
            small: { width: 110, height: 100 },
            high: { width: 720, height: 540 },
        };
        // For Azure Blob Storage, we're not performing image processing here
        // If image processing is needed, a separate Azure Function or service should be implemented
        const processedImages = {
            medium: {
                caption: "caption",
                path: thumbnail,
                width: imageQualities.medium.width,
                height: imageQualities.medium.height,
                type: "image/jpeg",
            },
            small: {
                caption: "caption",
                path: thumbnail,
                width: imageQualities.small.width,
                height: imageQualities.small.height,
                type: "image/jpeg",
            },
            high: {
                caption: "caption",
                path: thumbnail,
                width: imageQualities.high.width,
                height: imageQualities.high.height,
                type: "image/jpeg",
            }
        };
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
        console.log(req.params);
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
            console.log("Like added");
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
const rateVideo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const videoId = req.params.video_id;
    const userId = req.userId;
    const rating = req.body.rating;
    const video = yield video_model_1.default.findById(videoId);
    if (!video) {
        console.log("Video not found");
        return res.status(404).json({ error: "Video not found" });
    }
    // Check if the user has already rated the video
    const existingRating = (_a = video.ratings) === null || _a === void 0 ? void 0 : _a.find((r) => r.userId.toString() === userId);
    if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
    }
    else {
        // Add new rating
        (_b = video.ratings) === null || _b === void 0 ? void 0 : _b.push({ userId: userId, rating });
    }
    // Recalculate average rating
    const totalRatings = ((_c = video.ratings) === null || _c === void 0 ? void 0 : _c.reduce((acc, r) => acc + r.rating, 0)) || 0;
    const ratingCount = ((_d = video.ratings) === null || _d === void 0 ? void 0 : _d.length) || 1;
    video.averageRating = totalRatings / ratingCount;
    yield video.save();
    res.status(200).json({ video });
});
exports.rateVideo = rateVideo;
// get rating as per video
const getRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const video_id = req.params.video_id;
        const video = yield video_model_1.default.findById(video_id);
        res.status(200).json({ video, rating: (_a = video === null || video === void 0 ? void 0 : video.ratings) === null || _a === void 0 ? void 0 : _a.length });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getRating = getRating;
const createBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the user ID
        const userId = req.userId;
        // Assuming thumbnail is available in req.files
        const thumbnail = (0, blobHelpers_1.getFileUrl)(req.files["thumbnail"][0]);
        // Create the banner
        const banner = yield banner_model_1.default.create({
            title: req.body.title,
            description: req.body.description,
            thumbnail: thumbnail,
            link: req.body.link,
        });
        res.status(201).json({ message: "Banner created", banner });
    }
    catch (error) {
        console.error("Error creating banner:", error);
        res.status(500).json({ error: "Error creating banner", details: error.message });
    }
});
exports.createBanner = createBanner;
//# sourceMappingURL=videoController.js.map