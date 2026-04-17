"""
AI Resume Screening ML Microservice
FastAPI application providing resume analysis via POST /analyze endpoint.
"""

import logging
import os
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_parser import extract_text_from_pdf, extract_name
from scorer import (
    compute_tfidf_similarity,
    compute_semantic_similarity,
    compute_ats_score,
    classify_fit,
)
from skill_extractor import extract_skills, match_skills
from utils import (
    extract_experience_years,
    extract_education,
    match_experience,
    match_education,
)

# ──────────────────────────────────────────────
# Logging configuration
# ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# FastAPI App
# ──────────────────────────────────────────────
app = FastAPI(
    title="AI Resume Screening ML Service",
    description="Analyzes resumes against job descriptions using NLP and BERT",
    version="1.0.0",
)

# CORS middleware — allows Express backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "ml-resume-screening"}


@app.post("/analyze")
async def analyze_resumes(
    job_description: str = Form(...),
    resumes: list[UploadFile] = File(...),
):
    """
    Analyze multiple resumes against a job description.

    Accepts:
        - job_description: Text of the job description
        - resumes: Multiple PDF resume files

    Returns:
        JSON with ranked candidate results
    """
    logger.info(f"Received {len(resumes)} resumes for analysis")

    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty")

    if not resumes:
        raise HTTPException(status_code=400, detail="At least one resume is required")

    # Extract JD skills and requirements
    jd_skills = extract_skills(job_description)
    jd_experience = extract_experience_years(job_description)
    jd_degrees = extract_education(job_description)

    logger.info(f"JD skills: {jd_skills}")
    logger.info(f"JD experience requirement: {jd_experience} years")
    logger.info(f"JD education requirement: {jd_degrees}")

    results = []

    for resume_file in resumes:
        try:
            logger.info(f"Processing resume: {resume_file.filename}")

            # Read file bytes
            file_bytes = await resume_file.read()

            # Step 1: Extract text from PDF
            resume_text = extract_text_from_pdf(file_bytes)

            if not resume_text:
                logger.warning(f"Could not extract text from {resume_file.filename}")
                results.append({
                    "name": extract_name("", resume_file.filename or "Unknown"),
                    "score": 0,
                    "semanticScore": 0,
                    "skillsMatched": [],
                    "skillsMissing": jd_skills,
                    "educationMatch": "No",
                    "experienceMatch": "No",
                    "fit": "Poor",
                })
                continue

            # Step 2: Extract candidate name
            name = extract_name(resume_text, resume_file.filename or "Unknown")

            # Step 3: Extract skills from resume
            resume_skills = extract_skills(resume_text)
            skill_result = match_skills(resume_skills, jd_skills)

            # Step 4: Compute similarities
            tfidf_score = compute_tfidf_similarity(resume_text, job_description)
            semantic_score = compute_semantic_similarity(resume_text, job_description)

            # Step 5: Experience matching
            resume_experience = extract_experience_years(resume_text)
            exp_match = match_experience(resume_experience, jd_experience)

            # Step 6: Education matching
            resume_degrees = extract_education(resume_text)
            edu_match = match_education(resume_degrees, jd_degrees)

            # Step 7: Compute final ATS score
            ats_score = compute_ats_score(
                skill_match_pct=skill_result["match_percentage"],
                semantic_score=semantic_score,
                experience_match=exp_match,
                education_match=edu_match,
            )

            # Step 8: Classify fit
            fit = classify_fit(ats_score)

            candidate_result = {
                "name": name,
                "score": ats_score,
                "semanticScore": round(semantic_score * 100, 2),
                "skillsMatched": skill_result["matched"],
                "skillsMissing": skill_result["missing"],
                "educationMatch": "Yes" if edu_match else "No",
                "experienceMatch": "Yes" if exp_match else "No",
                "fit": fit,
            }

            results.append(candidate_result)
            logger.info(f"Candidate {name}: score={ats_score}, fit={fit}")

        except Exception as e:
            logger.error(f"Error processing {resume_file.filename}: {e}")
            results.append({
                "name": extract_name("", resume_file.filename or "Unknown"),
                "score": 0,
                "semanticScore": 0,
                "skillsMatched": [],
                "skillsMissing": jd_skills,
                "educationMatch": "No",
                "experienceMatch": "No",
                "fit": "Poor",
            })

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    logger.info(f"Analysis complete. {len(results)} candidates processed.")

    return {"results": results}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", os.environ.get("ML_PORT", 8000)))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
