import mongoose, { Schema, model, Document, Connection } from "mongoose";

interface ISession extends Document {
  userId: string;
  accessToken: string;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true },
    accessToken: { type: String, required: true },
  },
  { timestamps: true }
);
const Session = mongoose.model<ISession>("session", SessionSchema);
export { ISession, Session };
