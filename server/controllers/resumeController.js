const axios = require("axios");
const FormData = require("form-data");
const Result = require("../models/Result");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Upload resumes and job description for analysis
 * POST /api/upload
 */
const uploadAndAnalyze = async (req, res, next) => {
  try {
    const { job_description } = req.body;
    const files = req.files;

    if (!job_description || !job_description.trim()) {
      return res.status(400).json({ message: "Job description is required" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one resume PDF is required" });
    }

    // Build FormData to send to ML service
    const formData = new FormData();
    formData.append("job_description", job_description);

    for (const file of files) {
      formData.append("resumes", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }

    // Call ML service with long timeout (analysis can take 30-60s)
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000, // 120 seconds
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { results: candidates } = mlResponse.data;

    // Save results to MongoDB
    const result = await Result.create({
      userId: req.user.id,
      jobDescription: job_description,
      candidates,
    });

    res.status(201).json({
      message: "Analysis complete",
      result,
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "ML service is unavailable. Please ensure it is running on port 8000.",
      });
    }
    if (error.code === "ECONNABORTED") {
      return res.status(504).json({
        message: "Analysis timed out. Please try with fewer resumes.",
      });
    }
    next(error);
  }
};

/**
 * Get the latest analysis results for current user
 * GET /api/results
 */
const getResults = async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!results.length) {
      return res.status(404).json({ message: "No results found" });
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analysis history for current user
 * GET /api/history
 */
const getHistory = async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-candidates.skillsMatched -candidates.skillsMissing");

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full details of a specific result
 * GET /api/results/:id
 */
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ result });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a candidate from a result
 * DELETE /api/resume/:resultId/:candidateId
 */
const deleteResume = async (req, res, next) => {
  try {
    const { resultId, candidateId } = req.params;

    const result = await Result.findOne({
      _id: resultId,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    result.candidates = result.candidates.filter(
      (c) => c._id.toString() !== candidateId
    );
    await result.save();

    res.json({ message: "Candidate removed", result });
  } catch (error) {
    next(error);
  }
};

/**
 * Replace a candidate's resume and re-analyze
 * PUT /api/resume/:resultId/:candidateId
 */
const replaceResume = async (req, res, next) => {
  try {
    const { resultId, candidateId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "A replacement resume PDF is required" });
    }

    const result = await Result.findOne({
      _id: resultId,
      userId: req.user.id,
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    // Re-run ML scoring pipeline for the replacement resume
    const formData = new FormData();
    formData.append("job_description", result.jobDescription);
    formData.append("resumes", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, formData, {
      headers: formData.getHeaders(),
      timeout: 120000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const newCandidate = mlResponse.data.results[0];

    // Replace the candidate in the results
    const candidateIndex = result.candidates.findIndex(
      (c) => c._id.toString() === candidateId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Preserve the MongoDB _id
    result.candidates[candidateIndex] = {
      ...newCandidate,
      _id: result.candidates[candidateIndex]._id,
    };

    // Re-sort candidates by score
    result.candidates.sort((a, b) => b.score - a.score);
    await result.save();

    res.json({ message: "Resume replaced and re-analyzed", result });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        message: "ML service is unavailable. Please ensure it is running.",
      });
    }
    next(error);
  }
};

module.exports = {
  uploadAndAnalyze,
  getResults,
  getHistory,
  getResultById,
  deleteResume,
  replaceResume,
};
