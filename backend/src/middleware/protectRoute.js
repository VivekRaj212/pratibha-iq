import { getAuth, requireAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(), // This will throw an error if the user is not authenticated

  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId; // Get the authenticated user's ID from Clerk
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Unauthorized - Invalid Token" });

      // find user by clerkId in the database
      const user = await User.findOne({ clerkId });
      if (!user) return res.status(404).json({ message: "User not found" });
      req.user = user; // Attach the user object to the request for use in subsequent middleware/routes
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
