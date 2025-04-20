import mongoose, { Schema, Types } from "mongoose";

interface IRoom extends Document {
  roomId: string;
  name: string;
  capacity: number;
  user: Types.ObjectId[];
  userId: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema: Schema = new Schema(
  {
    roomId: { type: String, required: true },
    capacity: { type: Number, required: true },
    name: { type: String, default: "new Room" },
    user: [{ type: Schema.Types.ObjectId, ref: "User" }],
    userId: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const RoomModel = mongoose.model<IRoom>("Room", roomSchema);
export default RoomModel;
