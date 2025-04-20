import mongoose, { Schema, Document, Model } from "mongoose";

interface IAd extends Document {
  title?: string;
  image?: string; // URL to the image
  video: string; // URL to the video
  link?: string; // URL to the link
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema: Schema = new Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    link: {
      type: String,
    },
    video: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Ad: Model<IAd> = mongoose.model<IAd>("Ad", AdSchema);

export default Ad;
export { IAd };
