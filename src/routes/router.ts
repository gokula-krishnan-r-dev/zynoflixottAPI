import express, { Express, Request, Response } from "express";
import {
  allUsers,
  createUser,
  followUser,
  getFollowers,
  getUserById,
  loginUser,
  logoutUser,
  getProductCompany,
  getProductionCompanyById,
  updateUser,
  CreateProductionCompany,
  getFollowerByUserId,
  updateProductionCompany,
  createTvOsAuth,
  verifyTvOsAuth,
  getByIdTvOsAuth,
  getDirectorsCompany,
} from "../controllers/userController";
import {
  BannerVideoFromAdmin,
  CreateBannervideos,
  Createvideos,
  activeBanner,
  addBannerVideo,
  allVideos,
  bannerVideo,
  findVideoById,
  findVideoByLanguage,
  findVideoByUserId,
  getCategories,
  getLikes,
  getRating,
  postVideoLike,
  postVideoViews,
  rateVideo,
  searchVideo,
} from "../controllers/videoController";
import { upload } from "../service/db/s3/s3";
import { authMiddleware } from "../middlewares/findUserMiddleware";
import {
  getMonthlySub,
  monthlySub,
  updateMonthlySub,
  uploadVideoCount,
} from "../controllers/monthlySubController";
import { activeAds, createAds, getAds } from "../controllers/adsController";
import { getWatchLater, watchLater } from "../controllers/watchController";
import {
  createRoom,
  getMessageById,
  getRoom,
} from "../controllers/roomController";
import {
  CreateComment,
  getCommentByVideoId,
} from "../controllers/commentController";
import {
  GetNotification,
  SendNotification,
} from "../controllers/notificationController";

const router = express.Router();

// User
router.get("/auth/user", allUsers);
router.get("/auth/user/:user_id", getUserById);
router.post("/auth/signup", createUser);
router.post("/auth/login", loginUser);
router.get("/auth/logout", logoutUser);

router.post("/auth/tvos/otp", createTvOsAuth);
router.post("/auth/tvos/verify", verifyTvOsAuth);
router.get("/auth/verify/:uuid", getByIdTvOsAuth);

const cpUpdateUser = upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "backgroundPic", maxCount: 1 },
]);

router.put("/auth/user/:user_id", cpUpdateUser, updateUser);

// Production User
const cpUploadUser = upload.fields([{ name: "logo", maxCount: 1 }]);
const cpUploadBackground = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 },
]);
router.post("/auth/production/signup", cpUploadUser, CreateProductionCompany);
router.get("/auth/production/user", getProductCompany);
router.get("/auth/director/user", getDirectorsCompany);
router.get("/auth/production/user/:user_id", getProductionCompanyById);
router.put(
  "/auth/production/user",
  authMiddleware,
  cpUploadBackground,
  updateProductionCompany
);

// upload video
const cpUpload = upload.fields([
  { name: "preview_video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "orginal_video", maxCount: 1 },
]);

const cpUploadBanner = upload.fields([
  { name: "preview_video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

router.post("/create_videos", cpUpload, Createvideos);
router.post("/create/banner-video", cpUploadBanner, CreateBannervideos);
router.get("/video/:video_id", findVideoById);
router.get("/profile/video", authMiddleware, findVideoByUserId);
router.get("/videos", allVideos);
router.get("/banner", bannerVideo);
router.post("/banner/active/:video_id", activeBanner);
router.get("/category/:category", bannerVideo);
router.get("/category", getCategories);
router.get("/search/:search", searchVideo);
router.get("/language/:language", findVideoByLanguage);

//admin
router.post("/add/banner", addBannerVideo);
router.get("/video/banner", BannerVideoFromAdmin);
// router.post("/video/view/:video_id", postVideoViews);
router.post("/video/view/:video_id", authMiddleware, postVideoViews);
router.post("/video/like/:video_id", authMiddleware, postVideoLike);
router.get("/video/like/:video_id", getLikes);

// Payment
router.post("/payment", authMiddleware, monthlySub);
router.get("/payment", authMiddleware, getMonthlySub);
router.put("/payment/:id", authMiddleware, updateMonthlySub);
router.put("/payment/video/:id", authMiddleware, uploadVideoCount);

// Follower
router.post("/follow/:user_id", authMiddleware, followUser);
router.get("/followers/:video_id", getFollowers);
router.get("/followers", authMiddleware, getFollowerByUserId);

// Ads
const cpUploadAds = upload.fields([{ name: "ads_video", maxCount: 1 }]);
router.post("/ads", cpUploadAds, createAds);
router.get("/ads", getAds);
router.put("/ads/active/:id", activeAds);

// Watch Later
router.post("/watch-later/:video_id", authMiddleware, watchLater);
router.get("/watch-later", authMiddleware, getWatchLater);

// Chat
router.get("/chat", authMiddleware, getRoom);
router.get("/chat/:roomId", authMiddleware, getRoom);
router.get("/message/:roomId", authMiddleware, getMessageById);
router.post("/room", authMiddleware, createRoom);

// Comment
router.post("/comment/:video_id", authMiddleware, CreateComment);
router.get("/comment/:video_id", getCommentByVideoId);

//notification
router.post("/notification", authMiddleware, SendNotification);
router.get("/notification", authMiddleware, GetNotification);

//rating
router.post("/rating/:video_id", authMiddleware, rateVideo);
router.get("/rating/:video_id", authMiddleware, getRating);

export default router;
