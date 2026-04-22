import axios from "axios";

export const executeCode = async ({ code, language, stdin = "" }) => {
  const response = await axios.post(
    "https://api.jdoodle.com/v1/execute",
    {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: code,
      stdin: stdin,
      language: mapLanguage(language),
      versionIndex: "0",
      compileOnly: false
    }
  );

  return response.data;
};

function mapLanguage(lang) {
  return {
    javascript: "nodejs",
    python: "python3",
    java: "java"
  }[lang];
}