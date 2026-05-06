import express from "express";
import webhook from "./api/webhook.js";
import { connectDB } from "./lib/db.js";

const app = express();
app.use(express.json());

// DB connect
connectDB();

// Routes
app.post("/api/webhook", webhook);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});