export const demoResults = [
  {
    examId: "exam-1",
    submittedAt: Date.now() - 86400000,

    score: 18,
    totalQuestions: 20,
    correct: 18,
    wrong: 2,
    unattempted: 0,

    examOutcome: "PASSED",
    violations: [],

    answers: {
      1: 0,
      2: 1,
      3: 2,
    },
  },
  {
    examId: "exam-2",
    submittedAt: Date.now() - 43200000,

    score: 7,
    totalQuestions: 20,
    correct: 7,
    wrong: 10,
    unattempted: 3,

    examOutcome: "PASSED", // failed by percentage
    violations: [],

    answers: {
      1: 1,
      2: 3,
    },
  },
  {
    examId: "exam-3",
    submittedAt: Date.now() - 21600000,

    score: 5,
    totalQuestions: 20,
    correct: 5,
    wrong: 8,
    unattempted: 7,

    examOutcome: "DISQUALIFIED",
    violations: [
      { type: "TAB_SWITCH", time: Date.now() - 300000 },
      { type: "EXIT_FULLSCREEN", time: Date.now() - 200000 },
      { type: "TAB_SWITCH", time: Date.now() - 100000 },
    ],

    answers: {},
  },
];
