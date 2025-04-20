import mongoose, { Document, Types } from "mongoose";

export interface IFollower extends Document {
  videoId: string;
  user_id: string[];
  user: Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const followerSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: true,
    },
    user_id: [
      {
        type: String,
      },
    ],
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const FollowerModel = mongoose.model<IFollower>("Follower", followerSchema);

export default FollowerModel;
