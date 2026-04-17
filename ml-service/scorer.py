"""
Scoring Module
Computes TF-IDF similarity, semantic similarity (lightweight), and final ATS score.
"""

import logging
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


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
    Compute semantic similarity using TF-IDF with word + character n-grams.
    Lightweight alternative to BERT — runs under 512MB RAM.

    Args:
        resume_text: Resume text content
        jd_text: Job description text content

    Returns:
        Semantic similarity score (0.0 to 1.0)
    """
    try:
        if not resume_text or not jd_text:
            return 0.0

        # Truncate texts to keep memory low
        max_chars = 5000
        resume_truncated = resume_text[:max_chars]
        jd_truncated = jd_text[:max_chars]

        # Word-level TF-IDF with bigrams for phrase-level matching
        word_vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=8000,
        )
        word_matrix = word_vectorizer.fit_transform([resume_truncated, jd_truncated])
        word_sim = cosine_similarity(word_matrix[0:1], word_matrix[1:2])[0][0]

        # Character-level TF-IDF to capture spelling/partial matches
        char_vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=8000,
        )
        char_matrix = char_vectorizer.fit_transform([resume_truncated, jd_truncated])
        char_sim = cosine_similarity(char_matrix[0:1], char_matrix[1:2])[0][0]

        # Blend: 70% word n-grams + 30% char n-grams
        similarity = 0.7 * word_sim + 0.3 * char_sim

        score = float(np.clip(similarity, 0.0, 1.0))
        logger.info(f"Semantic similarity (lightweight): {score:.4f}")
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
        semantic_score: Semantic similarity (0-1)
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
