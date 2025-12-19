import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exams } from "../data/exams";
import { getAllExamResults } from "../utils/resultStorage";
import "../styles/Dashboard.css";

/* Helper: countdown timer */
function getRemainingTime(deadline: string) {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (diff % (1000 * 60 * 60)) / (1000 * 60)
  );

  return { days, hours, minutes };
}

function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [, forceUpdate] = useState(0);

  const pastResults = getAllExamResults();
  const today = new Date();

  /* Re-render every minute for countdown */
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /* Completed exams */
  const completedExams = exams.filter((exam) =>
    pastResults.some((r) => r.examId === exam.id)
  );

  /* Upcoming exams (not attempted, not expired) */
  const upcomingExams = exams
    .filter((exam) => {
      const attempted = pastResults.some(
        (r) => r.examId === exam.id
      );
      const expired = new Date(exam.deadline) < today;
      return !attempted && !expired;
    })
    .sort(
      (a, b) =>
        new Date(a.deadline).getTime() -
        new Date(b.deadline).getTime()
    );

  /* Search filter */
  const visibleUpcoming = upcomingExams.filter((exam) =>
    exam.title.toLowerCase().includes(search.toLowerCase())
  );

  /* Stats */
  const upcomingCount = upcomingExams.length;
  const completedCount = completedExams.length;
  const urgentCount = upcomingExams.filter((exam) => {
    const diff =
      new Date(exam.deadline).getTime() - Date.now();
    return diff <= 3 * 24 * 60 * 60 * 1000;
  }).length;
  const totalCount = exams.length;

  return (
    <div className="dashboard-container">
      {/* Search
      <input
        className="dashboard-search"
        type="text"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      /> */}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{upcomingCount}</span>
          <span className="stat-label">Upcoming</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{urgentCount}</span>
          <span className="stat-label">Urgent</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{completedCount}</span>
          <span className="stat-label">Completed</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{totalCount}</span>
          <span className="stat-label">Total Exams</span>
        </div>
      </div>

      {/* Upcoming Exams */}
      <section>
        <h2 className="section-title">Upcoming Exams</h2>

        <div className="exam-carousel">
          {visibleUpcoming.map((exam) => {
            const time = getRemainingTime(exam.deadline);
            if (!time) return null;

            const isUrgent = time.days <= 3;

            return (
              <div key={exam.id} className="exam-card">
                <h3 className="exam-title">{exam.title}</h3>

                <p className="exam-timer">
                  {time.days}d {time.hours}h {time.minutes}m left
                </p>

                {isUrgent && (
                  <span className="badge badge-danger">
                    Deadline Soon
                  </span>
                )}

                <div className="exam-actions">
                  <button
                    className="primary"
                    onClick={() =>
                      navigate(
                        `/guidelines?mode=start&examId=${exam.id}`
                      )
                    }
                  >
                    Start Exam
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completed Exams */}
      {completedExams.length > 0 && (
        <section className="completed-section">
          <h2 className="section-title">Completed Exams</h2>

          <div className="completed-list">
            {completedExams.map((exam) => (
              <div key={exam.id} className="completed-item">
                <span className="completed-name">
                  {exam.title}
                </span>

                <button
                  className="link-btn"
                  onClick={() =>
                    navigate(`/result?examId=${exam.id}`)
                  }
                >
                  View Result
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;
