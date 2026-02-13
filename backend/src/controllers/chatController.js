import { serverClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = serverClient.createToken(req.user.clerkId);
    res.status(200).json({
      token,
      userId: req.user.clerkId,
      username: req.user.username,
      userImage: req.user.image,
    });
  } catch (error) {
    console.log("Error in getStream controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}
