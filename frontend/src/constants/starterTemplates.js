function cleanName(name) {
    return typeof name === "string" && name.trim() ? name.trim() : "solution";
}

function cleanType(type, fallback = "ReturnType") {
    return typeof type === "string" && type.trim() ? type.trim() : fallback;
}

function getParamEntries(parameters = []) {
    return parameters
        .filter((param) => param?.name && param.name.trim())
        .map((param) => ({
            name: param.name.trim(),
            type: cleanType(param.type, "any"),
        }));
}

function getUntypedParamList(parameters = []) {
    return getParamEntries(parameters).map((param) => param.name).join(", ");
}

function getTypedParamList(parameters = [], formatter) {
    return getParamEntries(parameters).map(formatter).join(", ");
}

export function buildStarterTemplate(
    lang,
    { functionName = "", parameters = [], returnType = "" } = {}
) {
    const name = cleanName(functionName);
    const jsParams = getUntypedParamList(parameters);
    const typedReturnType = cleanType(returnType);

    switch (lang) {
        case "javascript":
            return `function ${name}(${jsParams}) {\n  // Write your solution here\n}`;
        case "python":
            return `def ${name}(${jsParams}):\n    # Write your solution here\n    pass`;
        case "java": {
            const javaParams = getTypedParamList(parameters, (param) => `${cleanType(param.type, "Object")} ${param.name}`);
            return `class Solution {\n    public ${typedReturnType} ${name}(${javaParams}) {\n        // Write your solution here\n    }\n}`;
        }
        case "cpp": {
            const cppParams = getTypedParamList(parameters, (param) => `${cleanType(param.type, "auto")} ${param.name}`);
            return `class Solution {\npublic:\n    ${typedReturnType} ${name}(${cppParams}) {\n        // Write your solution here\n    }\n};`;
        }
        case "typescript": {
            const tsParams = getTypedParamList(parameters, (param) => `${param.name}: ${cleanType(param.type, "any")}`);
            return `function ${name}(${tsParams}): ${typedReturnType} {\n  // Write your solution here\n}`;
        }
        case "go": {
            const goParams = getTypedParamList(parameters, (param) => `${param.name} ${cleanType(param.type, "interface{}")}`);
            return `func ${name}(${goParams}) ${typedReturnType} {\n    // Write your solution here\n}`;
        }
        case "rust": {
            const rustParams = getTypedParamList(parameters, (param) => `${param.name}: ${cleanType(param.type, "()")}`);
            return `fn ${name}(${rustParams}) -> ${typedReturnType} {\n    // Write your solution here\n}`;
        }
        default:
            return "";
    }
}

function resolveFunctionName(functionName, lang) {
    if (typeof functionName === "string") return functionName;
    if (functionName && typeof functionName === "object") {
        return functionName[lang] ?? functionName.javascript ?? "";
    }
    return "";
}

function shouldHydrateStarterCode(code) {
    if (!code || !String(code).trim()) return true;
    const text = String(code);
    return text.includes("(params)") || text.includes("ReturnType");
}

export function hydrateProblemStarterCode(problem) {
    if (!problem) return problem;

    const starterCode = problem.starterCode ?? {};
    const languages = new Set([
        ...Object.keys(starterCode),
        ...(problem.functionName && typeof problem.functionName === "object"
            ? Object.keys(problem.functionName)
            : []),
    ]);

    const hydratedStarterCode = { ...starterCode };

    languages.forEach((lang) => {
        if (!shouldHydrateStarterCode(hydratedStarterCode[lang])) return;
        hydratedStarterCode[lang] = buildStarterTemplate(lang, {
            functionName: resolveFunctionName(problem.functionName, lang),
            parameters: problem.parameters,
            returnType: problem.returnType,
        });
    });

    return {
        ...problem,
        starterCode: hydratedStarterCode,
    };
}

const starterTemplates = {
    javascript: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("javascript", { functionName: name, parameters, returnType }),
    python: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("python", { functionName: name, parameters, returnType }),
    java: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("java", { functionName: name, parameters, returnType }),
    cpp: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("cpp", { functionName: name, parameters, returnType }),
    typescript: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("typescript", { functionName: name, parameters, returnType }),
    go: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("go", { functionName: name, parameters, returnType }),
    rust: (name, parameters = [], returnType = "") =>
        buildStarterTemplate("rust", { functionName: name, parameters, returnType }),
};

export default starterTemplates;
