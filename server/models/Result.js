const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  semanticScore: { type: Number, default: 0 },
  skillsMatched: [{ type: String }],
  skillsMissing: [{ type: String }],
  educationMatch: { type: String, enum: ["Yes", "No"], default: "No" },
  experienceMatch: { type: String, enum: ["Yes", "No"], default: "No" },
  fit: { type: String, enum: ["Good", "Average", "Poor"], default: "Poor" },
});

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobDescription: {
      type: String,
      required: true,
    },
    candidates: [candidateSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
