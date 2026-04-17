# AI Resume Screening and Job Matching System

An intelligent ATS (Applicant Tracking System) that uses **BERT NLP** and **TF-IDF** to analyze resumes against job descriptions, providing automated scoring and ranking.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  React App  │────▶│  Express API │────▶│  FastAPI ML Svc  │
│  :5173      │     │  :5000       │     │  :8000           │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                     ┌─────▼─────┐
                     │  MongoDB  │
                     └───────────┘
```

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **MongoDB** running locally on port 27017
- **pip** (Python package manager)

## Quick Start

### 1. ML Service (Python FastAPI)

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

> First request will be slow (downloads BERT model). Subsequent requests are fast.

### 2. Backend (Node.js Express)

```bash
cd server
npm install
# Edit .env if needed (MongoDB URI, JWT secret, etc.)
npm run dev
```

### 3. Frontend (React Vite)

```bash
cd client
npm install
npm run dev
```

### 4. Open Browser

Navigate to **http://localhost:5173**

## Features

- **JWT Authentication** — Register/Login
- **Resume Upload** — Upload multiple PDF resumes + job description
- **AI Analysis** — BERT semantic similarity + TF-IDF + weighted ATS scoring
- **Results Table** — Ranked candidates with scores, fit badges, skill matching
- **Dashboard** — Summary cards + Chart.js visualizations
- **History** — View past analysis runs
- **Replace/Delete** — Swap resumes and re-analyze

## ATS Scoring Formula

| Component | Weight |
| --- | --- |
| Skills Match | 40% |
| Semantic Similarity (BERT) | 30% |
| Experience Match | 20% |
| Education Match | 10% |

**Fit Classification**: Good (≥70), Average (40–70), Poor (<40)

## Environment Variables

See `server/.env.example`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/resume_system
JWT_SECRET=your_super_secret_key
ML_SERVICE_URL=http://localhost:8000
MAX_FILE_SIZE_MB=10
```
