import mongoose from "mongoose";

/* ===================== TEST CASE ===================== */
const TestCaseSchema = new mongoose.Schema({
    input: {
        type: [mongoose.Schema.Types.Mixed], // supports arrays, numbers, strings
        required: true,
    },
    output: {
        type: mongoose.Schema.Types.Mixed,   // supports any return type
        required: true,
    }
}, { _id: false });

/* ===================== FUNCTION NAME ===================== */
const FunctionNameSchema = new mongoose.Schema({
    javascript: { type: String, required: true },
    python: { type: String },
    java: { type: String }
}, { _id: false });

/* ===================== STARTER CODE ===================== */
const StarterCodeSchema = new mongoose.Schema({
    javascript: { type: String },
    python: { type: String },
    java: { type: String }
}, { _id: false });

/* ===================== PARAMETERS ===================== */
const ParameterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }
}, { _id: false });

/* ===================== MAIN PROBLEM ===================== */
const ProblemSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },

    category: {
        type: [String]
    },

    functionName: FunctionNameSchema,

    parameters: [ParameterSchema],

    returnType: {
        type: String
    },

    starterCode: StarterCodeSchema,

    // Shared across all languages — same inputs/outputs regardless of language
    testCases: [TestCaseSchema],

    constraints: {
        type: [String]
    },

    examples: [
        {
            input: String,
            output: String,
            explanation: String
        }
    ]

}, {
    timestamps: true
});

export default mongoose.model("Problem", ProblemSchema);