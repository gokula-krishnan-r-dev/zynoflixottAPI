"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const videoController_1 = require("../controllers/videoController");
const s3_1 = require("../service/db/s3/s3");
const findUserMiddleware_1 = require("../middlewares/findUserMiddleware");
const monthlySubController_1 = require("../controllers/monthlySubController");
const adsController_1 = require("../controllers/adsController");
const watchController_1 = require("../controllers/watchController");
const roomController_1 = require("../controllers/roomController");
const commentController_1 = require("../controllers/commentController");
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// User
router.get("/auth/user", userController_1.allUsers);
router.get("/auth/user/:user_id", userController_1.getUserById);
router.post("/auth/signup", userController_1.createUser);
router.post("/auth/login", userController_1.loginUser);
router.get("/auth/logout", userController_1.logoutUser);
const cpUpdateUser = s3_1.upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "backgroundPic", maxCount: 1 },
]);
router.put("/auth/user/:user_id", cpUpdateUser, userController_1.updateUser);
// Production User
const cpUploadUser = s3_1.upload.fields([{ name: "logo", maxCount: 1 }]);
const cpUploadBackground = s3_1.upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
]);
router.post("/auth/production/signup", cpUploadUser, userController_1.CreateProductionCompany);
router.get("/auth/production/user", userController_1.getProductCompany);
router.get("/auth/production/user/:user_id", userController_1.getProductionCompanyById);
router.put("/auth/production/user", findUserMiddleware_1.authMiddleware, cpUploadBackground, userController_1.updateProductionCompany);
// upload video
const cpUpload = s3_1.upload.fields([
    { name: "preview_video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
    { name: "orginal_video", maxCount: 1 },
]);
const cpUploadBanner = s3_1.upload.fields([
    { name: "preview_video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
]);
router.post("/create_videos", cpUpload, videoController_1.Createvideos);
router.post("/create/banner-video", cpUploadBanner, videoController_1.CreateBannervideos);
router.get("/video/:video_id", videoController_1.findVideoById);
router.get("/profile/video", findUserMiddleware_1.authMiddleware, videoController_1.findVideoByUserId);
router.get("/videos", videoController_1.allVideos);
router.get("/banner", videoController_1.bannerVideo);
router.post("/banner/active/:video_id", videoController_1.activeBanner);
router.get("/category/:category", videoController_1.bannerVideo);
router.get("/category", videoController_1.getCategories);
router.get("/search/:search", videoController_1.searchVideo);
router.get("/language/:language", videoController_1.findVideoByLanguage);
//admin
router.post("/add/banner", videoController_1.addBannerVideo);
router.get("/video/banner", videoController_1.BannerVideoFromAdmin);
// router.post("/video/view/:video_id", postVideoViews);
router.post("/video/view/:video_id", findUserMiddleware_1.authMiddleware, videoController_1.postVideoViews);
router.post("/video/like/:video_id", findUserMiddleware_1.authMiddleware, videoController_1.postVideoLike);
router.get("/video/like/:video_id", videoController_1.getLikes);
// Payment
router.post("/payment", findUserMiddleware_1.authMiddleware, monthlySubController_1.monthlySub);
router.get("/payment", findUserMiddleware_1.authMiddleware, monthlySubController_1.getMonthlySub);
router.put("/payment/:id", findUserMiddleware_1.authMiddleware, monthlySubController_1.updateMonthlySub);
router.put("/payment/video/:id", findUserMiddleware_1.authMiddleware, monthlySubController_1.uploadVideoCount);
// Follower
router.post("/follow/:user_id", findUserMiddleware_1.authMiddleware, userController_1.followUser);
router.get("/followers/:video_id", userController_1.getFollowers);
router.get("/followers", findUserMiddleware_1.authMiddleware, userController_1.getFollowerByUserId);
// Ads
const cpUploadAds = s3_1.upload.fields([{ name: "ads_video", maxCount: 1 }]);
router.post("/ads", cpUploadAds, adsController_1.createAds);
router.get("/ads", adsController_1.getAds);
router.put("/ads/active/:id", adsController_1.activeAds);
// Watch Later
router.post("/watch-later/:video_id", findUserMiddleware_1.authMiddleware, watchController_1.watchLater);
router.get("/watch-later", findUserMiddleware_1.authMiddleware, watchController_1.getWatchLater);
// Chat
router.get("/chat", findUserMiddleware_1.authMiddleware, roomController_1.getRoom);
router.get("/chat/:roomId", findUserMiddleware_1.authMiddleware, roomController_1.getRoom);
router.get("/message/:roomId", findUserMiddleware_1.authMiddleware, roomController_1.getMessageById);
router.post("/room", findUserMiddleware_1.authMiddleware, roomController_1.createRoom);
// Comment
router.post("/comment/:video_id", findUserMiddleware_1.authMiddleware, commentController_1.CreateComment);
router.get("/comment/:video_id", commentController_1.getCommentByVideoId);
//notification
router.post("/notification", findUserMiddleware_1.authMiddleware, notificationController_1.SendNotification);
router.get("/notification", findUserMiddleware_1.authMiddleware, notificationController_1.GetNotification);
exports.default = router;
