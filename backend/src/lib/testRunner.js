/** Normalize problem test cases before JDoodle harness execution */

export function normalizeTestInput(input, parameters = []) {
  let value = input;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return [value];
    }
  }

  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    const paramNames = parameters.map((p) => p?.name).filter(Boolean);
    if (paramNames.length > 0) {
      return paramNames.map((name) => value[name]);
    }
    return Object.values(value);
  }

  return [value];
}

export function normalizeTestOutput(output) {
  if (typeof output === "string") {
    const trimmed = output.trim();
    try {
      return JSON.parse(trimmed);
    } catch {
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;
      if (trimmed === "null") return null;
      if (!Number.isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
      return trimmed;
    }
  }
  return output;
}

export function normalizeTestCases(testCases, parameters = []) {
  return testCases.map((tc) => ({
    input: normalizeTestInput(tc.input, parameters),
    output: normalizeTestOutput(tc.output),
  }));
}
