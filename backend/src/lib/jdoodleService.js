export const executeCode = async ({ code, language, stdin = "" }) => {
  const mappedLang = mapLanguage(language);

  if (!mappedLang) {
    throw new Error(`Unsupported language: ${language}`);
  }

  if (!process.env.JDOODLE_CLIENT_ID || !process.env.JDOODLE_CLIENT_SECRET) {
    throw new Error("JDoodle credentials are not configured");
  }

  const response = await fetch("https://api.jdoodle.com/v1/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      stdin,
      language: mappedLang,
      versionIndex: "0",
      compileOnly: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "JDoodle execution failed");
  }

  return data;
};

function mapLanguage(lang) {
  const map = {
    javascript: "nodejs",
    python: "python3",
    java: "java",
    cpp: "cpp17",
    c: "c",
  };
  return map[lang] ?? null;
}
