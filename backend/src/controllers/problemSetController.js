import { count } from "console";
import ProblemSchema from "../models/ProblemSet.js";


export const createProblemSet = async (req, res) => {

    try {
        console.log("request body", req.body);
        const problemData = req.body;
        // check if problem already exists
        const existing = await ProblemSchema.findOne({ id: problemData.id });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Problem with this ID already exists"
            });
        }

        const problem = new ProblemSchema(problemData);
        await problem.save();

        return res.status(201).json({
            success: true,
            message: "Problem created successfully",
            data: problem
        });
    } catch (error) {
        console.error("Create Problem Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating problem"
        });
    }
}

export const getAllProblems = async (req, res) => {
    try {
        const problems = await ProblemSchema.find({}).sort({ createdAt: -1 }).select("-__v"); // Exclude MongoDB internal fields
        return res.status(200).json({
            success: true,
            message: "Problems fetched successfully",
            count: problems.length,
            data: problems
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching problems"
        });
    }
}

export const getProblemById = async (req, res) => {

    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Problem ID is required"
            });
        }

        const problem = await ProblemSchema.findOne({ id: id });

        if (!problem) {
            return res.status(404).json({
                success: false,
                message: "Problem not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Problem fetched successfully",
            data: problem
        });
    } catch (error) {
        console.error("Error fetching problem:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching problem"
        });
    }
}

export const updateProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Problem _id is required"
            });
        }

        // Optional: Prevent updating certain sensitive fields
        const forbiddenFields = ['_id', 'id']; // 'id' is your custom string id
        forbiddenFields.forEach(field => delete updateData[field]);

        const updatedProblem = await ProblemSchema.findByIdAndUpdate(
            id,                          // Search by MongoDB _id
            updateData,
            {
                new: true,               // Return updated document
                runValidators: true      // Run schema validation
            }
        );

        if (!updatedProblem) {
            return res.status(404).json({
                success: false,
                message: `Problem with _id "${id}" not found`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Problem updated successfully",
            data: updatedProblem
        });

    } catch (error) {
        console.error("Error updating problem:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating problem",
            error: error.message
        });
    }
}