/* CLEANED UI VERSION */
import { useState, useEffect, useCallback } from "react";
import {
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from "recharts";

const API = "http://localhost:5000/api";

const SKILL_OPTIONS = [
  "Python","Machine Learning","Deep Learning","NLP","Data Analysis",
  "SQL","Java","JavaScript","React","Node.js","C++","R",
  "TensorFlow","PyTorch","Docker","AWS","Git","REST API",
  "Communication","Teamwork","Problem Solving","Leadership","Time Management",
  "Excel","Power BI","Tableau"
];

/* ── palette ── */
const C = {
  bg: "#0d1117",
  sidebar: "#161b22",
  card: "#1c2128",
  border: "#30363d",
  green: "#3fb950",
  greenDim: "#1f3a27",
  text: "#e6edf3",
  muted: "#8b949e",
  accent: "#238636",
  accentHover: "#2ea043",
  red: "#f85149",
  yellow: "#d29922",
  blue: "#58a6ff",
  purple: "#bc8cff",
};

const RANK_COLORS = {
  Excellent: C.green,
  Good: C.blue,
  Average: C.yellow,
  "Below Average": C.red,
};


/* ── tiny helpers ── */
const scoreColor = (s) => s >= 80 ? C.green : s >= 60 ? C.blue : s >= 40 ? C.yellow : C.red;
const scoreLabel = (s) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Average" : "Below Avg";

function Badge({ score }) {
  const col = scoreColor(score);
  return (
    <span style={{
      background: col + "22", color: col,
      border: `1px solid ${col}44`,
      borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 700
    }}>{score}%</span>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "22px 24px",
      display: "flex", alignItems: "center", gap: 18, flex: 1
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: (color || C.green) + "22",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>↑ {sub}</div>}
      </div>
    </div>
  );
}

