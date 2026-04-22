import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { PROBLEMS } from "../data/problems";
// import { Divide } from "lucide-react";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { runCodeAPI } from "../lib/jdoodle.js";
import axios from "axios";

const ProblemPage = () => {
    const { id } = useParams();           // This is now the slug or ObjectId from URL

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

                // If your backend returns the full problem data:
                setFetchedProblem(res.data);

                // Set initial code when problem loads
                if (res.data?.data?.starterCode?.javascript) {
                    setCode(res.data.data.starterCode.javascript);
                } else if (res.data?.data?.starterCode) {
                    // Fallback if starterCode structure is different
                    const firstLang = Object.keys(res.data.data.starterCode)[0];
                    if (firstLang) setCode(res.data.data.starterCode[firstLang]);
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

    // Handle language change
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

    const normalizeOutput = (output) => {
        // normalize output for comparison (trim whitespace, handle different spacing)
        return output
            .trim()
            .split("\n")
            .map((line) =>
                line
                    .trim()
                    // remove spaces after [ and before ]
                    .replace(/\[\s+/g, "[")
                    .replace(/\s+\]/g, "]")
                    // normalize spaces around commas to single space after comma
                    .replace(/\s*,\s*/g, ",")
            )
            .filter((line) => line.length > 0)
            .join("\n");
    };

    const checkIfTestsPassed = (actualOutput, expectedOutput) => {
        const normalizedActual = normalizeOutput(actualOutput);
        const normalizedExpected = normalizeOutput(expectedOutput);

        return normalizedActual == normalizedExpected;
    };

    const handleRunCode = async () => {
        const problemData = fetchedProblem?.data;


        if (!problemData) {
            toast.error("Problem data not loaded yet");
            return;
        }

        // Check if testCases exist
        if (!problemData.testCases || problemData.testCases.length === 0) {
            toast.error("No test cases found for this problem");
            return;
        }

        setIsRunning(true);
        setOutput("");

        try {
            const result = await runCodeAPI({
                code,
                language: selectedLanguage,
            });

            setIsRunning(false);

            if (result.success) {
                setOutput(result.output || "No output");

                // ✅ Use first test case from your schema
                const firstTestCase = problemData.testCases[0];
                const expectedOutput = firstTestCase.output;

                if (expectedOutput === undefined) {
                    toast.error("Test case output is missing");
                    return;
                }

                console.log("real result:", result);
                console.log("expected output:", expectedOutput);

                const testsPassed = checkIfTestsPassed(
                    result.output.trim(),
                    String(expectedOutput).trim()   // Safe conversion
                );

                if (testsPassed) {
                    triggerConfetti();
                    toast.success("All tests passed! Great job!");
                } else {
                    toast.error("Tests failed. Check your output!");
                }

            } else {
                console.error("Full execution error from JDoodle:", result.error);
                toast.error(result.error || "Execution failed");
            }
        } catch (err) {
            setIsRunning(false);
            toast.error("Failed to run code");
            console.error(err);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="h-screen bg-base-100 flex items-center justify-center">
                <div className="text-xl">Loading problem...</div>
            </div>
        );
    }

    // Error State
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
                        {/*left panel - problem desc*/}
                        <ProblemDescription
                            problem={problem}  // You can pass list later if needed
                        />
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />
                    {/*right panel -  code edito and output*/}
                    <Panel defaultSize={60} minSize={30}>
                        <PanelGroup direction="vertical">
                            {/* Top panel - Code editor */}
                            <Panel defaultSize={70} minSize={30}>
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

                            {/* Bottom panel - Output Panel*/}

                            <Panel defaultSize={30} minSize={30}>
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
