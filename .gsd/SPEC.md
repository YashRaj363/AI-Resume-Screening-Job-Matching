# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
Empower job seekers with AI-driven resume optimization and ATS matching to maximize their career opportunities and landing rate.

## Goals
1. **Resume Upload & Parsing**: Support PDF and DOCX formats for automatic text extraction.
2. **AI-Powered Matching**: Compare resume content against specific job descriptions using BERT/NLP similarity.
3. **Actionable Feedback**: Generate a realistic ATS score and provide specific, contextual improvement suggestions.
4. **Dashboard Experience**: Provide a modern, premium UI/UX for tracking resume-job matches.

## Non-Goals (Out of Scope)
- Comprehensive job board integration (initially).
- Multi-user collaboration or team features.
- Advanced candidate tracking system (ATS) for recruiters.

## Users
- Students and interns looking for their first roles.
- Professionals seeking career transitions.
- Job seekers wanting to optimize their resumes for automated filters.

## Constraints
- **Tech Stack**: React (Frontend), Node.js/Express (Backend), MongoDB (Database), Python (ML Core with BERT).
- **Architecture**: Separated Backend and ML Microservice for scalability.
- **Deadline/Target**: Production-ready for portfolio/internship applications.

## Success Criteria
- [ ] Reliable text extraction from standard resume formats (PDF/DOCX).
- [ ] Accurate calculation of resume-to-JD similarity using BERT embedding.
- [ ] Meaningful ATS score and improvement suggestions generated within seconds.
- [ ] Responsive, modern UI that feels like a premium SaaS product.
