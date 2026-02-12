import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { upsertStreamUser, deleteStreamUser } from "./stream.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pratibha-iq" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("🔥 SYNC USER FUNCTION EXECUTED");
    console.log("EVENT ID:", event.data.id);
    await connectDB();
    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const primaryEmail = email_addresses?.[0]?.email_address;
    if (!primaryEmail) {
      throw new Error("User has no email address");
    }

    const newUser = {
      clerkId: id,
      email: primaryEmail,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
    };
    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId,
      name: newUser.name,
      image: newUser.profileImage,
    });
  },
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  },
);

export const functions = [syncUser, deleteUserFromDB];
