import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({quiet: true});

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `☑️MongoDB connection successfully established ${conn.connection.host}`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // 0 means success, 1 means failure
  }
};
