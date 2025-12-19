// src/pages/Guidelines.tsx

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExam } from "../context/ExamContext";
import "../styles/Guidelines.css";

function Guidelines() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { startExam } = useExam();

  const examId = searchParams.get("examId");

  const [agreed, setAgreed] = useState(false);

 const startExamWithFullscreen = async () => {
  if (!examId) {
    alert("Invalid exam");
    return;
  }

  const camAllowed = await requestCameraPermission();
  if (!camAllowed) return;

  try {
    await document.documentElement.requestFullscreen();
    startExam(examId);
    navigate("/exam");
  } catch {
    alert("Fullscreen is required to start the exam");
  }
};




  // camera permission
  const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    // Immediately stop – we only want permission
    stream.getTracks().forEach(track => track.stop());

    alert("Camera permission granted");
    return true;
  } catch (err) {
    alert("Camera permission is required for this exam");
    return false;
  }
};

  return (
    <div className="guidelines-container">
      <div className="guidelines-card">
        <h1 className="guidelines-title">Exam Guidelines</h1>

        <ul className="guidelines-list">
          <li>The exam is time-bound.</li>
          <li>Fullscreen mode is mandatory.</li>
          <li>Tab switching is monitored.</li>
          <li>Violations may lead to disqualification.</li>
        </ul>

        <div className="guidelines-agreement">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label>I have read and agree to the guidelines</label>
        </div>

        <button
          className="primary guidelines-start-btn"
          disabled={!agreed}
          onClick={startExamWithFullscreen}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}

export default Guidelines;
