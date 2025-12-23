// Exam.tsx - FINAL CLEAN VERSION

import { useExam } from "../context/ExamContext";
import { useTimer } from "../hooks/useTimer";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoSave } from "../hooks/useAutoSave";
import { useProctoring } from "../hooks/useProctoring";
import warningSound from "../assets/audio10.mp3";
import { useWebcamProctoring } from "../hooks/useWebcamProctoring";
import { useFaceProctoring } from "../hooks/useFaceProctoring";
import type { ViolationType } from "../context/ExamContext";

import "../styles/Exam.css";

const MAX_VIOLATIONS = 5;
const FACE_TIMEOUT = 5;

function Exam() {
  const {
    questions,
    currentQuestionIndex,
    examStatus,
    answers,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    examStartTime,
    duration,
    submitExam,
    violations,
    addViolation,
    activeExamId,
  } = useExam();

  const navigate = useNavigate();

  /* =======================
     TOAST
     ======================= */
  const [toast, setToast] = useState<{
    message: string;
    remaining: number;
  } | null>(null);

  const addViolationWithToast = (type: ViolationType) => {
    addViolation(type);

    const newCount = violations.length + 1;

    setToast({
      message: type.replace(/_/g, " "),
      remaining: Math.max(0, MAX_VIOLATIONS - newCount),
    });

    setTimeout(() => setToast(null), 4000);
  };

  /* =======================
     FACE WARNING TIMER
     ======================= */
  const [faceWarning, setFaceWarning] = useState(false);
  const [faceCountdown, setFaceCountdown] = useState(FACE_TIMEOUT);
  const faceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startFaceTimer = () => {
    if (faceTimerRef.current) return;

    setFaceWarning(true);
    setFaceCountdown(FACE_TIMEOUT);

    faceTimerRef.current = setInterval(() => {
      setFaceCountdown((prev) => {
        if (prev === 1) {
          clearInterval(faceTimerRef.current!);
          faceTimerRef.current = null;
          setFaceWarning(false);
          addViolationWithToast("NO_FACE_DETECTED");
          return FACE_TIMEOUT;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopFaceTimer = () => {
  if (faceTimerRef.current) {
    clearInterval(faceTimerRef.current);
    faceTimerRef.current = null;
  }

  setFaceWarning(false);
  setFaceCountdown(FACE_TIMEOUT);
};


  /* =======================
     AUDIO
     ======================= */
  const warningAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    warningAudioRef.current = new Audio(warningSound);
    return () => {
      warningAudioRef.current?.pause();
    };
  }, []);

  /* =======================
     TIMER
     ======================= */
  const timeLeft = useTimer(examStartTime, duration);
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  /* =======================
     PROCTORING
     ======================= */
  useProctoring(examStatus === "ongoing" ? addViolationWithToast : () => {});

  useAutoSave(activeExamId, {
    answers,
    currentQuestionIndex,
    examStartTime: examStartTime!,
    violations,
    examStatus,
  });

  const webcamRef = useWebcamProctoring(activeExamId, examStatus === "ongoing");

 const faceStatusRef = useFaceProctoring(
  webcamRef,
  examStatus === "ongoing"
);
useEffect(() => {
  if (faceStatusRef.current === "NO_FACE") {
    startFaceTimer();
  }

  if (faceStatusRef.current === "FACE_OK") {
    stopFaceTimer();
  }

  if (faceStatusRef.current === "MULTIPLE_FACES") {
    addViolationWithToast("MULTIPLE_FACES_DETECTED");
  }
}, [faceStatusRef.current]);


  /* =======================
     FULLSCREEN
     ======================= */
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [fullscreenCountdown, setFullscreenCountdown] = useState(5);
  const fullscreenTimerRef = useRef<NodeJS.Timeout | null>(null);

  const returnToFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setFullscreenWarning(false);
      if (fullscreenTimerRef.current) {
        clearInterval(fullscreenTimerRef.current);
        fullscreenTimerRef.current = null;
      }
      warningAudioRef.current?.pause();
      if (warningAudioRef.current) warningAudioRef.current.currentTime = 0;
    } catch (err) {
      console.error("Fullscreen failed", err);
    }
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && examStatus === "ongoing") {
        warningAudioRef.current?.play().catch(() => {});
        setFullscreenWarning(true);
        setFullscreenCountdown(5);
        addViolationWithToast("EXIT_FULLSCREEN");

        if (fullscreenTimerRef.current) {
          clearInterval(fullscreenTimerRef.current);
        }

        fullscreenTimerRef.current = setInterval(() => {
          setFullscreenCountdown((c) => {
            if (c === 1) {
              clearInterval(fullscreenTimerRef.current!);
              fullscreenTimerRef.current = null;
              submitExam();
              navigate("/");
              return 0;
            }
            return c - 1;
          });
        }, 1000);
      }
    };

    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [examStatus, submitExam, navigate]);

  /* =======================
     AUTO SUBMIT
     ======================= */
  useEffect(() => {
    if (
      (timeLeft === 0 && examStatus === "ongoing") ||
      violations.length >= MAX_VIOLATIONS
    ) {
      submitExam();
      navigate("/");
    }
  }, [timeLeft, examStatus, violations.length, submitExam, navigate]);

  if (examStatus !== "ongoing") {
    return <p className="exam-empty">No active exam</p>;
  }

  const q = questions[currentQuestionIndex];
  const selected = answers[q.id];

  return (
    <div className="exam-container">
      {toast && (
        <div className="exam-toast">
          {toast.message} — Remaining {toast.remaining}/{MAX_VIOLATIONS}
        </div>
      )}

      <div className="webcam-box">
        <video
          ref={webcamRef}
          muted
          autoPlay
          playsInline
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {faceWarning && !fullscreenWarning && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>Face not detected</h2>
            <p>
              Violation in <strong>{faceCountdown}s</strong>
            </p>
            <button className="primary" onClick={stopFaceTimer}>
              OK
            </button>
          </div>
        </div>
      )}

      {fullscreenWarning && (
        <div className="overlay">
          <div className="overlay-card fullscreen">
            <h2>Fullscreen required</h2>
            <p>
              Auto submit in <strong>{fullscreenCountdown}s</strong>
            </p>
            <button className="primary" onClick={returnToFullscreen}>
              Return to fullscreen
            </button>
          </div>
        </div>
      )}

      <div className="exam-card">
        <div className="exam-header">
          <h2>
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <span className="exam-timer">
            {h}:{m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
          </span>
          <div className="violations-count">
            Violations: {violations.length}/{MAX_VIOLATIONS}
          </div>
        </div>

        <h3 className="exam-question">{q.question}</h3>

        <div className="exam-options">
          {q.options.map((opt, i) => (
            <label key={i} className="option-card">
              <input
                type="radio"
                name={`question-${q.id}`}
                checked={selected === i}
                onChange={() => selectAnswer(q.id, i)}
              />
              <span className="option-content">
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="option-text">{opt}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="exam-actions">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={goToPreviousQuestion}
          >
            Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className="primary"
              onClick={() => {
                submitExam();
                navigate("/");
              }}
            >
              Submit Exam
            </button>
          ) : (
            <button className="primary" onClick={goToNextQuestion}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Exam;
