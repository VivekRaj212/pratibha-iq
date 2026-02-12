import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key and secret is missing.");
}

export const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await serverClient.upsertUser(userData);
    console.log("Stream user successfully upserted:", userData);
  } catch (error) {
    console.error("Failed to upsert Stream user:", error);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await serverClient.deleteUser(userId);
    console.log("Stream user successfully deleted:", userId);
  } catch (error) {
    console.error("Failed to delete Stream user:", error);
  }
};
