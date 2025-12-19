import { useExam } from "../context/ExamContext";
import { useTimer } from "../hooks/useTimer";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAutoSave } from "../hooks/useAutoSave";
import { useProctoring } from "../hooks/useProctoring";
import warningSound from "../assets/audio10.mp3";
import { useFaceProctoring } from "../hooks/useFaceProctoring";

import "../styles/Exam.css";

const MAX_VIOLATIONS = 5;
const FACE_LIMIT = 5;

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

  /* ================= TOAST ================= */
  const [toast, setToast] = useState<{
    message: string;
    remaining: number;
  } | null>(null);

  const addViolationWithToast = (type: any) => {
    addViolation(type);
    setToast({
      message: type.replace(/_/g, " "),
      remaining: MAX_VIOLATIONS - (violations.length + 1),
    });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
  if (violations.length >= MAX_VIOLATIONS) {
    submitExam();
    navigate("/");
  }
}, [violations.length]);

  /* ================= FACE POPUP ================= */
  const [facePopup, setFacePopup] = useState(false);
  const [faceCountdown, setFaceCountdown] = useState(FACE_LIMIT);
  const faceTimerRef = useRef<number | null>(null);
const startFacePopup = () => {
  setFacePopup(true);
};

const cancelFacePopup = () => {
  setFacePopup(false);
};


  /* ================= AUDIO ================= */
  const warningAudioRef = useRef<HTMLAudioElement | null>(null);
  if (!warningAudioRef.current) {
    warningAudioRef.current = new Audio(warningSound);
  }

  /* ================= TIMER ================= */
  const timeLeft = useTimer(examStartTime, duration);
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  /* ================= PROCTORING ================= */
  useProctoring(examStatus === "ongoing" ? addViolationWithToast : () => {});

  useAutoSave(activeExamId, {
    answers,
    currentQuestionIndex,
    examStartTime: examStartTime!,
    violations,
    examStatus,
  });

  /* ================= LIVE WEBCAM (NO SNAPSHOTS) ================= */
  const webcamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (examStatus !== "ongoing") return;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        addViolationWithToast("CAMERA_PERMISSION_DENIED");
      });

    return () => {
      const stream = webcamRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [examStatus]);

  /* ================= FACE PROCTORING ================= */
  useFaceProctoring(
    webcamRef,
    examStatus === "ongoing",
    startFacePopup,
    cancelFacePopup,
    addViolationWithToast
  );

  /* ================= FULLSCREEN ================= */
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [fullscreenCountdown, setFullscreenCountdown] = useState(5);
  const fullscreenTimerRef = useRef<number | null>(null);

  const returnToFullscreen = async () => {
    await document.documentElement.requestFullscreen();
    setFullscreenWarning(false);

    if (fullscreenTimerRef.current) {
      clearInterval(fullscreenTimerRef.current);
      fullscreenTimerRef.current = null;
    }

    warningAudioRef.current?.pause();
    warningAudioRef.current!.currentTime = 0;
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && examStatus === "ongoing") {
        warningAudioRef.current?.play().catch(() => {});
        setFullscreenWarning(true);
        setFullscreenCountdown(5);
        addViolationWithToast("EXIT_FULLSCREEN");

        fullscreenTimerRef.current = window.setInterval(() => {
          setFullscreenCountdown((c) => {
            if (c === 1) {
              clearInterval(fullscreenTimerRef.current!);
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
    return () =>
      document.removeEventListener("fullscreenchange", handler);
  }, [examStatus]);

  /* ================= AUTO SUBMIT ================= */
  useEffect(() => {
    if (
      (timeLeft === 0 && examStatus === "ongoing") ||
      violations.length >= MAX_VIOLATIONS
    ) {
      submitExam();
      navigate("/");
    }
  }, [timeLeft, examStatus, violations.length]);

  if (examStatus !== "ongoing") {
    return <p className="exam-empty">No active exam</p>;
  }

  const q = questions[currentQuestionIndex];
  const selected = answers[q.id];

  return (
    <div className="exam-container">
      {toast && (
        <div className="exam-toast">
          ⚠️ {toast.message} — Remaining {toast.remaining}/{MAX_VIOLATIONS}
        </div>
      )}

      <div className="webcam-box">
        <video ref={webcamRef} autoPlay muted playsInline />
      </div>

      {/* FACE NOT DETECTED */}
      {facePopup && !fullscreenWarning && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>Face Not Detected</h2>
            <p>
              Violation in <strong>{faceCountdown}</strong> seconds
            </p>
            <p>Please return to camera</p>
            <button className="primary" onClick={cancelFacePopup}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* FULLSCREEN */}
      {fullscreenWarning && (
        <div className="overlay">
          <div className="overlay-card">
            <h2>Fullscreen Required</h2>
            <p>
              Returning in <strong>{fullscreenCountdown}</strong> seconds
            </p>
            <button className="primary" onClick={returnToFullscreen}>
              Back to Fullscreen
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
            {h}:{m.toString().padStart(2, "0")}:
            {s.toString().padStart(2, "0")}
          </span>
        </div>

        <h3 className="exam-question">{q.question}</h3>

        <div className="exam-options">
          {q.options.map((opt, i) => (
            <label key={i} className="option-card">
              <input
                type="radio"
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
            ← Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className="primary"
              onClick={() => {
                submitExam();
                navigate("/");
              }}
            >
              Submit
            </button>
          ) : (
            <button className="primary" onClick={goToNextQuestion}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Exam;
