import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  videoId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema: Schema = new Schema(
  {
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BannerModel = mongoose.model<IBanner>("Banner", bannerSchema);

export default BannerModel;






