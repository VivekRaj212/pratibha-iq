import { useNavigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [problemsError, setProblemsError] = useState(null);

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const {
    data: recentSessionsData,
    isLoading: loadingRecentSessions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyRecentSessions();


  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoadingProblems(true);
        setProblemsError(null);

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/problems/all-questions`,
          { withCredentials: true }
        );

        const data = res.data;

        if (data.success === false) {
          throw new Error(data.message || "Failed to fetch problems");
        }

        setProblems(data.data || []);
      } catch (err) {
        console.error(err);

        setProblemsError(
          err.response?.data?.message ||
          err.message ||
          "Something went wrong"
        );
      } finally {
        setLoadingProblems(false);
      }
    };

    fetchProblems();
  }, []);

  const handleCreateRoom = () => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    createSessionMutation.mutate(
      {
        problem: roomConfig.problem,
        difficulty: roomConfig.difficulty.toLowerCase(),
      },
      {
        onSuccess: (data) => {
          setShowCreateModal(false);
          navigate(`/session/${data.session._id}`);
        },
      }
    );
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.pages.flatMap((page) => page.sessions) || [];
  const totalCompletedSessions = recentSessionsData?.pages[0]?.total ?? recentSessions.length;

  const isUserInSession = (session) => {
    if (!user.id) return false;

    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowCreateModal(true)} />

        {/* Grid layout */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={totalCompletedSessions}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions
            sessions={recentSessions}
            isLoading={loadingRecentSessions}
            total={totalCompletedSessions}
            hasMore={hasNextPage}
            isLoadingMore={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setRoomConfig({ problem: "", difficulty: "" });
        }}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
        problems={problems}
        loading={loadingProblems}
        error={problemsError}
      />
    </>
  );
}

export default DashboardPage;
