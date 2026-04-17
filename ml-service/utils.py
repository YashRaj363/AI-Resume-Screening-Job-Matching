"""
Utility functions for experience and education extraction and matching.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Education degree patterns
DEGREE_PATTERNS = [
    r"b\.?tech", r"b\.?e\.?", r"bachelor",
    r"m\.?tech", r"m\.?e\.?", r"master",
    r"m\.?s\.?", r"m\.?sc",
    r"b\.?sc", r"b\.?s\.?",
    r"ph\.?d", r"doctorate",
    r"mba", r"m\.?b\.?a",
    r"b\.?ca", r"m\.?ca",
    r"b\.?com", r"m\.?com",
    r"diploma",
    r"associate",
]

# Experience patterns
EXPERIENCE_PATTERNS = [
    r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?",
    r"(?:experience|exp)\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)",
    r"(\d+)\+?\s*(?:years?|yrs?)\s+(?:in|of|working)",
]


def extract_experience_years(text: str) -> int:
    """
    Extract years of experience from text using regex patterns.

    Args:
        text: Input text (resume or job description)

    Returns:
        Maximum years of experience found, or 0 if none detected
    """
    if not text:
        return 0

    text_lower = text.lower()
    years_found = []

    for pattern in EXPERIENCE_PATTERNS:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            try:
                years = int(match)
                if 0 < years < 50:  # Sanity check
                    years_found.append(years)
            except (ValueError, IndexError):
                continue

    result = max(years_found) if years_found else 0
    logger.info(f"Extracted experience: {result} years")
    return result


def extract_education(text: str) -> list[str]:
    """
    Extract education degrees from text.

    Args:
        text: Input text

    Returns:
        List of detected degree strings
    """
    if not text:
        return []

    text_lower = text.lower()
    degrees_found = []

    for pattern in DEGREE_PATTERNS:
        if re.search(pattern, text_lower):
            # Get the clean degree name
            match = re.search(pattern, text_lower)
            if match:
                degrees_found.append(match.group().upper().replace(".", ""))

    # Deduplicate
    unique_degrees = list(set(degrees_found))
    logger.info(f"Extracted degrees: {unique_degrees}")
    return unique_degrees


def match_experience(resume_years: int, jd_years: int) -> bool:
    """
    Check if resume experience meets JD requirements.

    Args:
        resume_years: Years of experience from resume
        jd_years: Years of experience required by JD

    Returns:
        True if resume meets or exceeds JD requirement
    """
    if jd_years == 0:
        return True  # No specific requirement
    return resume_years >= jd_years


def match_education(resume_degrees: list[str], jd_degrees: list[str]) -> bool:
    """
    Check if resume education matches JD requirements.

    Args:
        resume_degrees: Degrees found in resume
        jd_degrees: Degrees required by JD

    Returns:
        True if any resume degree matches any JD degree requirement
    """
    if not jd_degrees:
        return True  # No specific requirement

    resume_set = set(d.upper().replace(".", "") for d in resume_degrees)
    jd_set = set(d.upper().replace(".", "") for d in jd_degrees)

    # Check for any overlap
    return bool(resume_set & jd_set)