/* ── sidebar nav ── */
const NAV = [
  { id: "overview", icon: "⊞", label: "Overview" },
  { id: "add", icon: "⊕", label: "Add Candidate" },
  { id: "rankings", icon: "👥", label: "Rankings" },
    { id: "reports", icon: "📋", label: "Reports" },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "", experience: "", cgpa: "", skills: [] });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const [c, a, act] = await Promise.all([
      fetch(`${API}/candidates`).then(r => r.json()),
      fetch(`${API}/analytics`).then(r => r.json()),
      fetch(`${API}/activities`).then(r => r.json()),
    ]);
    setCandidates(c);
    setAnalytics(a);
    setActivities(act);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const toggleSkill = (s) =>
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
    }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return showMsg("Full name is required.", "error");
    const expVal = parseFloat(form.experience) || 0;
    const isFresher = expVal === 0;
    const cgpa = isFresher ? parseFloat(form.cgpa) : 0;
    if (isFresher && (isNaN(cgpa) || cgpa < 0 || cgpa > 10)) return showMsg("CGPA must be 0 – 10.0", "error");
    setLoading(true);
    const r = await fetch(`${API}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, experience: expVal, cgpa }),
    });
    setLoading(false);
    if (r.ok) {
      showMsg("Candidate added and ranked!");
      setForm({ name: "", email: "", role: "", experience: "", cgpa: "", skills: [] });
      fetchAll();
    } else {
      const e = await r.json();
      showMsg(e.error || "Something went wrong.", "error");
    }
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/candidates/${id}`, { method: "DELETE" });
    fetchAll();
  };


  /* ── LAYOUT ── */
  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, overflow: "hidden" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: 240, background: C.sidebar, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", flexShrink: 0
      }}>
        {/* logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: C.green, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#0d1117"
            }}>C</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>CandidateRank</div>
              <div style={{ fontSize: 11, color: C.muted }}>Screening System</div>
            </div>
          </div>
        </div>

        {/* nav */}
        <nav style={{ padding: "12px 12px", flex: 1 }}>
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, padding: "0 8px", marginBottom: 6 }}>Main Menu</div>
          {NAV.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === id ? C.green + "22" : "transparent",
              color: tab === id ? C.green : C.muted,
              fontSize: 14, fontWeight: tab === id ? 600 : 400,
              fontFamily: "Inter, sans-serif", marginBottom: 2,
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
              {tab === id && <span style={{ fontSize: 10 }}>›</span>}
            </button>
          ))}


        </nav>

        {/* bottom user */}
        <div style={{
          padding: 16, borderTop: `1px solid ${C.border}`,
          background: "#1c2128", fontSize: 13
        }}>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>Need Help?</div>
          <div style={{ color: C.muted, fontSize: 11 }}>Check documentation for tips</div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* TOP BAR */}
        <header style={{
          height: 60, background: C.sidebar, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: 16, flexShrink: 0
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
              {NAV.find(n => n.id === tab)?.label || "Overview"}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              {{
                overview: "Monitor your recruitment pipeline and candidate performance",
                add: "Add a new candidate for AI-powered scoring and ranking",
                rankings: "Ranked list of all candidates by composite score",
                analysis: "Skill distribution, gaps, and performance charts",
                reports: "Summary report of all candidates",
              }[tab]}
            </div>
          </div>


        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1, overflow: "auto", padding: 28 }}>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div>
              {/* stat cards */}
              <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <StatCard icon="👥" label="Total Candidates" value={analytics?.total || 0} sub="in system" color={C.green} />
                <StatCard icon="📊" label="Avg Match Score" value={`${analytics?.avg_score || 0}%`} sub="composite" color={C.blue} />
                <StatCard icon="⭐" label="Top Score" value={`${analytics?.highest_score || 0}%`} sub="highest ranked" color={C.yellow} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                {/* score distribution pie */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Candidate Scores</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Score breakdown by candidate name and role</div>
                  {candidates.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={candidates.map(c => ({
                          name: c.name.split(" ")[0],
                          label: c.role ? `${c.name.split(" ")[0]} · ${c.role}` : c.name.split(" ")[0],
                          score: c.score,
                          color: c.score >= 80 ? "#3fb950" : c.score >= 60 ? "#58a6ff" : c.score >= 40 ? "#d29922" : "#f85149"
                        }))}
                        margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: C.muted, fontSize: 11 }}
                          axisLine={false} tickLine={false}
                          interval={0}
                          angle={-35}
                          textAnchor="end"
                        />
                        <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip
                          contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }}
                          formatter={(value, _, props) => [`${value}%`, props.payload.label]}
                          labelFormatter={() => ""}
                        />
                        <Bar dataKey="score" name="Score" radius={[4, 4, 0, 0]}>
                          {candidates.map((c, i) => (
                            <Cell key={i} fill={c.score >= 80 ? "#3fb950" : c.score >= 60 ? "#58a6ff" : c.score >= 40 ? "#d29922" : "#f85149"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>
                      No candidates yet
                    </div>
                  )}
                </div>

                {/* recent activity */}
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>Recent Activity</div>
                    <span style={{ fontSize: 12, color: C.green, cursor: "pointer" }}>View All</span>
                  </div>
                  {activities.length === 0 ? (
                    <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "40px 0" }}>No activity yet</div>
                  ) : activities.slice(0, 8).map(a => (
                    <div key={a.id} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: C.green + "22", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 12, flexShrink: 0
                      }}>🕐</div>
                      <div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{a.text}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ADD CANDIDATE ── */}
          {tab === "add" && (
            <div style={{ maxWidth: 720 }}>
              {msg && (
                <div style={{
                  background: msg.type === "error" ? C.red + "18" : C.green + "18",
                  border: `1px solid ${msg.type === "error" ? C.red : C.green}44`,
                  color: msg.type === "error" ? C.red : C.green,
                  borderRadius: 8, padding: "10px 16px", fontSize: 13, marginBottom: 18
                }}>{msg.text}</div>
              )}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Candidate Information</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                  {[
                    { label: "Full Name *", key: "name", placeholder: "e.g. Priya Sharma" },
                    { label: "Email Address", key: "email", placeholder: "priya@example.com" },
                    { label: "Applied Role", key: "role", placeholder: "e.g. ML Intern" },
                    { label: "Experience (years)", key: "experience", placeholder: "0", type: "number" },
                    ...((parseFloat(form.experience) || 0) === 0
                      ? [{ label: "CGPA (0 – 10.0) *", key: "cgpa", placeholder: "8.5", type: "number" }]
                      : []),
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>{label}</label>
                      <input
                        type={type || "text"}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{
                          width: "100%", background: C.bg,
                          border: `1px solid ${C.border}`, borderRadius: 8,
                          padding: "10px 14px", color: C.text, fontSize: 14,
                          fontFamily: "Inter, sans-serif", outline: "none"
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
                    Skills ({form.skills.length} selected)
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {SKILL_OPTIONS.map(s => {
                      const sel = form.skills.includes(s);
                      return (
                        <button key={s} onClick={() => toggleSkill(s)} style={{
                          padding: "5px 13px", borderRadius: 20, border: `1px solid ${sel ? C.green : C.border}`,
                          background: sel ? C.green + "22" : C.bg,
                          color: sel ? C.green : C.muted,
                          fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif",
                          transition: "all 0.15s"
                        }}>{s}</button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    background: loading ? C.border : C.green,
                    color: loading ? C.muted : "#0d1117",
                    border: "none", borderRadius: 9,
                    padding: "12px 32px", fontSize: 14, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif", transition: "all 0.15s"
                  }}
                >
                  {loading ? "Computing Score…" : "➕ Add & Rank Candidate"}
                </button>
              </div>
            </div>
          )}

          {/* ── RANKINGS ── */}
          {tab === "rankings" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: C.muted }}>{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} found</div>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {/* table header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "50px 1fr 160px 90px 80px 90px 80px 48px",
                  padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
                  fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.6
                }}>
                  <span>#</span><span>Candidate</span><span>Role</span>
                  <span>CGPA</span><span>Exp.</span><span>Score</span><span>Rating</span><span></span>
                </div>

                {candidates.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
                    <div>No candidates yet. Add one to get started.</div>
                  </div>
                ) : candidates.map(c => (
                  <div key={c.id} style={{
                    display: "grid",
                    gridTemplateColumns: "50px 1fr 160px 90px 80px 90px 80px 48px",
                    padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
                    alignItems: "center", transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ fontWeight: 700, color: C.green, fontSize: 14 }}>#{c.rank}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{c.email || "—"}</div>
                      {c.skill_gaps.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                          {c.skill_gaps.map(g => (
                            <span key={g} style={{
                              fontSize: 10, background: C.red + "15", color: C.red,
                              border: `1px solid ${C.red}30`, borderRadius: 4, padding: "1px 6px"
                            }}>Missing: {g}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 13, color: C.muted }}>{c.role || "—"}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{c.cgpa}/10</span>
                    <span style={{ fontSize: 13, color: C.muted }}>{c.experience}y</span>
                    <Badge score={c.score} />
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: RANK_COLORS[c.rank_label] || C.muted
                    }}>{c.rank_label}</span>
                    <button onClick={() => handleDelete(c.id)} style={{
                      background: "transparent", border: "none",
                      color: C.muted, cursor: "pointer", fontSize: 16,
                      borderRadius: 6, padding: "4px 8px",
                      transition: "color 0.15s"
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = C.red}
                      onMouseLeave={e => e.currentTarget.style.color = C.muted}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ANALYSIS ── */}
          {tab === "analysis" && (
            <div>
              {!analytics || analytics.total === 0 ? (
                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 60, textAlign: "center", color: C.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                  <div>Add candidates to see reports</div>
                </div>
              ) : (
                <>
                  {/* row 1: bar + pie */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

                    {/* top skills bar chart */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Top Skills</div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Most common skills among candidates</div>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={analytics.top_skills} layout="vertical" margin={{ left: 20, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                          <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="skill" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                          <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                          <Bar dataKey="count" fill={C.green} radius={[0, 4, 4, 0]} name="Candidates" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* rating distribution pie */}
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Rating Distribution</div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Candidate performance breakdown</div>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={Object.entries(analytics.rank_distribution)
                            .filter(([, v]) => v > 0)
                            .map(([name, value]) => ({ name, value }))}
                          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                          <Legend />
                          <Bar dataKey="value" name="Candidates" radius={[4, 4, 0, 0]}>
                            {Object.entries(analytics.rank_distribution)
                              .filter(([, v]) => v > 0)
                              .map(([k], i) => (
                                <Cell key={i} fill={RANK_COLORS[k] || ["#3fb950","#58a6ff","#d29922","#f85149"][i % 4]} />
                              ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* row 2: skill gaps bar */}
                  {analytics.skill_gap_freq.length > 0 && (
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Skill Gaps</div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Required skills most often missing from candidates</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.skill_gap_freq} margin={{ left: 0, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                          <XAxis dataKey="skill" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text }} />
                          <Bar dataKey="count" fill={C.red} radius={[4, 4, 0, 0]} name="Missing count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && (
            <div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Summary Report</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                  {[
                    ["Total Candidates", analytics?.total || 0],
                    ["Average Score", `${analytics?.avg_score || 0}%`],
                    ["Avg Experience", `${analytics?.avg_experience || 0} yrs`],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{l}</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* full table */}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 10 }}>All Candidates</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Rank","Name","Role","CGPA","Exp","Score","Rating","Skill Gaps"].map(h => (
                        <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.muted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.length === 0 ? (
                      <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>No candidates yet</td></tr>
                    ) : candidates.map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                        <td style={{ padding: "10px 10px", color: C.green, fontWeight: 700 }}>#{c.rank}</td>
                        <td style={{ padding: "10px 10px", fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: "10px 10px", color: C.muted }}>{c.role || "—"}</td>
                        <td style={{ padding: "10px 10px" }}>{c.cgpa}/10</td>
                        <td style={{ padding: "10px 10px", color: C.muted }}>{c.experience}y</td>
                        <td style={{ padding: "10px 10px" }}><Badge score={c.score} /></td>
                        <td style={{ padding: "10px 10px", color: RANK_COLORS[c.rank_label], fontWeight: 600, fontSize: 12 }}>{c.rank_label}</td>
                        <td style={{ padding: "10px 10px", color: C.red, fontSize: 11 }}>{c.skill_gaps.join(", ") || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
