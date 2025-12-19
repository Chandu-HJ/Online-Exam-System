import type { Question } from "../context/ExamContext";

interface Props {
  questions: Question[];
  answers: Record<number, number>;
}

function QuestionReview({ questions, answers }: Props) {
  return (
    <div>
      <h2>Question Review</h2>

      {questions.map((question, index) => {
        const selectedOption = answers[question.id];

        return (
          <div key={question.id} style={{ marginBottom: "20px" }}>
            <p>
              <strong>
                {index + 1}. {question.question}
              </strong>
            </p>

            <ul>
              {question.options.map((option, optionIndex) => {
                let color = "black";

                if (optionIndex === question.correctAnswer) {
                  color = "green";
                }

                if (
                  selectedOption === optionIndex &&
                  selectedOption !== question.correctAnswer
                ) {
                  color = "red";
                }

                return (
                  <li key={optionIndex} style={{ color }}>
                    {option}
                    {selectedOption === optionIndex &&
                      optionIndex === question.correctAnswer &&
                      " ✔"}
                    {selectedOption === optionIndex &&
                      optionIndex !== question.correctAnswer &&
                      " ✖"}
                  </li>
                );
              })}
            </ul>

            {selectedOption === undefined && (
              <p style={{ color: "gray" }}>
                Not attempted
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default QuestionReview;
