import express, { Request, Response } from "express";
import mongoose from "mongoose";
import VideoModel, { IVideo } from "../model/video.model";
import { User } from "../model/user.model";
import LikeModel from "../model/like.model";
import { ProductionCompany } from "../model/production.model";
import { getFileUrl } from "./blobHelpers";
import BannerModel from "../model/banner.model";
import ViewModel from "../model/view.model";

// Remove the resizeImage function since it's not compatible with Azure Blob Storage
// We'll need to implement Azure-specific image processing if needed later

export const uploadVideo = async (req: any, res: Response) => {
  try {
    // Check if the user is authorized to upload a video
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ error: "User not found" });
    }

    // Assuming thumbnail, preview_video, and orginal_video are available in req.files
    const thumbnail = getFileUrl(req.files["thumbnail"][0]);
    const preview_video = getFileUrl(req.files["preview_video"][0]);
    const original_video = getFileUrl(req.files["orginal_video"][0]);

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
    const video = await VideoModel.create({
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
    await User.findByIdAndUpdate(userId, {
      $push: { videos: video._id },
    });

    res.status(201).json({ message: "Video uploaded", video });
  } catch (error: any) {
    console.error("Error uploading video:", error);
    res.status(500).json({ error: "Error uploading video", details: error.message });
  }
};

export const SearchVideo = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
    res.json({
      error: "somthing went wrong !",
    });
  }
};

