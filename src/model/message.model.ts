import mongoose, { Schema, Document, Types } from "mongoose";

// Define the message schema
interface IMessage extends Document {
  content: string;
  roomId: string;
  room: string;
  userId: Types.ObjectId;
  sender: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    sender: { type: String, required: true },
    roomId: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: "user_profile" },
    room: { type: String, ref: "Room" },
  },
  {
    timestamps: true,
  }
);

// Create the message model
const MessageModel = mongoose.model<IMessage>("Message", messageSchema);

export default MessageModel;
