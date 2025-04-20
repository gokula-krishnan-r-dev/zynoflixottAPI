import mongoose, { Schema, Document, Types } from "mongoose";

/**
 * Represents a comment made by a user on a video.
 */
interface Comment extends Document {
  userId: string;
  videoId: string;
  content: string;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    videoId: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user_profile",
    },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<Comment>("Comment", commentSchema);

export default CommentModel;
