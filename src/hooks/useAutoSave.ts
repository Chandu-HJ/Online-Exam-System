import { useEffect } from "react";
import type { ExamStatus, Violation } from "../context/ExamContext";

interface AutoSaveData {
  answers: Record<number, number>;
  currentQuestionIndex: number;
  examStartTime: number;
  violations: Violation[];
  examStatus: ExamStatus;
}

export function useAutoSave(
  examId: string | null,
  data: AutoSaveData
) {
  useEffect(() => {
    if (!examId) return;

    // STOP autosave once exam is submitted
    if (data.examStatus !== "ongoing") return;

    const key = `exam-progress-${examId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }, [
    examId,
    data.answers,
    data.currentQuestionIndex,
    data.examStartTime,
    data.violations,
    data.examStatus,
  ]);
}
