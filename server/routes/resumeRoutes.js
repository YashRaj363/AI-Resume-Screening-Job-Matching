const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const {
  uploadAndAnalyze,
  getResults,
  getHistory,
  getResultById,
  deleteResume,
  replaceResume,
} = require("../controllers/resumeController");

const router = express.Router();

// Multer with memory storage (files forwarded to ML service, not saved to disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// POST /api/upload — upload resumes + JD for analysis
router.post("/upload", auth, upload.array("resumes", 20), uploadAndAnalyze);

// GET /api/results — latest results
router.get("/results", auth, getResults);

// GET /api/history — all past analyses
router.get("/history", auth, getHistory);

// GET /api/results/:id — specific result details
router.get("/results/:id", auth, getResultById);

// DELETE /api/resume/:resultId/:candidateId — remove candidate
router.delete("/resume/:resultId/:candidateId", auth, deleteResume);

// PUT /api/resume/:resultId/:candidateId — replace resume and re-analyze
router.put(
  "/resume/:resultId/:candidateId",
  auth,
  upload.single("resume"),
  replaceResume
);

module.exports = router;
