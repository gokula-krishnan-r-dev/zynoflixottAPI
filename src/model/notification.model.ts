import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;

  sender: string;
  receiver: string;
  user: Types.ObjectId;
  sent: boolean;
  isViewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    isViewed: { type: Boolean, default: false },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "user_profile" },
    sent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
