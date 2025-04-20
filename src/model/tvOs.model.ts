import { Schema, model, Document } from "mongoose";

interface ITvOs extends Document {
  accessToken: string;
  username: string;
  role: string;
  success: boolean;
  uuid?: string;
  otp?: string;
  userId?: string;
}

const tvOsSchema = new Schema<ITvOs>({
  accessToken: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    default: false,
  },
  uuid: {
    type: String,
  },
  otp: {
    type: String,
  },
  userId: {
    type: String,
    ref: "User",
  },
});

const TvOsModel = model<ITvOs>("TvOs", tvOsSchema);

export default TvOsModel;
