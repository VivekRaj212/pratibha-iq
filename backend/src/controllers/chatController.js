import { chatClient } from "../utils/streamClient.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = await chatClient.createToken(req.user.clerkId);
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
};
