import mongoose, { Document, Schema, Types } from "mongoose";

export interface IVideo extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  preview_video?: string;
  original_video?: string;
  views?: number;
  language?: [string];
  status?: boolean;
  followerCount?: number;
  duration?: string;
  likes?: number;
  user?: Types.ObjectId;
  certification?: string;
  category?: string[];
  viewsId?: [Types.ObjectId];
  likesId?: [Types.ObjectId];
  is_banner_video?: boolean;
  is_active_video?: boolean;
  created_by_id: string;
  created_by_name: string;
  processedImages?: object;
  averageRating?: number; // New field for average rating
  ratings?: { userId: Types.ObjectId; rating: number }[]; // New field for user ratings
}

const videoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user_profile",
    },
    followerCount: {
      type: Number,
      default: 0,
    },
    certification: {
      type: String,
      default: "U",
    },
    thumbnail: String,
    preview_video: String,
    original_video: String,
    language: [
      {
        type: String,
        default: "English",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    viewsId: [
      {
        type: Schema.Types.ObjectId,
        ref: "View",
      },
    ],
    likesId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    status: {
      type: Boolean,
      default: true,
    },
    duration: String,
    category: {
      type: [String],
      default: ["General"],
    },
    is_banner_video: {
      type: Boolean,
      default: false,
    },
    is_active_video: {
      type: Boolean,
      default: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    created_by_id: {
      type: String,
      required: true,
    },
    created_by_name: {
      type: String,
      required: true,
    },
    processedImages: {
      type: Object,
      default: {},
    },
    averageRating: {
      type: Number,
      default: 0, // Default average rating is 0
    },
    ratings: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user_profile",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const VideoModel = mongoose.model<IVideo>("videos", videoSchema);

export default VideoModel;
