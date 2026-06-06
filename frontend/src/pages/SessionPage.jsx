import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { runCodeAPI } from "../lib/jdoodle.js";
import {
  extractResultLines,
  formatExpectedForDisplay,
  outputsMatch,
} from "../lib/testRunner.js";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ProblemDescription from "../components/ProblemDescription";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import { hydrateProblemStarterCode } from "../constants/starterTemplates.js";

import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [problemData, setProblemData] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(false);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // Sessions store problem title from MongoDB — fetch full problem from API (not static PROBLEMS)
  useEffect(() => {
    if (!session?.problem) return;

    const fetchProblem = async () => {
      setLoadingProblem(true);
      try {
        const listRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/problems/all-questions`,
          { withCredentials: true }
        );
        const match = listRes.data?.data?.find((p) => p.title === session.problem);
        if (!match?.id) {
          setProblemData(null);
          return;
        }

        const detailRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/problems/question/${match.id}`,
          { withCredentials: true }
        );
        setProblemData(hydrateProblemStarterCode(detailRes.data?.data ?? null));
      } catch (err) {
        console.error("Failed to load problem for session:", err);
        setProblemData(null);
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchProblem();
  }, [session?.problem]);

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });

    // remove the joinSessionMutation, refetch from dependencies to avoid infinite loop
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput("");
  };

  // const handleRunCode = async () => {
  //   setIsRunning(true);
  //   setOutput(null);

  //   const result = await executeCode(selectedLanguage, code);
  //   setOutput(result);
  //   setIsRunning(false);
  // };


  const handleRunCode = async () => {
    if (!problemData) return;
    if (!problemData.testCases?.length) return;

    const fnName =
      typeof problemData.functionName === "string"
        ? problemData.functionName
        : problemData.functionName?.[selectedLanguage];
    if (!fnName) {
      return toast.error(
        `No function name for ${selectedLanguage}. Add functionName when creating the problem.`
      );
    }

    setIsRunning(true);
    setOutput("");

    try {
      const result = await runCodeAPI({
        code,
        language: selectedLanguage,
        testCases: problemData.testCases,
        functionName: problemData.functionName,
        parameters: problemData.parameters,
      });

      if (!result.success) {
        setOutput(`Error:\n${result.error}`);
        return;
      }

      const actualOutputs = extractResultLines(result.output);

      const testResults = problemData.testCases.map((testCase, index) => {
        const actual = actualOutputs[index] ?? "(no output)";
        const passed =
          actual !== "(no output)" && outputsMatch(actual, testCase.output);
        return {
          index: index + 1,
          actual,
          expected: formatExpectedForDisplay(testCase.output),
          passed,
        };
      });

      const allPassed = testResults.every((t) => t.passed);

      const outputText = testResults
        .map(
          (t) =>
            `Test ${t.index}: ${t.passed ? "✅ PASSED" : "❌ FAILED"}\n  Expected : ${t.expected}\n  Got      : ${t.actual}`
        )
        .join("\n\n");

      const summary = `\n─────────────────────\n${allPassed
        ? "🎉 All test cases passed!"
        : `${testResults.filter((t) => t.passed).length}/${testResults.length} passed`
        }\nCPU: ${result.cpuTime}s  |  Memory: ${result.memory} KB`;

      setOutput(outputText + summary);
    } catch (err) {
      setOutput(`Unexpected error:\n${err.message}`);
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="vertical">
              {/* PROBLEM DSC PANEL */}
              <Panel defaultSize={50} minSize={20}>
                <div className="h-full flex flex-col overflow-hidden bg-base-200">
                  <div className="p-4 bg-base-100 border-b border-base-300 flex items-center justify-between gap-3 shrink-0">
                    <p className="text-sm text-base-content/70">
                      Host: {session?.host?.name || "Loading..."} •{" "}
                      {session?.participant ? 2 : 1}/2 participants
                    </p>
                    <div className="flex items-center gap-2">
                      {isHost && session?.status === "active" && (
                        <button
                          onClick={handleEndSession}
                          disabled={endSessionMutation.isPending}
                          className="btn btn-error btn-sm gap-2"
                        >
                          {endSessionMutation.isPending ? (
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOutIcon className="w-4 h-4" />
                          )}
                          End Session
                        </button>
                      )}
                      {session?.status === "completed" && (
                        <span className="badge badge-ghost">Completed</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {loadingProblem ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : problemData ? (
                      <ProblemDescription problem={problemData} />
                    ) : (
                      <div className="p-6 text-base-content/70">
                        Problem details could not be loaded for &quot;{session?.problem}&quot;.
                      </div>
                    )}
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={50} minSize={20}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditorPanel
                      selectedLanguage={selectedLanguage}
                      code={code}
                      isRunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={(value) => setCode(value)}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !isHost && !isParticipant ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Joining session...</p>
                  </div>
                </div>
              ) : !streamClient || !call ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">
                        Unable to connect to the video call. Check Stream API keys and backend auth.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <StreamVideo client={streamClient}>
                    <StreamCall call={call}>
                      <VideoCallUI chatClient={chatClient} channel={channel} />
                    </StreamCall>
                  </StreamVideo>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
