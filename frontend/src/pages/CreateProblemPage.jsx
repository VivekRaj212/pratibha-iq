import { useState } from "react";
import TagInput from "../components/TagInput";
import ALL_LANGUAGES from "../constants/languages.js";
import starterTemplates from "../constants/starterTemplates.js";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

function SectionCard({ title, children }) {
    return (
        <div className="card bg-base-100 shadow-sm mb-4">
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                {children}
            </div>
        </div>
    );
}

function InputField({ placeholder, value, onChange, className = "" }) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition ${className}`}
        />
    );
}

function RemoveButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg px-2 py-1 text-lg leading-none transition flex-shrink-0"
        >
            &times;
        </button>
    );
}

function AddButton({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="mt-2 inline-flex items-center gap-1.5 text-blue-500 border border-blue-400 rounded-lg px-3 py-1.5 text-xs hover:bg-blue-50 transition"
        >
            + {label}
        </button>
    );
}

const defaultLangData = (lang) => ({
    functionName: "",
    starterCode: starterTemplates[lang]?.("") ?? "",
});

export default function CreateProblemPage() {
    // Basic Info
    const [problemId, setProblemId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("Easy");
    const [allTags, setAllTags] = useState([]);
    const { getToken } = useAuth();

    const handleTagsChange = (newTags) => {
        setAllTags(newTags);
        console.log("Tags received from child:", newTags);
    };

    // Shared return type
    const [returnType, setReturnType] = useState("");

    // Languages — each has its own functionName + starterCode
    const [activeLanguages, setActiveLanguages] = useState(["javascript"]);
    const [activeLang, setActiveLang] = useState("javascript");
    const [selectedLang, setSelectedLang] = useState("javascript");
    const [langData, setLangData] = useState({
        javascript: defaultLangData("javascript"),
    });

    // Parameters
    const [params, setParams] = useState([{ name: "", type: "" }]);

    // Test Cases — shared across all languages
    const [testCases, setTestCases] = useState([{ input: "", output: "" }]);

    // Constraints
    const [constraints, setConstraints] = useState([""]);

    // Examples
    const [examples, setExamples] = useState([{ input: "", output: "", explanation: "" }]);

    // ── Language helpers ──

    function addLanguage() {
        if (activeLanguages.includes(selectedLang)) return;
        setActiveLanguages((prev) => [...prev, selectedLang]);
        setLangData((prev) => ({
            ...prev,
            [selectedLang]: defaultLangData(selectedLang),
        }));
        setActiveLang(selectedLang);
    }

    function removeActiveLang() {
        if (activeLanguages.length <= 1) return;
        const newLangs = activeLanguages.filter((l) => l !== activeLang);
        setActiveLanguages(newLangs);
        setActiveLang(newLangs[0]);
    }

    function updateLangField(lang, field, value) {
        setLangData((prev) => {
            const entry = { ...prev[lang], [field]: value };
            if (field === "functionName" && starterTemplates[lang]) {
                entry.starterCode = starterTemplates[lang](value);
            }
            return { ...prev, [lang]: entry };
        });
    }

    // Params
    const updateParam = (i, field, val) => {
        const updated = [...params];
        updated[i][field] = val;
        setParams(updated);
    };
    const removeParam = (i) => setParams(params.filter((_, idx) => idx !== i));

    // Test cases
    const updateTestCase = (i, field, val) => {
        const updated = [...testCases];
        updated[i][field] = val;
        setTestCases(updated);
    };
    const removeTestCase = (i) => setTestCases(testCases.filter((_, idx) => idx !== i));

    // Constraints
    const updateConstraint = (i, val) => {
        const updated = [...constraints];
        updated[i] = val;
        setConstraints(updated);
    };
    const removeConstraint = (i) => setConstraints(constraints.filter((_, idx) => idx !== i));

    // Examples
    const updateExample = (i, field, val) => {
        const updated = [...examples];
        updated[i][field] = val;
        setExamples(updated);
    };
    const removeExample = (i) => setExamples(examples.filter((_, idx) => idx !== i));

    const submitProblem = async () => {

        // ==================== FORM VALIDATION ====================

        const errors = [];
        // Basic Info
        if (!problemId.trim()) errors.push("Problem ID is required.");
        if (!title.trim()) errors.push("Title");

        // Categories/Tags
        if (allTags.length === 0) errors.push("At least one Category/Tag");

        // Return Type
        if (!returnType.trim()) errors.push("Return Type");

        // Function Names for all languages
        for (const lang of activeLanguages) {
            if (!langData[lang]?.functionName?.trim()) {
                errors.push(`Function Name for ${lang.toUpperCase()}`);
            }
        }

        // Parameters (at least one with name)
        const validParams = params.filter(p => p.name && p.name.trim() !== "");
        if (validParams.length === 0) errors.push("At least one Parameter");

        // Test Cases (at least one complete test case)
        const validTestCases = testCases.filter(tc => tc.input.trim() && tc.output.trim());
        if (validTestCases.length === 0) errors.push("At least one Test Case");


        // ==================== SHOW SINGLE TOAST IF ERRORS ====================
        if (errors.length > 0) {
            toast.error(`Please fill all required fields`);
            // toast.error(`Please fill all required fields:\n• ${errors.join("\n• ")}`);
            return;
        }

        // ==================== Validate Test Case JSON Format ====================
        const parsedTestCases = [];
        for (const tc of testCases) {
            if (!tc.input || !tc.output) continue;
            try {
                parsedTestCases.push({
                    input: JSON.parse(tc.input),   // string → actual array
                    output: tc.output,
                });
            } catch {
                alert(`Invalid input format in test case: "${tc.input}"\nMust be valid JSON array, e.g. ["11","123"]`);
                return;
            }
        }

        const payload = {
            id: problemId,
            title,
            description,
            difficulty,
            category: allTags,
            functionName: Object.fromEntries(
                activeLanguages.map((l) => [l, langData[l]?.functionName ?? ""])
            ),
            parameters: params.filter((p) => p.name),
            returnType,
            starterCode: Object.fromEntries(
                activeLanguages.map((l) => [l, langData[l]?.starterCode ?? ""])
            ),
            testCases: parsedTestCases,            // ✅ flat array, input is real array
            constraints: constraints.filter(Boolean),
            examples: examples.filter((e) => e.input || e.output),
        };

        // ==================== CALL API ====================
        try {
            toast.loading("Creating problem...", { id: "submit" });

            const token = await getToken();

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/problems/create-question`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success("Problem created successfully! 🎉", { id: "submit" });

            console.log("✅ API Response:", response.data);

            // Optional: Reset form after success
            // resetForm();

        } catch (error) {
            console.error("❌ API Error:", error);

            const errorMsg = error.response?.data?.message || error.message || "Failed to create problem";

            toast.error(errorMsg, { id: "submit" });
        }
    }

    return (
        <div className="min-h-screen py-10 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-semibold text-center mb-7">
                    Create Problem
                </h1>

                {/* Basic Info */}
                <SectionCard title="Basic info">
                    <InputField
                        placeholder="Problem ID"
                        value={problemId}
                        onChange={setProblemId}
                        className="mb-3"
                    />
                    <InputField
                        placeholder="Title"
                        value={title}
                        onChange={setTitle}
                        className="mb-3"
                    />
                    <textarea
                        placeholder="Description"
                        rows={5}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-y"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <label className="select">
                            <span className="label">Difficulty</span>
                            <select>
                                <option>Easy</option>
                                <option>Medium</option>
                                <option>Hard</option>
                            </select>
                        </label>
                        <TagInput onTagsChange={handleTagsChange} />
                    </div>
                </SectionCard>

                {/* Function Details */}
                <SectionCard title="Function details">
                    {/* Shared return type */}
                    <div className="mb-4">
                        <InputField
                            placeholder="Return type (e.g. string, int, boolean)"
                            value={returnType}
                            onChange={setReturnType}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Shared across all languages
                        </p>
                    </div>

                    {/* Language picker */}
                    <div className="flex gap-2 items-center flex-wrap mb-4">
                        <select
                            value={selectedLang}
                            onChange={(e) => setSelectedLang(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 bg-white"
                        >
                            {ALL_LANGUAGES.map((l) => (
                                <option key={l.value} value={l.value}>
                                    {l.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={addLanguage}
                            className="text-blue-500 border border-blue-400 bg-blue-50 rounded-lg px-3 py-1.5 text-xs hover:bg-blue-100 transition"
                        >
                            + Add language
                        </button>
                        <button
                            onClick={removeActiveLang}
                            className="text-red-400 border border-red-300 bg-red-50 rounded-lg px-3 py-1.5 text-xs hover:bg-red-100 transition"
                        >
                            Remove current
                        </button>
                    </div>

                    {/* Language tabs */}
                    <div className="flex gap-2 flex-wrap mb-4">
                        {activeLanguages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition ${activeLang === lang
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                    }`}
                            >
                                {ALL_LANGUAGES.find((l) => l.value === lang)?.label || lang}
                            </button>
                        ))}
                    </div>

                    {/* Per-language: functionName + starterCode */}
                    {activeLanguages.map((lang) => (
                        <div key={lang} className={lang === activeLang ? "block" : "hidden"}>
                            <InputField
                                placeholder="Function name"
                                value={langData[lang]?.functionName ?? ""}
                                onChange={(v) => updateLangField(lang, "functionName", v)}
                                className="mb-3"
                            />
                            <textarea
                                rows={5}
                                value={langData[lang]?.starterCode ?? ""}
                                onChange={(e) =>
                                    updateLangField(lang, "starterCode", e.target.value)
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-y"
                                placeholder="Starter code"
                            />
                        </div>
                    ))}
                </SectionCard>

                {/* Parameters */}
                <SectionCard title="Parameters">
                    {params.map((p, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <InputField placeholder="Name" value={p.name} onChange={(v) => updateParam(i, "name", v)} />
                            <InputField placeholder="Type" value={p.type} onChange={(v) => updateParam(i, "type", v)} />
                            <RemoveButton onClick={() => removeParam(i)} />
                        </div>
                    ))}
                    <AddButton label="Add parameter" onClick={() => setParams([...params, { name: "", type: "" }])} />
                </SectionCard>

                {/* Test Cases — shared across all languages */}
                <SectionCard title="Test cases">
                    <p className="text-xs text-gray-400 mb-3">
                        Shared across all languages. Input must be a valid JSON array e.g. ["11","123"]
                    </p>
                    {testCases.map((tc, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <InputField
                                placeholder='Input e.g. ["11","123"]'
                                value={tc.input}
                                onChange={(v) => updateTestCase(i, "input", v)}
                            />
                            <InputField
                                placeholder='Output e.g. "134"'
                                value={tc.output}
                                onChange={(v) => updateTestCase(i, "output", v)}
                            />
                            <RemoveButton onClick={() => removeTestCase(i)} />
                        </div>
                    ))}
                    <AddButton label="Add test case" onClick={() => setTestCases([...testCases, { input: "", output: "" }])} />
                </SectionCard>

                {/* Constraints */}
                <SectionCard title="Constraints">
                    {constraints.map((c, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-center">
                            <InputField
                                placeholder="e.g. 1 <= num1.length <= 10^4"
                                value={c}
                                onChange={(v) => updateConstraint(i, v)}
                            />
                            <RemoveButton onClick={() => removeConstraint(i)} />
                        </div>
                    ))}
                    <AddButton label="Add constraint" onClick={() => setConstraints([...constraints, ""])} />
                </SectionCard>

                {/* Examples */}
                <SectionCard title="Examples">
                    {examples.map((ex, i) => (
                        <div key={i} className="flex gap-2 mb-2 items-start">
                            <InputField placeholder="Input" value={ex.input} onChange={(v) => updateExample(i, "input", v)} />
                            <InputField placeholder="Output" value={ex.output} onChange={(v) => updateExample(i, "output", v)} />
                            <InputField
                                placeholder="Explanation"
                                value={ex.explanation}
                                onChange={(v) => updateExample(i, "explanation", v)}
                            />
                            <RemoveButton onClick={() => removeExample(i)} />
                        </div>
                    ))}
                    <AddButton
                        label="Add example"
                        onClick={() => setExamples([...examples, { input: "", output: "", explanation: "" }])}
                    />
                </SectionCard>

                {/* Submit */}
                <button
                    onClick={submitProblem}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition mt-1 cursor-pointer"
                >
                    Submit Problem
                </button>
            </div>
        </div>
    );
}