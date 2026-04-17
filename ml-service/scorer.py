"""
Scoring Module
Computes TF-IDF similarity, BERT semantic similarity, and final ATS score.
"""

import logging
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# Load BERT model at module level for efficiency
_model = None


def _get_model():
    """Lazy-load the sentence transformer model."""
    global _model
    if _model is None:
        logger.info("Loading sentence-transformers model (first request may be slow)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Model loaded successfully")
    return _model


def compute_tfidf_similarity(resume_text: str, jd_text: str) -> float:
    """
    Compute TF-IDF cosine similarity between resume and job description.

    Args:
        resume_text: Resume text content
        jd_text: Job description text content

    Returns:
        Cosine similarity score (0.0 to 1.0)
    """
    try:
        if not resume_text or not jd_text:
            return 0.0

        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf_matrix = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        score = float(np.clip(similarity, 0.0, 1.0))
        logger.info(f"TF-IDF similarity: {score:.4f}")
        return score

    except Exception as e:
        logger.error(f"TF-IDF computation error: {e}")
        return 0.0


def compute_semantic_similarity(resume_text: str, jd_text: str) -> float:
    """
    Compute BERT-based semantic similarity using sentence-transformers.

    Args:
        resume_text: Resume text content
        jd_text: Job description text content

    Returns:
        Semantic similarity score (0.0 to 1.0)
    """
    try:
        if not resume_text or not jd_text:
            return 0.0

        model = _get_model()

        # Truncate texts to avoid token limit issues
        max_chars = 5000
        resume_truncated = resume_text[:max_chars]
        jd_truncated = jd_text[:max_chars]

        embeddings = model.encode([resume_truncated, jd_truncated])
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

        score = float(np.clip(similarity, 0.0, 1.0))
        logger.info(f"Semantic similarity: {score:.4f}")
        return score

    except Exception as e:
        logger.error(f"Semantic similarity computation error: {e}")
        return 0.0


def compute_ats_score(
    skill_match_pct: float,
    semantic_score: float,
    experience_match: bool,
    education_match: bool,
) -> float:
    """
    Compute final ATS score using weighted components.

    Weights:
        - Skills match: 40%
        - Semantic similarity: 30%
        - Experience match: 20%
        - Education match: 10%

    Args:
        skill_match_pct: Percentage of matched skills (0-100)
        semantic_score: BERT semantic similarity (0-1)
        experience_match: Whether experience requirements are met
        education_match: Whether education requirements are met

    Returns:
        Final ATS score (0-100)
    """
    score = (
        (skill_match_pct / 100) * 40
        + semantic_score * 30
        + (1.0 if experience_match else 0.0) * 20
        + (1.0 if education_match else 0.0) * 10
    )

    final_score = round(float(np.clip(score, 0, 100)), 2)
    logger.info(f"ATS Score: {final_score} (skills={skill_match_pct:.1f}%, semantic={semantic_score:.3f}, exp={experience_match}, edu={education_match})")
    return final_score


def classify_fit(score: float) -> str:
    """
    Classify candidate fit based on ATS score.

    Args:
        score: ATS score (0-100)

    Returns:
        'Good', 'Average', or 'Poor'
    """
    if score >= 70:
        return "Good"
    elif score >= 40:
        return "Average"
    else:
        return "Poor"
