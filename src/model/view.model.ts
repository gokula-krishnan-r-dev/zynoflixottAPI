import mongoose, { Document, Schema } from "mongoose";

export interface IView extends Document {
  video_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const viewSchema: Schema = new Schema(
  {
    video_id: {
      type: Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user_profile", // Assuming you have a User model
    },
    viewCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const ViewModel = mongoose.model<IView>("View", viewSchema);

export default ViewModel;
