import { useUser, useAuth } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import CreateProblemPage from "./pages/CreateProblemPage";
import { Toaster } from "react-hot-toast";

function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const token = getToken();
  console.log("TOKEN:", token);

  if (!isLoaded) return null;

  // Get role from Clerk publicMetadata
  const role = user?.publicMetadata?.role || "user"; // Default to "user" if no role is set
  console.log("User role:", role);
  const isAdmin = role === "admin";

  console.log("User signed in:", isSignedIn);
  return (
    <>
      <Routes>
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"} />} />
        <Route path="/create-problem" element={isSignedIn && isAdmin ? <CreateProblemPage /> : <Navigate to={"/dashboard"} replace />} />
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to={"/"} />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
