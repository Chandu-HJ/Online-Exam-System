import type { Question } from "../context/ExamContext";

export interface ExamResult {
    totalQuestions: number;
    correct: number;
    wrong: number;
    unattempted: number;
    score: number;
}

export function calculateResult(
    questions: Question[],
    answers: Record<number, number>
): ExamResult {
    let correct = 0;
    let wrong = 0;

    questions.forEach((question) => {
        const selectedOption = answers[question.id];

        if (selectedOption === undefined) {
            return;
        }

        if (selectedOption === question.correctAnswer) {
            correct++;
        } else {
            wrong++;
        }
    });

    const totalQuestions = questions.length;
    const unattempted = totalQuestions - (correct + wrong);

    return {
        totalQuestions,
        correct,
        wrong,
        unattempted,
        score: correct, // 1 mark per question
    };
}
