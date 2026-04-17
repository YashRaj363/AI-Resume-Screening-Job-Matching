"""
Skill Extraction and Matching Module
Extracts skills from text and compares against job description requirements.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Comprehensive predefined skill list
SKILL_LIST = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
    "rust", "swift", "kotlin", "php", "scala", "r", "matlab", "perl",
    # Web Technologies
    "html", "css", "react", "angular", "vue", "node.js", "express",
    "django", "flask", "fastapi", "spring", "next.js", "tailwind",
    "bootstrap", "jquery", "sass", "webpack", "graphql", "rest api",
    # Data & ML
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "matplotlib", "seaborn", "opencv", "bert",
    "transformers", "data analysis", "data science", "statistics",
    "big data", "data visualization", "power bi", "tableau",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase", "oracle", "sqlite",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd",
    "terraform", "ansible", "linux", "git", "github", "gitlab",
    "nginx", "apache", "microservices", "serverless",
    # Tools & Frameworks
    "jira", "agile", "scrum", "rest", "api", "testing", "unit testing",
    "selenium", "postman", "swagger", "figma", "adobe",
    # Soft Skills (commonly in JDs)
    "communication", "leadership", "teamwork", "problem solving",
    "project management", "time management",
]


def extract_skills(text: str) -> list[str]:
    """
    Extract skills from text by matching against predefined skill list.

    Args:
        text: Input text (resume or job description)

    Returns:
        List of matched skill strings
    """
    if not text:
        return []

    text_lower = text.lower()
    found_skills = []

    for skill in SKILL_LIST:
        # Use word boundary matching for short skills to avoid false positives
        if len(skill) <= 3:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(skill)
        else:
            if skill in text_lower:
                found_skills.append(skill)

    # Remove duplicates while preserving order
    seen = set()
    unique_skills = []
    for s in found_skills:
        if s not in seen:
            seen.add(s)
            unique_skills.append(s)

    logger.info(f"Extracted {len(unique_skills)} skills from text")
    return unique_skills


def match_skills(resume_skills: list[str], jd_skills: list[str]) -> dict:
    """
    Compare resume skills against job description skills.

    Args:
        resume_skills: Skills found in the resume
        jd_skills: Skills required in the job description

    Returns:
        Dictionary with matched, missing skills and match percentage
    """
    resume_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_skills)

    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)

    match_percentage = (len(matched) / len(jd_set) * 100) if jd_set else 0

    logger.info(f"Skills match: {len(matched)}/{len(jd_set)} ({match_percentage:.1f}%)")

    return {
        "matched": sorted(matched),
        "missing": sorted(missing),
        "match_percentage": round(match_percentage, 2),
    }
