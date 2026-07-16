import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStream extends Document {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  streamType: "iframe" | "hls" | "youtube" | "other";
  streamUrl: string;
  isActive: boolean;
  tokenRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StreamSchema: Schema = new Schema(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    streamType: {
      type: String,
      required: true,
      enum: ["iframe", "hls", "youtube", "other"],
      default: "iframe",
    },
    streamUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    tokenRequired: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from compiling the model multiple times during hot-reloads
const Stream: Model<IStream> =
  mongoose.models.Stream || mongoose.model<IStream>("Stream", StreamSchema);

export default Stream;
