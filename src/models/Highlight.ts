import mongoose, { Schema, Document } from "mongoose";

export interface IHighlight extends Document {
  gameId?: string;
  title: string;
  iframeUrl: string;
  rawIframe?: string;
  thumbnailUrl?: string;
  competition?: string;
  homeTeam?: string;
  awayTeam?: string;
  status: "published" | "draft";
  isFeatured: boolean;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const HighlightSchema = new Schema<IHighlight>(
  {
    gameId: { type: String, index: true, sparse: true },
    title: { type: String, required: true, trim: true },
    iframeUrl: { type: String, required: true, trim: true },
    rawIframe: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    competition: { type: String, default: "", trim: true },
    homeTeam: { type: String, default: "", trim: true },
    awayTeam: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Highlight ||
  mongoose.model<IHighlight>("Highlight", HighlightSchema);
