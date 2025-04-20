import mongoose, { Document } from "mongoose";

export interface IMembership extends Document {
  user_id: string;
  membershipType?: string;
  paymentDate?: Date;
  amount: number;
  transactionId: string;
  paymentMethod?: string;
  isVideo_uploaded: boolean;
  paymentStatus: "pending" | "success" | "failed" | "cancelled";
  order: object;
}

const membershipSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    membershipType: {
      type: String,
      default: "monthly",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    isVideo_uploaded: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
  },
  {
    timestamps: true,
  }
);

const MembershipModel = mongoose.model<IMembership>(
  "Membership",
  membershipSchema
);

export default MembershipModel;
