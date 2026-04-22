import { executeCode } from "../lib/jdoodleService.js";

export const runCodeController = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    const result = await executeCode({ code, language, stdin });

    res.json({
      success: result.isExecutionSuccess,
      output: result.output,
      error: result.error,
      cpuTime: result.cpuTime,
      memory: result.memory
    });

  } catch (error) {
    console.error("Execution error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};