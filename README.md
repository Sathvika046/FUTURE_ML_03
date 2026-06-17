# CandidateRank – Internship Screening System

AI-powered internship candidate ranking with dark sidebar UI, charts, and CGPA out of 10.

---

## How to Run

### Terminal 1 — Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Runs at: http://localhost:5000

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm start
```
Opens at: http://localhost:3000

---

## Features
- Dark sidebar layout (Overview / Add Candidate / Rankings / Skill Analysis / Reports)
- CGPA scored out of 10.0
- Bar chart: top skills + skill gaps (Analysis)
- Recent activity feed
- Full candidate table with rank, skill gaps highlighted

## Scoring
- Skills (weighted): up to 50 pts
- Experience: 5 pts/year, capped at 25 pts
- CGPA (out of 10): up to 25 pts
- Total: 100 pts


Updated Rating Logic:
Poor <25, Average 25-49, Good 50-74, Excellent 75-99, Perfect=100.
