import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { runCodeAPI } from "../lib/jdoodle.js";
import { hydrateProblemStarterCode } from "../constants/starterTemplates.js";
import {
    extractResultLines,
    formatExpectedForDisplay,
    outputsMatch,
} from "../lib/testRunner.js";
import axios from "axios";

const ProblemPage = () => {
    const { id } = useParams();

    const [selectedLanguage, setSelectedLanguage] = useState("javascript");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const [fetchedProblem, setFetchedProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchProblem = async () => {
            setLoading(true);
            setError(null);
            setOutput("");
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/problems/question/${id}`, { withCredentials: true });

                console.log("✅ Problem fetched successfully:", res.data);

                const hydratedProblem = hydrateProblemStarterCode(res.data?.data);
                setFetchedProblem({
                    ...res.data,
                    data: hydratedProblem,
                });

                if (hydratedProblem?.starterCode?.javascript) {
                    setCode(hydratedProblem.starterCode.javascript);
                } else if (hydratedProblem?.starterCode) {
                    const firstLang = Object.keys(hydratedProblem.starterCode)[0];
                    if (firstLang) setCode(hydratedProblem.starterCode[firstLang]);
                }
            } catch (err) {
                console.error("Error fetching problem:", err);
                const errorMsg = err.response?.data?.message || err.message || "Failed to load problem";
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    console.log("Fetched problem from backend:", fetchedProblem);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setSelectedLanguage(newLang);

        if (fetchedProblem?.data?.starterCode) {
            const newCode = fetchedProblem.data.starterCode[newLang];
            if (newCode) {
                setCode(newCode);
            } else {
                toast.error(`Starter code not available for ${newLang}`);
            }
        }
        setOutput("");
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 80,
            spread: 250,
            origin: { x: 0.2, y: 0.6 },
        });
        confetti({
            particleCount: 80,
            spread: 250,
            origin: { x: 0.2, y: 0.6 },
        });
    }

    const handleRunCode = async () => {
        const problemData = fetchedProblem?.data;

        if (!problemData) return toast.error("Problem data not loaded yet");
        if (!problemData.testCases || problemData.testCases.length === 0)
            return toast.error("No test cases found for this problem");

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
                toast.error(result.error || "Execution failed");
                setOutput(`Error:\n${result.error}`);  // ✅ show error in panel
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

            console.log("show test results:", testResults);

            const allPassed = testResults.every(t => t.passed);

            console.log("all passed?", allPassed);

            // ✅ Build readable output string for OutputPanel
            const outputText = testResults.map(t =>
                `Test ${t.index}: ${t.passed ? "✅ PASSED" : "❌ FAILED"}\n  Expected : ${t.expected}\n  Got      : ${t.actual}`
            ).join("\n\n");

            const summary = `\n─────────────────────\n${allPassed
                ? "🎉 All test cases passed!"
                : `${testResults.filter(t => t.passed).length}/${testResults.length} passed`
                }\nCPU: ${result.cpuTime}s  |  Memory: ${result.memory} KB`;

            setOutput(outputText + summary);  // ✅ this is what was missing

            console.log("Test results:", testResults);

            if (allPassed) {
                toast.success("All tests passed! 🎉");
                triggerConfetti();
            } else {
                toast.error("Some test cases failed");
            }

        } catch (err) {
            toast.error("Failed to run code");
            setOutput(`Unexpected error:\n${err.message}`);
            console.error(err);
        } finally {
            setIsRunning(false);  // ✅ moved to finally so it always resets
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-base-100 flex items-center justify-center">
                <div className="text-xl">Loading problem...</div>
            </div>
        );
    }

    if (error || !fetchedProblem?.data) {
        return (
            <div className="h-screen bg-base-100 flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 text-xl">Failed to load problem</div>
                <div className="text-gray-400">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        );
    }

    const problem = fetchedProblem.data;

    return (
        <div className="h-screen bg-base-100 flex flex-col">
            <Navbar />
            <div className="flex-1">
                <PanelGroup direction="horizontal">
                    <Panel defaultSize={40} minSize={30}>
                        <ProblemDescription problem={problem} />
                    </Panel>

                    <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction="vertical">
                            <Panel defaultSize={60} minSize={25}>
                                <CodeEditorPanel
                                    selectedLanguage={selectedLanguage}
                                    code={code}
                                    isRunning={isRunning}
                                    onLanguageChange={handleLanguageChange}
                                    onCodeChange={setCode}
                                    onRunCode={handleRunCode}
                                />
                            </Panel>

                            <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                            <Panel defaultSize={40} minSize={20}>
                                <OutputPanel output={output} />
                            </Panel>
                        </PanelGroup>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

export default ProblemPage;
