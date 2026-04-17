# DECISIONS.md

# Architecture Decisions

## ADR-001: Tech Stack Selection
- **Status**: Decided
- **Context**: User requested a full-stack web app for resume analysis.
- **Decision**: Node.js/Express for backend, React for frontend, MongoDB for database, and Python for ML core.
- **Consequence**: Provides a robust, scalable structure suitable for portfolio and production-ready work.

## ADR-002: ML Integration Pattern
- **Status**: Decided
- **Context**: Deciding how to connect Node.js with Python ML.
- **Decision**: Python (Flask/FastAPI) as a microservice.
- **Consequence**: Decouples the frontend/backend from the heavy ML logic, allowing for independent scaling and easier maintenance of the BERT model.
