import mongoose from "mongoose";

const LiveMatchSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true
  },
  matches: {
    type: Array, // Array of selected match objects
    default: []
  },
  fallbackImage: {
    type: String,
    default: ""
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.models.LiveMatch || mongoose.model("LiveMatch", LiveMatchSchema);
