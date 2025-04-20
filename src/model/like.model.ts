import mongoose, { Document, Schema } from "mongoose";

export interface ILike extends Document {
  video_id: string;
  user_id: string[];
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema: Schema = new Schema(
  {
    video_id: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    user_id: [
      {
        type: String,
        ref: "users",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const LikeModel = mongoose.model<ILike>("Like", likeSchema);

export default LikeModel;
