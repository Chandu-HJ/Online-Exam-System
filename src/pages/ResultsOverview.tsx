import questions from "../data/questions.json";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { exams } from "../data/exams";
import { getAllExamResults } from "../utils/resultStorage";
import "../styles/Result.css";

// Charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function ResultsOverview() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const results = getAllExamResults();

  // ---------- Helper to calculate percentage ----------
  const getPercentage = (score: number, total: number) =>
    Math.round((score / total) * 100);

  // ---------- Merge exam + computed result ----------
  const completedExams = results
    .map((result) => {
      const exam = exams.find((e) => e.id === result.examId);
      if (!exam) return null;

      const percentage = getPercentage(
        result.score,
        result.totalQuestions
      );

      let finalStatus: "PASSED" | "FAILED" | "TERMINATED";

      if (result.examOutcome === "DISQUALIFIED") {
        finalStatus = "TERMINATED";
      } else if (percentage >= 35) {
        finalStatus = "PASSED";
      } else {
        finalStatus = "FAILED";
      }

      return {
        examId: exam.id,
        title: exam.title,
        submittedAt: result.submittedAt,
        percentage,
        finalStatus
      };
    })
    .filter(Boolean);

  // ---------- Search ----------
  const visibleResults = completedExams.filter((exam) =>
    exam!.title.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- Stats ----------
  const attemptedCount = results.length;
  const terminatedCount = completedExams.filter(
    (e) => e!.finalStatus === "TERMINATED"
  ).length;

  const passedCount = completedExams.filter(
    (e) => e!.finalStatus === "PASSED"
  ).length;

  const failedCount = completedExams.filter(
    (e) => e!.finalStatus === "FAILED"
  ).length;

  const completedCount = attemptedCount - terminatedCount;

  // ---------- Chart data (exclude terminated) ----------
  const scoreChartData = completedExams
    .filter((e) => e!.finalStatus !== "TERMINATED")
    .map((e) => ({
      name: e!.title,
      score: e!.percentage
    }));

  return (
    <div className="result-container">
      {/* ================= TOP SECTION ================= */}
      <div className="results-top-section">
        {/* ---------- STATS ---------- */}
        <div className="stats-column">
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{attemptedCount}</span>
              <span className="stat-label">Attempted</span>
            </div>

            <div className="stat-card">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>

            <div className="stat-card success">
              <span className="stat-value">{passedCount}</span>
              <span className="stat-label">Passed</span>
            </div>

            <div className="stat-card warning">
              <span className="stat-value">{failedCount}</span>
              <span className="stat-label">Failed</span>
            </div>

            <div className="stat-card danger">
              <span className="stat-value">{terminatedCount}</span>
              <span className="stat-label">Terminated</span>
            </div>
          </div>
        </div>

        {/* ---------- BAR CHART ---------- */}
        <div className="chart-column analytics-card chart-vertical-bar">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreChartData}>
              <defs>
                <linearGradient
                  id="scoreGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#6a5cff" />
                  <stop offset="100%" stopColor="#4b3df2" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />

              <Bar
                dataKey="score"
                fill="url(#scoreGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= RESULTS LIST ================= */}
      <h1 className="result-title">Results</h1>

      <input
        className="result-search"
        type="text"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="result-list scrollable">
        {visibleResults.map((exam) => (
          <div className="result-item" key={exam!.examId}>
            <div className="result-info">
              <span className="result-name">{exam!.title}</span>
              <span className="result-date">
                Attempted on{" "}
                {new Date(exam!.submittedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="result-actions">
              {exam!.finalStatus === "PASSED" && (
                <span className="badge badge-success">
                  Passed ({exam!.percentage}%)
                </span>
              )}

              {exam!.finalStatus === "FAILED" && (
                <span className="badge badge-warning">
                  Failed ({exam!.percentage}%)
                </span>
              )}

              {exam!.finalStatus === "TERMINATED" && (
                <span className="badge badge-danger">
                  Terminated (Policy Violation)
                </span>
              )}

              <button
                className="primary"
                onClick={() =>
                  navigate(`/result?examId=${exam!.examId}`)
                }
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsOverview;
