from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

candidates = []
activities = []

SKILL_WEIGHTS = {
    "Python": 10, "Machine Learning": 10, "Deep Learning": 9,
    "NLP": 9, "Data Analysis": 8, "SQL": 7, "Java": 7,
    "JavaScript": 7, "React": 7, "Node.js": 6,
    "Communication": 8, "Teamwork": 7, "Problem Solving": 9,
    "Leadership": 7, "Time Management": 6,
    "C++": 7, "R": 6, "TensorFlow": 8, "PyTorch": 8,
    "Docker": 6, "AWS": 7, "Git": 6, "REST API": 6,
    "Excel": 5, "Power BI": 6, "Tableau": 6,
}

REQUIRED_SKILLS = ["Python", "Machine Learning", "SQL", "Communication", "Problem Solving"]

ROLE_SKILLS = {
    "Senior ML Engineer": ["Python","Machine Learning","Deep Learning","NLP","TensorFlow","PyTorch","Scikit-Learn","Data Analysis","Communication","Problem Solving","Teamwork","Critical Thinking"],
    "Data Analyst": ["Python","SQL","Excel","Power BI","Tableau","Statistics","Communication","Problem Solving","Teamwork"],
    "Frontend Developer": ["HTML","CSS","JavaScript","React","Git","Communication","Problem Solving","Teamwork"]
}


def compute_score(skills, experience, cgpa):
    skill_score = sum(SKILL_WEIGHTS.get(s.strip(), 3) for s in skills)
    if experience > 0:
        # Experienced: Skills up to 75 pts, Experience up to 25 pts, no CGPA
        normalized_skill = min(skill_score / 80 * 75, 75)
        exp_score = min(experience * 5, 25)
        total = round(normalized_skill + exp_score, 1)
    else:
        # Fresher: Skills up to 50 pts, CGPA up to 25 pts, Experience = 0
        normalized_skill = min(skill_score / 80 * 50, 50)
        gpa_score = (cgpa / 10.0) * 25
        total = round(normalized_skill + gpa_score, 1)
    return min(total, 100)

def get_skill_gaps(skills):
    return [s for s in REQUIRED_SKILLS if s not in skills]

def get_rank_label(score):
    if score == 100: return "Perfect"
    if score >= 75: return "Excellent"
    if score >= 50: return "Good"
    if score >= 25: return "Average"
    return "Poor"

def log_activity(text):
    activities.insert(0, {
        "id": str(uuid.uuid4()),
        "text": text,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M")
    })
    if len(activities) > 20:
        activities.pop()

@app.route("/")
def home():
    return jsonify({"project": "Internship Candidate Ranking System", "status": "running", "version": "3.0"})

@app.route("/api/candidates", methods=["GET"])
def get_candidates():
    sorted_candidates = sorted(candidates, key=lambda x: x["score"], reverse=True)
    for i, c in enumerate(sorted_candidates):
        c["rank"] = i + 1
    return jsonify(sorted_candidates)

@app.route("/api/candidates", methods=["POST"])
def add_candidate():
    data = request.json
    name = data.get("name", "").strip()
    skills = data.get("skills", [])
    experience = float(data.get("experience", 0))
    cgpa = float(data.get("cgpa", 0))
    email = data.get("email", "").strip()
    role = data.get("role", "").strip()

    if not name:
        return jsonify({"error": "Name is required"}), 400
    if experience == 0 and (cgpa < 0 or cgpa > 10):
        return jsonify({"error": "CGPA must be between 0 and 10.0"}), 400

    score = compute_score(skills, experience, cgpa)
    skill_gaps = get_skill_gaps(skills)
    rank_label = get_rank_label(score)

    candidate = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "role": role,
        "skills": skills,
        "experience": experience,
        "cgpa": cgpa,
        "score": score,
        "skill_gaps": skill_gaps,
        "rank_label": rank_label,
        "added_at": datetime.now().strftime("%Y-%m-%d %H:%M")
    }
    candidates.append(candidate)
    log_activity(f"New candidate added: {name}" + (f" for {role}" if role else ""))
    return jsonify(candidate), 201

@app.route("/api/candidates/<cid>", methods=["DELETE"])
def delete_candidate(cid):
    global candidates
    before = len(candidates)
    removed = next((c for c in candidates if c["id"] == cid), None)
    candidates = [c for c in candidates if c["id"] != cid]
    if len(candidates) == before:
        return jsonify({"error": "Not found"}), 404
    if removed:
        log_activity(f"Candidate removed: {removed['name']}")
    return jsonify({"message": "Deleted"})

@app.route("/api/analytics", methods=["GET"])
def analytics():
    if not candidates:
        return jsonify({
            "total": 0, "avg_score": 0, "highest_score": 0, "lowest_score": 0,
            "top_skills": [], "rank_distribution": {},
            "score_distribution": {"80-100": 0, "60-79": 0, "40-59": 0, "0-39": 0},
            "avg_cgpa": 0, "avg_experience": 0,
            "skill_gap_freq": []
        })

    scores = [c["score"] for c in candidates]
    all_skills = [s for c in candidates for s in c["skills"]]
    skill_freq = {}
    for s in all_skills:
        skill_freq[s] = skill_freq.get(s, 0) + 1
    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:8]

    rank_dist = {"Perfect": 0, "Excellent": 0, "Good": 0, "Average": 0, "Poor": 0}
    score_dist = {"80-100": 0, "60-79": 0, "40-59": 0, "0-39": 0}
    for c in candidates:
        rank_dist[c["rank_label"]] += 1
        s = c["score"]
        if s >= 80: score_dist["80-100"] += 1
        elif s >= 60: score_dist["60-79"] += 1
        elif s >= 40: score_dist["40-59"] += 1
        else: score_dist["0-39"] += 1

    # Skill gap frequency
    all_gaps = [g for c in candidates for g in c["skill_gaps"]]
    gap_freq = {}
    for g in all_gaps:
        gap_freq[g] = gap_freq.get(g, 0) + 1
    skill_gap_freq = sorted(gap_freq.items(), key=lambda x: x[1], reverse=True)

    return jsonify({
        "total": len(candidates),
        "avg_score": round(sum(scores) / len(scores), 1),
        "highest_score": max(scores),
        "lowest_score": min(scores),
        "top_skills": [{"skill": s, "count": n} for s, n in top_skills],
        "rank_distribution": rank_dist,
        "score_distribution": score_dist,
        "avg_cgpa": round(sum(c["cgpa"] for c in candidates) / len(candidates), 2),
        "avg_experience": round(sum(c["experience"] for c in candidates) / len(candidates), 1),
        "skill_gap_freq": [{"skill": s, "count": n} for s, n in skill_gap_freq]
    })

@app.route("/api/activities", methods=["GET"])
def get_activities():
    return jsonify(activities)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "candidates": len(candidates)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