// Route : /create_videos
export const Createvideos = async (req: any, res: Response) => {
  try {
    const {
      title,
      description,
      language,
      status,
      duration,
      category,
      is_feature_video,
      user,
      created_by_id,
      created_by_name,
    } = req.body;
    console.log(req.files);

    const exitingsVideo = await VideoModel.find({ title: title });
    if (exitingsVideo.length > 0) {
      return res.status(400).json({ error: "Video already exists" });
    }

    // Assuming thumbnail, preview_video, and orginal_video are available in req.files
    const thumbnail = getFileUrl(req.files["thumbnail"][0]);
    const preview_video = getFileUrl(req.files["preview_video"][0]);
    const original_video = getFileUrl(req.files["orginal_video"][0]);

    // Define configurations for image qualities
    const imageQualities = {
      medium: { width: 480, height: 360 },
      small: { width: 110, height: 100 },
      high: { width: 720, height: 540 },
    };

    // For Azure Blob Storage, we're not performing image processing here
    // If image processing is needed, a separate Azure Function or service should be implemented
    const processedImages: any = {
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

    const newVideo = await VideoModel.create({
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
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const CreateBannervideos = async (req: any, res: Response) => {
  try {
    const {
      title,
      description,
      language,
      status,
      duration,
      category,
      created_by_id,
      created_by_name,
    } = req.body;

    // Assuming thumbnail, preview_video, and orginal_video are available in req.files
    const thumbnail = getFileUrl(req.files["thumbnail"][0]);
    const preview_video = getFileUrl(req.files["preview_video"][0]);

    // Define configurations for image qualities
    const imageQualities = {
      medium: { width: 480, height: 360 },
      small: { width: 110, height: 100 },
      high: { width: 720, height: 540 },
    };

    // For Azure Blob Storage, we're not performing image processing here
    // If image processing is needed, a separate Azure Function or service should be implemented
    const processedImages: any = {
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

    const newVideo = await VideoModel.create({
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
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Get all videos
export const allVideos = async (req: Request, res: Response) => {
  try {
    const language = req.query.language || "English";
    console.log(language, "language");
    
    let query = {};
    
    // If language is not 'all', apply the language filter
    if (language !== 'all') {
      // Create a case-insensitive regex pattern for the language
      const languageRegex = new RegExp(String(language), 'i');
      query = { language: { $in: [languageRegex] } };
    }
    
    const videos = await VideoModel.find(query)
      .populate("viewsId")
      .populate("likesId")
      .populate("user")
      .limit(20);


    res.status(200).json({ videos });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// find video by id
export const findVideoById = async (req: Request, res: Response) => {
  try {
    const video = await VideoModel.findById(req.params.video_id);
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const findVideoByUserId = async (req: any, res: Response) => {
  try {
    const video = await VideoModel.find({
      created_by_id: req.userId,
    })
      .populate("viewsId")
      .populate("likesId")
      .populate("user");

    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

// Banner Video
export const bannerVideo = async (req: Request, res: Response) => {
  try {
    const quary = req.query.quary;

    if (quary === "all") {
      const video = await VideoModel.find({});
      return res
        .status(200)
        .json({ video, message: "Banner Video", status: 200 });
    }

    if (quary) {
      const searchQuery = req.query.search;
      const video = await VideoModel.find({
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
    } else {
      const video = await VideoModel.find({});
      return res
        .status(200)
        .json({ video, message: "Banner Video", status: 200 });
    }
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Finder By Category
export const findVideoByCategory = async (req: Request, res: Response) => {
  try {
    const video = await VideoModel.find({ category: req.params.category });
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Active Banner
export const activeBanner = async (req: Request, res: Response) => {
  try {
    const video_id = req.params.video_id;
    const video: any = await VideoModel.findById(video_id);
    if (!video) {
      return res.status(404).json({ error: "Video not found!" });
    }

    video.is_active_video = !video.is_active_video;
    await video.save();

    res
      .status(200)
      .json({ video, message: "Active Banner Video", status: 200 });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Finder By Language
export const findVideoByLanguage = async (req: Request, res: Response) => {
  try {
    const video = await VideoModel.find({ language: req.params.language });
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Search Video
export const searchVideo = async (req: Request, res: Response) => {
  try {
    const video = await VideoModel.find({
      title: { $regex: req.params.search, $options: "i" },
      description: { $regex: req.params.search, $options: "i" },
      category: { $regex: req.params.search, $options: "i" },
      language: { $regex: req.params.search, $options: "i" },
      created_by_name: { $regex: req.params.search, $options: "i" },
    }).populate("View");
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const addBannerVideo = async (req: Request, res: Response) => {
  try {
    const video = await BannerModel.find({
      videoId: req.params.video_id,
      title: req.params.title,
      description: req.params.description,
    });
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// GET Banner
export const BannerVideoFromAdmin = async (req: Request, res: Response) => {
  try {
    const video = await VideoModel.find({}).populate("Banner");
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// GET trending videos
export const trendingVideos = async (req: Request, res: Response) => {
  try {
    const video = await VideoModel.find({
      views: { $gt: 1000 },
    });
    res.status(200).json({ video });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// POST video views
export const postVideoViews = async (req: any, res: Response) => {
  try {
    const video_id = req.params.video_id;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!video_id) {
      return res.status(400).json({ error: "Video not found" });
    }

    const existingView: any = await ViewModel.find({
      video_id: video_id,
      user_id: userId,
    });

    if (existingView?.length > 0) {
      return res.status(200).json({ message: "View already added" });
    }

    const video: any = await ViewModel.create({
      video_id: req.params.video_id,
      views: 1,
      user_id: req.userId,
    });

    await video.save();

    const videoData: any = await VideoModel.findById(req.params.video_id);
    videoData.views += 1;
    videoData.viewsId.push(video._id);
    await videoData.save();
    res.status(200).json({ video, videoData });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// POST add Like to video
export const postVideoLike = async (req: any, res: Response) => {
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

    const existingLike: any = await LikeModel.find({
      video_id: video_id,
    });

    const videoData: any = await VideoModel.findById(video_id);

    if (!videoData) {
      return res.status(400).json({ error: "Video not found" });
    }

    if (existingLike?.length === 0) {
      const newLike = new LikeModel({
        video_id: video_id,
        user_id: userId,
      });

      await newLike.save();

      videoData.likes += 1;
      videoData.likesId.push(newLike._id);
      await videoData.save();

      console.log("Like added");

      return res.status(200).json({ message: "Like added", videoData });
    }

    if (existingLike?.[0].user_id.includes(userId)) {
      // User already liked the video, so remove the like
      videoData.likes -= 1;
      videoData.likesId.pull(existingLike._id);
      await videoData.save();

      existingLike[0].user_id = existingLike[0].user_id.filter(
        (id: string) => id !== userId
      );

      await existingLike[0].save();

      return res.status(200).json({ message: "Like removed", videoData });
    }

    existingLike[0].user_id.push(userId);
    await existingLike[0].save();

    videoData.likes += 1;
    videoData.likesId.push(existingLike._id);
    await videoData.save();

    res.status(200).json({ message: "Like added", videoData });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

//GET Like as per user_id
export const getLikes = async (req: any, res: Response) => {
  try {
    const video_id = req.params.video_id;

    const like = await LikeModel.find({ video_id });
    res.status(200).json({ like });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

interface Category {
  id: number;
  label: string;
  value: string;
  description: string;
}

const categories: Category[] = [
  {
    id: 1,
    label: "Drama Short",
    value: "drama_short",
    description:
      "Short films that depict realistic characters and emotional themes.",
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
    description:
      "Short films that explore futuristic concepts and speculative fiction.",
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
    description:
      "Short films that push the boundaries of traditional filmmaking.",
  },
  {
    id: 7,
    label: "Foreign Language Short",
    value: "foreign_language_short",
    description:
      "Short films produced in languages other than the primary language of the region.",
  },
  {
    id: 8,
    label: "Music Video",
    value: "music_video",
    description:
      "Short films that accompany and visually represent a piece of music.",
  },
];

export const getCategories = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ categories });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const rateVideo = async (req: any, res: Response) => {
  const videoId = req.params.video_id;
  const userId = req.userId;
  const rating = req.body.rating;
  const video = await VideoModel.findById(videoId);

  if (!video) {
    console.log("Video not found");
    return res.status(404).json({ error: "Video not found" });
  }

  // Check if the user has already rated the video
  const existingRating = video.ratings?.find(
    (r) => r.userId.toString() === userId
  );

  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
  } else {
    // Add new rating
    video.ratings?.push({ userId: userId, rating });
  }

  // Recalculate average rating
  const totalRatings =
    video.ratings?.reduce((acc, r) => acc + r.rating, 0) || 0;
  const ratingCount = video.ratings?.length || 1;
  video.averageRating = totalRatings / ratingCount;

  await video.save();

  res.status(200).json({ video });
};

// get rating as per video
export const getRating = async (req: any, res: Response) => {
  try {
    const video_id = req.params.video_id;

    const video: any = await VideoModel.findById(video_id);
    res.status(200).json({ video, rating: video?.ratings?.length });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const createBanner = async (req: any, res: Response) => {
  try {
    // Get the user ID
    const userId = req.userId;

    // Assuming thumbnail is available in req.files
    const thumbnail = getFileUrl(req.files["thumbnail"][0]);

    // Create the banner
    const banner = await BannerModel.create({
      title: req.body.title,
      description: req.body.description,
      thumbnail: thumbnail,
      link: req.body.link,
    });

    res.status(201).json({ message: "Banner created", banner });
  } catch (error: any) {
    console.error("Error creating banner:", error);
    res.status(500).json({ error: "Error creating banner", details: error.message });
  }
};
