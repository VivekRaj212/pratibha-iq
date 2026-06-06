export const runCodeAPI = async ({ code, language, testCases, functionName, parameters }) => {
  try {
    const controller = new AbortController();

    // ✅ 30 seconds — enough for Java/C++ compilation
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/code/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, testCases, functionName, parameters }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error("Invalid JSON response from server");
    }

    if (!res.ok) {
      throw new Error(data?.error || "Execution failed");
    }

    return data;

  } catch (err) {
    // ✅ Distinguish timeout from other errors
    const isTimeout = err.name === "AbortError";
    return {
      success: false,
      error: isTimeout ? "Request timed out — server took too long" : err.message
    };
  }
};