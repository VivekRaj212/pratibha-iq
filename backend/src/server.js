import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
dotenv.config({ quiet: true });

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
