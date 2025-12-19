import { exams } from "../data/exams";

const STORAGE_KEY = "exam-results"; // ✅ MUST MATCH resultStorage.ts

export function seedDemoData() {
  // Do NOT override real user data
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const demoExams = exams.slice(0, 3);
  if (demoExams.length === 0) return;

  const now = Date.now();

  const demoResults = demoExams.map((exam, index) => {
    const isPassed = index === 0;
    const isFailed = index === 1;
    const isTerminated = index === 2;

    const totalQuestions = 20;

    const correct = isPassed ? 16 : isFailed ? 6 : 5;
    const wrong = isPassed ? 4 : isFailed ? 10 : 8;
    const unattempted = totalQuestions - (correct + wrong);

    return {
      examId: exam.id,
      submittedAt: now - (index + 1) * 86400000,

      score: correct,
      totalQuestions,
      correct,
      wrong,
      unattempted,

      examOutcome: isTerminated ? "DISQUALIFIED" : "PASSED",

      violations: isTerminated
        ? [
            { type: "TAB_SWITCH", time: now - 300000 },
            { type: "EXIT_FULLSCREEN", time: now - 200000 },
            { type: "TAB_SWITCH", time: now - 100000 },
          ]
        : [],

      answers: {
        1: 0,
        2: 1,
        3: 2,
      },
    };
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoResults));
}
