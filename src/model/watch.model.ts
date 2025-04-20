import mongoose, { Schema, Document, Model, Types } from "mongoose";

interface IWatch extends Document {
  user_id: string;
  user: Types.ObjectId;
  video_id: string;
  video: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WatchSchema: Schema = new Schema(
  {
    user_id: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "User" },
    video_id: { type: String, required: true },
    video: { type: Types.ObjectId, ref: "Video" },
  },
  {
    timestamps: true,
  }
);

const watchModel = mongoose.model<IWatch>("Watch", WatchSchema);

export { watchModel, IWatch };
