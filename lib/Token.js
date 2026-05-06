import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    token: String,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Token ||
  mongoose.model("Token", tokenSchema);