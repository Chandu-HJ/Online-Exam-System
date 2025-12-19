import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { exams } from "../data/exams";
import { getExamResultById } from "../utils/resultStorage";
import "../styles/Exams.css";

type Category = "all" | "upcoming" | "completed" | "past";

function Exams() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const now = new Date();

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const examDate = new Date(exam.deadline);
      const result = getExamResultById(exam.id);

      if (category === "upcoming" && examDate <= now) return false;
      if (category === "completed" && !result) return false;
      if (category === "past" && (examDate > now || result)) return false;

      if (
        search &&
        !exam.title.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [search, category]);

  const renderAction = (exam: any) => {
    const examDate = new Date(exam.deadline);
    const result = getExamResultById(exam.id);

    if (result) {
      return (
        <button
          className="secondary"
          onClick={() => navigate(`/result?examId=${exam.id}`)}
        >
          View Result
        </button>
      );
    }

    if (examDate > now) {
      return (
        <button
          className="primary"
          onClick={() => navigate(`/guidelines?examId=${exam.id}`)}
        >
          Start Exam
        </button>
      );
    }

    return <span className="exam-pill warning">Not Attempted</span>;
  };

  const getStatusTag = (exam: any) => {
    const examDate = new Date(exam.deadline);
    const result = getExamResultById(exam.id);

    if (result) return "completed";
    if (examDate > now) return "upcoming";
    return "past";
  };

  return (
    <div className="exams-page">
      <h1 className="page-title">Exams</h1>

      {/* 🔹 Sticky Search + Filter */}
      <div className="exam-toolbar">
        <input
          type="text"
          placeholder="Search exams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="exam-search"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="exam-filter"
        >
          <option value="all">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="past">Past</option>
        </select>
      </div>

      {/* 🔹 Exam Cards */}
      {filteredExams.length === 0 ? (
        <p className="empty-text">No exams found.</p>
      ) : (
        <div className="exam-list">
          {filteredExams.map((exam) => {
            const status = getStatusTag(exam);

            return (
              <div key={exam.id} className="exam-card">
                <div className="exam-header">
                  <h3 className="exam-title">{exam.title}</h3>
                  <span className={`exam-pill ${status}`}>
                    {status}
                  </span>
                </div>

                <div className="exam-meta">
                  <p>
                    <strong>Deadline:</strong>{" "}
                    {new Date(exam.deadline).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Duration:</strong> {exam.duration} mins
                  </p>
                </div>

                <div className="exam-actions">
                  {renderAction(exam)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Exams;
