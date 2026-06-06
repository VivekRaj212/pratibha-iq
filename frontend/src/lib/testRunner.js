/** Parse JDoodle line output and compare with expected test case values */
const RESULT_MARKER = "__CODEX_RESULT__";

export function parseTestValue(raw) {
  if (raw === null || raw === undefined) return raw;
  if (typeof raw !== "string") return raw;

  const trimmed = raw.trim();
  if (!trimmed) return raw;

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "string") {
      try {
        return JSON.parse(parsed);
      } catch {
        return parsed;
      }
    }
    return parsed;
  } catch {
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "null") return null;
    return trimmed;
  }
}

export function outputsMatch(actualRaw, expectedRaw) {
  const actual = parseTestValue(actualRaw);
  const expected =
    typeof expectedRaw === "string" ? parseTestValue(expectedRaw) : expectedRaw;

  return JSON.stringify(actual) === JSON.stringify(expected);
}

/** Keep only lines that look like harness JSON results */
export function extractResultLines(output) {
  const lines = String(output ?? "")
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const markedLines = lines
    .filter((line) => line.startsWith(RESULT_MARKER))
    .map((line) => line.slice(RESULT_MARKER.length).trim())
    .filter((line) => line.length > 0);

  if (markedLines.length > 0) {
    return markedLines;
  }

  return lines.filter((line) => {
      if (line.startsWith("{") || line.startsWith("[")) return true;
      return /^(true|false|null|-?\d+(\.\d+)?)$/.test(line);
    });
}

export function formatExpectedForDisplay(expected) {
  if (typeof expected === "string") return expected;
  return JSON.stringify(expected);
}
