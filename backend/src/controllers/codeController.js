import { executeCode } from "../lib/jdoodleService.js";
import { normalizeTestCases } from "../lib/testRunner.js";

const RESULT_MARKER = "__CODEX_RESULT__";

export const runCodeController = async (req, res) => {
  try {
    const { code, language, stdin, testCases, functionName, parameters } = req.body;

    if (!code || !language) {
      return res.status(400).json({ success: false, error: "Code and language are required" });
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ success: false, error: "No test cases provided" });
    }

    const fnName = resolveFunctionName(functionName, language);
    if (!fnName) {
      return res.status(400).json({
        success: false,
        error: `functionName for "${language}" is required (set it when creating the problem)`,
      });
    }

    const normalizedTests = normalizeTestCases(testCases, parameters);
    const wrappedCode = buildWrappedCode(code, language, normalizedTests, fnName, parameters);
    const resultData = await executeCode({ code: wrappedCode, language, stdin });

    res.json({
      success: Boolean(resultData.isExecutionSuccess),
      output: resultData.output || "",
      error: resultData.error || "",
      cpuTime: resultData.cpuTime,
      memory: resultData.memory,
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/** functionName may be a string or { javascript: "twoSum", python: "two_sum", ... } */
export function resolveFunctionName(functionName, language) {
  if (!functionName) return null;
  if (typeof functionName === "string") return functionName.trim() || null;
  if (typeof functionName === "object") {
    const name = functionName[language] ?? functionName.javascript;
    return typeof name === "string" && name.trim() ? name.trim() : null;
  }
  return null;
}

export function buildWrappedCode(code, language, testCases, functionName, parameters = []) {
  switch (language) {
    case "javascript":
      return wrapJavaScript(code, testCases, functionName);
    case "python":
      return wrapPython(code, testCases, functionName);
    case "java":
      return wrapJava(code, testCases, functionName);
    default:
      return code;
  }
}

function wrapJavaScript(code, testCases, functionName) {
  const safeName = JSON.stringify(functionName);
  const safeMarker = JSON.stringify(RESULT_MARKER);
  // testCases are pre-normalized: each test.input is already an argument array
  return `
${code}

const __tests = ${JSON.stringify(testCases)};
const __fnName = ${safeName};
const __resultMarker = ${safeMarker};

function __resolveUserFunction(name) {
  if (typeof global !== "undefined" && typeof global[name] === "function") return global[name];
  if (typeof globalThis !== "undefined" && typeof globalThis[name] === "function") return globalThis[name];
  try {
    const candidate = eval(name);
    if (typeof candidate === "function") return candidate;
  } catch (_) {}
  return null;
}

const __solve = __resolveUserFunction(__fnName);

__tests.forEach((test) => {
  try {
    if (!__solve) {
      console.log(__resultMarker + JSON.stringify({ error: "Function '" + __fnName + "' not found" }));
      return;
    }
    const args = Array.isArray(test.input) ? test.input : [test.input];
    const result = __solve(...args);
    console.log(__resultMarker + JSON.stringify(result));
  } catch (err) {
    console.log(__resultMarker + JSON.stringify({ error: String(err.message || err) }));
  }
});
`;
}

function wrapPython(code, testCases, functionName) {
  const safeName = functionName.replace(/[^a-zA-Z0-9_]/g, "");
  return `
import json

${code}

__tests = ${JSON.stringify(testCases)}
__fn_name = ${JSON.stringify(safeName)}
__result_marker = ${JSON.stringify(RESULT_MARKER)}

def __run_tests():
    solve = globals().get(__fn_name)
    if not callable(solve):
        for _t in __tests:
            print(__result_marker + json.dumps({"error": "Function not found"}))
        return
    for test in __tests:
        try:
            inp = test.get("input", [])
            args = inp if isinstance(inp, list) else [inp]
            result = solve(*args)
            print(__result_marker + json.dumps(result))
        except Exception as e:
            print(__result_marker + json.dumps({"error": str(e)}))

__run_tests()
`;
}

function wrapJava(code, testCases, functionName) {
  const safeMethod = functionName.replace(/[^a-zA-Z0-9_]/g, "");
  const testBlock = testCases
    .map((test) => {
      const args = Array.isArray(test.input) ? test.input : [test.input];
      const argList = args.map((a) => toJavaLiteral(a)).join(", ");
      return `      System.out.println("${RESULT_MARKER}" + __toJson(sol.${safeMethod}(${argList})));`;
    })
    .join("\n");

  return `
import java.util.*;

${code}

class Main {
  static String __toJson(Object o) {
    if (o == null) return "null";
    if (o instanceof Boolean) return ((Boolean) o) ? "true" : "false";
    if (o instanceof Number) return o.toString();
    if (o instanceof String) return "\\"" + o.toString().replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";
    if (o instanceof int[]) {
      int[] arr = (int[]) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < arr.length; i++) {
        if (i > 0) sb.append(',');
        sb.append(arr[i]);
      }
      return sb.append(']').toString();
    }
    if (o instanceof Integer[]) {
      Integer[] arr = (Integer[]) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < arr.length; i++) {
        if (i > 0) sb.append(',');
        sb.append(arr[i]);
      }
      return sb.append(']').toString();
    }
    if (o instanceof List) {
      List<?> list = (List<?>) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < list.size(); i++) {
        if (i > 0) sb.append(',');
        sb.append(__toJson(list.get(i)));
      }
      return sb.append(']').toString();
    }
    return "\\"" + o.toString().replace("\\"", "\\\\\\"") + "\\"";
  }

  public static void main(String[] args) {
    Solution sol = new Solution();
    try {
${testBlock}
    } catch (Exception e) {
      System.out.println("${RESULT_MARKER}{\\"error\\":\\"" + e.getMessage().replace("\\"", "\\\\\\"") + "\\"}");
    }
  }
}
`;
}

function toJavaLiteral(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
  if (typeof value === "string") return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === "number" && Number.isInteger(v))) {
      return `new int[]{${value.join(",")}}`;
    }
    if (value.every((v) => typeof v === "string")) {
      return `new String[]{${value.map((s) => toJavaLiteral(s)).join(",")}}`;
    }
  }
  return "null";
}
