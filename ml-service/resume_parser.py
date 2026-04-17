"""
Resume Parser Module
Extracts text and candidate name from PDF resumes.
"""

import re
import logging
from io import BytesIO

import pdfplumber

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text content from a PDF file.

    Args:
        file_bytes: Raw bytes of the PDF file

    Returns:
        Extracted text string
    """
    try:
        text = ""
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        text = text.strip()
        if not text:
            logger.warning("No text extracted from PDF — file may be scanned/image-based")
        else:
            logger.info(f"Extracted {len(text)} characters from PDF")

        return text

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return ""


def extract_name(text: str, filename: str = "Unknown") -> str:
    """
    Extract candidate name from resume text.
    Uses regex heuristics on the first few lines.
    Falls back to filename if regex fails.

    Args:
        text: Extracted resume text
        filename: Original filename as fallback

    Returns:
        Candidate name string
    """
    if not text:
        return _clean_filename(filename)

    # Try to extract name from first 5 lines
    lines = text.strip().split("\n")[:5]

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Skip lines that look like headers, contacts, or addresses
        skip_patterns = [
            r"resume", r"curriculum", r"cv\b", r"objective",
            r"@", r"phone", r"tel:", r"email", r"address",
            r"http", r"www\.", r"linkedin", r"github",
            r"^\d", r"^\+",  # Starts with number or +
        ]

        should_skip = False
        for pattern in skip_patterns:
            if re.search(pattern, line.lower()):
                should_skip = True
                break

        if should_skip:
            continue

        # Check if line looks like a name (2-4 words, mostly alpha)
        words = line.split()
        if 1 <= len(words) <= 4:
            # Check if mostly alphabetic
            alpha_chars = sum(1 for c in line if c.isalpha() or c.isspace())
            if alpha_chars / max(len(line), 1) > 0.8:
                name = " ".join(words)
                logger.info(f"Extracted name: {name}")
                return name

    # Fallback to filename
    fallback_name = _clean_filename(filename)
    logger.info(f"Name extraction failed, using filename fallback: {fallback_name}")
    return fallback_name


def _clean_filename(filename: str) -> str:
    """
    Clean a filename to use as a candidate name.
    Removes extension and replaces underscores/hyphens with spaces.
    """
    # Remove extension
    name = filename.rsplit(".", 1)[0] if "." in filename else filename
    # Replace separators with spaces
    name = name.replace("_", " ").replace("-", " ")
    # Title case
    name = name.strip().title()
    return name if name else "Unknown"
