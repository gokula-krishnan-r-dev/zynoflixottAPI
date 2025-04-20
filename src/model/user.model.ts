import mongoose, { Schema, Document, Types } from "mongoose";

interface IUserProfile extends Document {
  profilePic?: string;
  contact?: string;
  email: string;
  full_name: string;
  password: string;
  following?: number;
  followingId?: Types.ObjectId[];
  backgroundPic?: string;
  description?: string;
  membershipId?: Types.ObjectId;
  is_active: boolean;
  isMembership?: boolean;
  membership?: string;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    profilePic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    contact: { type: String },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    backgroundPic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    followingId: [
      {
        type: Schema.Types.ObjectId,
        ref: "user_profile",
      },
    ],
    description: {
      type: String,
      default:
        " voluptatum voluptate distinctio, nostrum hic voluptatibus nisi. Eligendi voluptatibus numquam maxime voluptatem labore similique qui illo est magnam adipisci autem quisquam, quia incidunt excepturi, possimus odit praesentium? Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus neque praesentium voluptates atque quisquam ratione voluptatem vitae ducimus cupiditate necessitatibus? Expedita odit eius, adipisci vero cupiditate quas ea asperiores.",
    },
    following: Number,
    membership: { type: String, default: "free" },
    isMembership: { type: Boolean, default: false },
    membershipId: { type: Schema.Types.ObjectId, ref: "Membership" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model<IUserProfile>("user_profile", UserProfileSchema);

export { IUserProfile, User };
