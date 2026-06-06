import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import CreateProblemPage from "./pages/CreateProblemPage";
import SessionPage from "./pages/SessionPage";
import { Toaster } from "react-hot-toast";
import { setAuthTokenGetter } from "./lib/axios";

function App() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

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
        <Route path="/session/:id" element={isSignedIn ? <SessionPage /> : <Navigate to={"/"} />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
