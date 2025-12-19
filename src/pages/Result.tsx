import { useSearchParams } from "react-router-dom";
import { getExamResultById } from "../utils/resultStorage";
import { useState } from "react";
import QuestionReview from "../components/QuestionReview";
import questionsData from "../data/questions.json";
import "../styles/ParticularResult.css";

// charts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ["#22c55e", "#ef4444", "#9ca3af"];

function Result() {
  const [searchParams] = useSearchParams();
  const examId = searchParams.get("examId");
  const [showReview, setShowReview] = useState(false);

  if (!examId) return <p>No exam selected</p>;

  const result = getExamResultById(examId);
  if (!result) return <p>No result found</p>;

  const questions = (questionsData as any[]).filter(
    (q) => q.examId === examId
  );

  const isTerminated = result.examOutcome === "DISQUALIFIED";

  //  percentage already derived from existing values
  const percentage = Math.round(
    (result.score / result.totalQuestions) * 100
  );

  //  ONLY NEW LOGIC
  const finalOutcome =
    isTerminated ? "DISQUALIFIED" : percentage < 35 ? "FAIL" : "PASS";

  const pieData = [
    { name: "Correct", value: result.correct },
    { name: "Wrong", value: result.wrong },
    { name: "Unattempted", value: result.unattempted }
  ];

  return (
    <div className="result-page">
      {/* ===== SUMMARY ===== */}
      <div className="result-summary card">
        <h1>Exam Completed</h1>

        {!isTerminated && (
          <p className="score-text">
            Your Score
            <span className="score-value">
              {result.score} / {result.totalQuestions}
            </span>
          </p>
        )}

        {!isTerminated && (
          <p className="percentage-text">
            Percentage: <strong>{percentage}%</strong>
          </p>
        )}

        <span
          className={`badge ${
            finalOutcome === "DISQUALIFIED"
              ? "badge-danger"
              : finalOutcome === "PASS"
              ? "badge-success"
              : "badge-warning"
          }`}
        >
          {finalOutcome === "DISQUALIFIED"
            ? "Terminated (Policy Violation)"
            : finalOutcome}
        </span>
      </div>

      {/* ===== SCORE + PROCTORING ===== */}
      <div className="result-grid">
        {!isTerminated && (
          <div className="card">
            <h2>Score Summary</h2>

            <div className="chart-box">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Proctoring Report</h2>

          <p>
            Total Violations:
            <strong> {result.violations.length}</strong>
          </p>

          <p
            className={
              result.violations.length > 0
                ? "danger-text"
                : "success-text"
            }
          >
            {result.violations.length > 0
              ? "Cheating detected"
              : "No violations"}
          </p>

          {result.violations.length > 0 && (
            <ul className="violation-list">
              {result.violations.map((v, i) => (
                <li key={i}>
                  <strong>{v.type}</strong> —{" "}
                  {new Date(v.time).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ===== REVIEW ===== */}
      <div className="card review-card">
        <button
          className="primary"
          onClick={() => setShowReview(!showReview)}
        >
          {showReview ? "Hide" : "Review"} Answers
        </button>

        {showReview && (
          <div className="review-area">
            <QuestionReview
              questions={questions}
              answers={result.answers ?? {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Result;
