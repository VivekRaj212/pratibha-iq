import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { createProblemSet, getAllProblems, getProblemById, updateProblemById } from "../controllers/problemSetController.js";

const router = express.Router();

router.post("/create-question", protectRoute, authorizeRoles("admin"), createProblemSet);

// router.get("/all-questions", getAllProblems);
router.get("/all-questions", protectRoute, getAllProblems);

// router.get("/question/:_id", getProblemById);

router.get("/question/:id", protectRoute, getProblemById);

// router.put("/question/update/:id", protectRoute, authorizeRoles("admin"), updateProblemById);

router.patch("/question/update/:id", protectRoute, updateProblemById);

export default router;
