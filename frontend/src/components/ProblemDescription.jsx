import { getDifficultyBadgeClass } from "../lib/utils.js";

const ProblemDescription = ({
    problem,   // Added default
}) => {
    if (!problem) return <div className="p-6">No problem data</div>;

    return (
        <div className="h-full overflow-y-auto bg-base-200">
            {/* HEADER SECTION */}
            <div className="p-6 bg-base-100 border-b">
                <div className="flex items-start justify-between mb-3">
                    <h1 className="text-3xl font-bold text-base-content">
                        {problem.title}
                    </h1>
                    <span
                        className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}
                    >
                        {problem.difficulty}
                    </span>
                </div>

                {/* Fixed: category is an array */}
                {problem.category && problem.category.length > 0 && (
                    <p className="text-base-content/60">
                        {problem.category.join(" • ")}
                    </p>
                )}
            </div>

            <div className="p-6 space-y-6">
                {/* PROBLEM DESCRIPTION - Fixed */}
                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold text-base-content mb-4">Description</h2>
                    <div className="space-y-4 text-base leading-relaxed">
                        <p className="text-base-content/90 whitespace-pre-wrap">
                            {problem.description}
                        </p>
                    </div>
                </div>

                {/* EXAMPLES SECTION - Fixed */}
                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
                    <div className="space-y-4">
                        {problem.examples?.map((example, idx) => (
                            <div key={idx}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="badge badge-sm">{idx + 1}</span>
                                    <p className="font-semibold text-base-content">Example {idx + 1}</p>
                                </div>
                                <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                    <div className="flex gap-2">
                                        <span className="text-primary font-bold min-w-[70px]">Input:</span>
                                        <span>{example.input}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-secondary font-bold min-w-[70px]">Output:</span>
                                        <span>{example.output}</span>
                                    </div>
                                    {example.explanation && (
                                        <div className="pt-2 border-t border-base-300 mt-2">
                                            <span className="text-base-content/60 font-sans text-xs">
                                                <span className="font-semibold">Explanation:</span> {example.explanation}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONSTRAINTS - Fixed */}
                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                    <ul className="space-y-2 text-base-content/90">
                        {problem.constraints?.map((constraint, idx) => (
                            <div key={idx} className="bg-base-200 rounded-lg p-3 font-mono text-sm space-y-1.5">
                                <li className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    <code className="text-sm">{constraint}</code>
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProblemDescription;