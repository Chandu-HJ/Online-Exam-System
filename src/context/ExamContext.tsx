import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import questionsData from "../data/questions.json";
import { calculateResult } from "../utils/score";
import { saveExamResult } from "../utils/resultStorage";
import { exams } from "../data/exams";



// for exam status
export type ExamStatus = "not-started" | "ongoing" | "submitted";

// question interface
export interface Question {
    id: number;
    examId: string;
    question: string;
    options: string[];
    correctAnswer: number;
}


// Exam question context
export interface ExamContextType {
    questions: Question[];
    answers: Record<number, number>;
    currentQuestionIndex: number;
    examStatus: ExamStatus;
    examStartTime: number | null;
    duration: number;
    violations: Violation[];
    examOutcome: ExamOutcome;
    activeExamId: string | null;



    // Addition of one function for start a exam
    startExam: (examId: string) => void;
    selectAnswer: (questionId: number, optionIndex: number) => void;
    goToNextQuestion: () => void;
    goToPreviousQuestion: () => void;
    submitExam: () => void;
    restoreExam: (examId: string) => boolean;
    addViolation: (type: ViolationType) => void;


}

// Exporting ExamContext
export const ExamContext = createContext<ExamContextType | null>(null);



// Exam proctoring violation type defining
export type ViolationType =
    | "TAB_SWITCH"
    | "WINDOW_BLUR"
    | "WEBCAM_DENIED"
    | "EXIT_FULLSCREEN"
    | "NO_FACE_DETECTED"
    | "MULTIPLE_FACES_DETECTED";

export interface Violation {
    type: ViolationType;
    time: number; // timestamp (Date.now())
}

// for proctoring the violations
export type ExamOutcome = "PASSED" | "FLAGGED" | "DISQUALIFIED";



// Exam Provider
export function ExamProvider({ children }: { children: ReactNode }) {
    const [examStatus, setExamStatus] = useState<ExamStatus>("not-started");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [examStartTime, setExamStartTime] = useState<number | null>(null);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [examOutcome, setExamOutcome] = useState<ExamOutcome>("PASSED");
    const [activeExamId, setActiveExamId] = useState<string | null>(null);


   const [duration, setDuration] = useState<number>(0);



    // Restoring exam data for resume
    const restoreExam = (examId: string) => {
        const key = `exam-progress-${examId}`;
        const saved = localStorage.getItem(key);

        if (!saved) return false;

        const parsed = JSON.parse(saved);

        setAnswers(parsed.answers);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setExamStartTime(parsed.examStartTime);
        setViolations(parsed.violations);
        setExamStatus(parsed.examStatus);

        return true;
    };




    //  start exam function to start an exam
    const startExam = (examId: string) => {
    setActiveExamId(examId);

    const filteredQuestions = (questionsData as Question[]).filter(
        (q) => q.examId === examId
    );
    setQuestions(filteredQuestions);

    const exam = exams.find((e) => e.id === examId);

    const resumed = restoreExam(examId);

    if (!resumed) {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setExamStartTime(Date.now());
        setViolations([]);
        setExamStatus("ongoing");

        //FIX: minutes → seconds
        setDuration((exam?.duration ?? 30) * 60);
    }
};


    


    // function used to choose an option
    const selectAnswer = (questionId: number, optionIndex: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex,
        }));
    };


    // for next and previous question navigation in exam page
    const goToNextQuestion = () => {
        setCurrentQuestionIndex((prev) =>
            prev < questions.length - 1 ? prev + 1 : prev
        );
    };

    const goToPreviousQuestion = () => {
        setCurrentQuestionIndex((prev) =>
            prev > 0 ? prev - 1 : prev
        );
    };



    // for submitting the test
    const submitExam = () => {
        let outcome: ExamOutcome = "PASSED";

        if (violations.length >= 5) outcome = "DISQUALIFIED";
        else if (violations.length >= 3) outcome = "FLAGGED";

        const result = calculateResult(questions, answers);

        saveExamResult({
  examId: activeExamId!,
  submittedAt: Date.now(),

  score: result.score,
  totalQuestions: result.totalQuestions,
  correct: result.correct,
  wrong: result.wrong,
  unattempted: result.unattempted,

  examOutcome: outcome,
  violations,

  answers, // SAVE ANSWERS
});


        setExamOutcome(outcome);
        setExamStatus("submitted");

        localStorage.removeItem(`exam-progress-${activeExamId}`);
    };



    // for adding violations
    const addViolation = (type: ViolationType) => {
        setViolations((prev) => [
            ...prev,
            {
                type,
                time: Date.now(),
            },
        ]);
    };


    // rendering the exam context provider with value
    return (
        <ExamContext.Provider
            value={{
                questions,
                answers,
                currentQuestionIndex,
                examStatus,
                examStartTime,
                duration,
                violations,
                examOutcome,
                activeExamId,
                startExam,
                selectAnswer,
                goToNextQuestion,
                goToPreviousQuestion,
                submitExam,
                restoreExam,
                addViolation,

            }}
        >
            {children}
        </ExamContext.Provider>
    );
}


export function useExam() {
    const context = useContext(ExamContext);

    if (!context) {
        throw new Error("useExam must be used inside ExamProvider");
    }

    return context;
}








