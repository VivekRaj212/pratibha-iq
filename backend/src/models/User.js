import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImg: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }, // It adds createdAt and updatedAt fields automatically
);

const User = mongoose.model("User", userSchema);

export default User;
