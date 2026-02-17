import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import toast from "react-hot-toast";

const HomePage = () => {
  // fetch some data without using tanstack
  return (
    <>
      <h1 className="text-3xl font-bold">Welcome to PratibhaIQ</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => toast.success("operation successful")}
      >
        Show Toast
      </button>
      <SignedOut>
        <SignInButton mode="modal">
          <button>Login</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <UserButton />
    </>
  );
};

export default HomePage;
