import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `☑️MongoDB connection successfully established ${conn.connection.host}`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // 0 means success, 1 means failure
  }
};
