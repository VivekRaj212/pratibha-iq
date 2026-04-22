import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {

  try {
    console.log("request headers:", req.headers); // Log the request headers for debugging
    let x = getAuth(req);
    console.log("getAuth result:", x); // Log the result of getAuth for debugging
    const { userId } = getAuth(req); // Get the authenticated user's ID from Clerk
    console.log("Authenticated user ID:", userId); // Log the user ID for debugging
    if (!userId)
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid Token" });

    // find user by clerkId in the database
    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    req.user = user; // Attach the user object to the request for use in subsequent middleware/routes
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
