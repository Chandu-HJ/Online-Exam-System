import {  HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Dashboard from "../pages/Dashboard";
import Exam from "../pages/Exam";
import Result from "../pages/Result";
import Guidelines from "../pages/Guidelines";
import ResultsOverview from "../pages/ResultsOverview";
import Exams from "../pages/Exams";
import CoverPage from "../pages/CoverPage";

import AppLayout from "../layouts/AppLayout";
import ExamLayout from "../layouts/ExamLayout";

function Approuter() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    };

    //  listen to custom event
    window.addEventListener("auth-change", syncAuth);

    return () => {
      window.removeEventListener("auth-change", syncAuth);
    };
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* ===== COVER ===== */}
        <Route
          path="/cover"
          element={
            isLoggedIn ? <Navigate to="/" replace /> : <CoverPage />
          }
        />

        {/* ===== APP (WITH SIDEBAR) ===== */}
        <Route
          element={
            isLoggedIn ? <AppLayout /> : <Navigate to="/cover" replace />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/results" element={<ResultsOverview />} />
          <Route path="/result" element={<Result />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/exams" element={<Exams />} />
        </Route>

        {/* ===== EXAM (NO SIDEBAR) ===== */}
        <Route
          element={
            isLoggedIn ? <ExamLayout /> : <Navigate to="/cover" replace />
          }
        >
          <Route path="/exam" element={<Exam />} />
        </Route>

        {/* ===== FALLBACK ===== */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/" : "/cover"} replace />}
        />
      </Routes>
    </HashRouter>
  );
}

export default Approuter;
