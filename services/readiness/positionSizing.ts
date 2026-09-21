export interface PositionSizingScenario {
  id: string;
  description: string;
  accountEquity: number;
  entryPrice: number;
  stopPrice: number;
  /** e.g. 1 means "risk 1% of equity" */
  riskPercent: number;
}

export interface PositionSizingGrade {
  correct: boolean;
  correctAnswer: number;
  explanation: string;
}

const fmtMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/**
 * Mirrors the exact formula in ui/education/PositionSizeCalculator.tsx (dollar risk / stop
 * distance, floored to whole shares) — the two must stay in lockstep or the readiness grader
 * and the teaching tool would disagree on the "correct" answer for the same inputs.
 */
export function gradePositionSizingAnswer(
  scenario: PositionSizingScenario,
  userAnswerShares: number,
): PositionSizingGrade {
  const dollarRisk = scenario.accountEquity * (scenario.riskPercent / 100);
  const stopDistance = Math.abs(scenario.entryPrice - scenario.stopPrice);
  const correctAnswer = Math.floor(dollarRisk / stopDistance);
  const correct = userAnswerShares === correctAnswer;

  const explanation =
    `Risk ${scenario.riskPercent}% of ${fmtMoney(scenario.accountEquity)} equity = ` +
    `${fmtMoney(dollarRisk)} at risk. The stop is ${fmtMoney(stopDistance)} away from entry, so ` +
    `${fmtMoney(dollarRisk)} / ${fmtMoney(stopDistance)} = ${(dollarRisk / stopDistance).toFixed(2)} shares, ` +
    `floored to whole shares: ${correctAnswer}.`;

  return { correct, correctAnswer, explanation };
}
