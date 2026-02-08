import { SignInButton } from "@clerk/clerk-react";
import "./App.css";

function App() {
  return (
    <>
      <h1>Welcome to PratibhaIQ</h1>
      <SignInButton mode="modal" />
    </>
  );
}

export default App;
