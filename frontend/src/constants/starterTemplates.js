const starterTemplates = {
    javascript: (n) => `function ${n || "solution"}(params) {\n  // Write your solution here\n}`,

    python: (n) => `def ${n || "solution"}(params):\n    # Write your solution here\n    pass`,

    java: (n) =>
        `class Solution {\n    public ReturnType ${n || "solution"}(params) {\n        // Write your solution here\n    }\n}`,

    cpp: (n) =>
        `class Solution {\npublic:\n    ReturnType ${n || "solution"}(params) {\n        // Write your solution here\n    }\n};`,

    typescript: (n) =>
        `function ${n || "solution"}(params): ReturnType {\n  // Write your solution here\n}`,

    go: (n) =>
        `func ${n || "solution"}(params) ReturnType {\n    // Write your solution here\n}`,

    rust: (n) =>
        `fn ${n || "solution"}(params) -> ReturnType {\n    // Write your solution here\n}`,
};

export default starterTemplates;