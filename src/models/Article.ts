import mongoose, { Schema, Document, Model } from "mongoose";

export interface IArticle extends Document {
  source: string;
  original_url: string;
  original_title?: string;
  score: number;
  slug: string;
  headline_ar: string;
  body_ar: string;
  tags: string[];
  language: string;
  image_url?: string;
  source_image?: string;
  status: "published" | "pending" | "draft";
  created_at: Date;
  published_at?: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    source: { type: String, required: true },
    original_url: { type: String, required: true },
    original_title: { type: String },
    score: { type: Number, default: 0 },
    slug: { type: String, required: true, index: true },
    headline_ar: { type: String, required: true },
    body_ar: { type: String, required: true },
    tags: [{ type: String }],
    language: { type: String, default: "ar" },
    image_url: { type: String },
    source_image: { type: String },
    status: {
      type: String,
      enum: ["published", "pending", "draft"],
      default: "published",
      index: true,
    },
    created_at: { type: Date, default: Date.now },
    published_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: "articles",
  }
);

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
