import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import Path from "path";
import { serve } from "inngest/express";
import { inngest } from "./lib/inngest.js";
import { functions } from "./lib/inngest.js";
dotenv.config({ quiet: true });

const app = express();

const __dirname = Path.resolve();

// middleware
app.use(express.json());
// CREDITIALS: TRUE => SERVER ALLOWS A BROWSER TO INCLUDE COOKIES ON REQUEST
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use("/api/inngest", serve({client: inngest,functions}));

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
