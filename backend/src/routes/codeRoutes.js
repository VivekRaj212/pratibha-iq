import express from "express";
import { runCodeController } from "../controllers/codeController.js";

const router = express.Router();

router.post("/run", runCodeController);

export default router;