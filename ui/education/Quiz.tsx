import { useState } from 'react';
import './Quiz.css';

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export function Quiz({ title, questions }: { title: string; questions: QuizQuestion[] }) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => selected[q.id] !== undefined);
  const score = questions.filter((q) => selected[q.id] === q.correctIndex).length;

  function choose(questionId: string, choiceIndex: number) {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [questionId]: choiceIndex }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (allAnswered) setSubmitted(true);
  }

  function handleRetry() {
    setSelected({});
    setSubmitted(false);
  }

  return (
    <section className="quiz" aria-label={title}>
      <h2>{title}</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((q, qi) => (
          <fieldset key={q.id} className="quiz-question">
            <legend>
              {qi + 1}. {q.prompt}
            </legend>
            {q.choices.map((choice, ci) => {
              const isSelected = selected[q.id] === ci;
              const isCorrectChoice = ci === q.correctIndex;
              const classes = ['quiz-choice'];
              if (submitted && isSelected) classes.push(isCorrectChoice ? 'correct' : 'incorrect');
              if (submitted && !isSelected && isCorrectChoice) classes.push('correct-answer');
              return (
                <label key={ci} className={classes.join(' ')}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={isSelected}
                    onChange={() => choose(q.id, ci)}
                    disabled={submitted}
                  />
                  {choice}
                </label>
              );
            })}
            {submitted && <p className="quiz-explanation">{q.explanation}</p>}
          </fieldset>
        ))}
        {!submitted ? (
          <button type="submit" disabled={!allAnswered}>
            Check answers
          </button>
        ) : (
          <div className="quiz-result">
            <p>
              You scored {score} / {questions.length}.
            </p>
            <button type="button" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
