import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (mongoose.connections[0].readyState) {
      console.log("MongoDB already connected");
      return;
    }

    console.log(
      "MONGODB_URI:",
      process.env.MONGODB_URI ? "FOUND ✅" : "MISSING ❌"
    );

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("MongoDB connection error ❌:", error.message);
  }
}