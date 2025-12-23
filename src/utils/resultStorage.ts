import type { Violation } from "../context/ExamContext";

export interface ExamResultSnapshot {
  examId: string;
  submittedAt: number;

  score: number;
  totalQuestions: number;
  correct: number;
  wrong: number;
  unattempted: number;

  examOutcome: "PASSED" | "FLAGGED" | "DISQUALIFIED";
  violations: Violation[];

  answers: Record<number, number>; //  ADD THIS
}

const STORAGE_KEY = "exam-results";

export function saveExamResult(result: ExamResultSnapshot) {
  const existing =
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  const updated = [
    ...existing.filter(
      (r: ExamResultSnapshot) => r.examId !== result.examId
    ),
    result,
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getAllExamResults(): ExamResultSnapshot[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

export function getExamResultById(
  examId: string
): ExamResultSnapshot | undefined {
  return getAllExamResults().find(
    (r) => r.examId === examId
  );
}
