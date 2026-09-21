import { describe, expect, it } from 'vitest';
import { gradePositionSizingAnswer } from './positionSizing';
import { positionSizingFixtures } from './positionSizing.fixtures';

const expectedCorrectAnswers: Record<string, number> = {
  'round-numbers': 50,
  'requires-rounding-down': 33,
  'tight-stop': 250,
  'wide-stop': 20,
  'fractional-risk-percent': 166,
  'large-equity-small-risk-percent': 50,
  'low-priced-tight-stop': 199,
};

describe('gradePositionSizingAnswer', () => {
  it.each(positionSizingFixtures)('computes the correct share count for "$id"', (scenario) => {
    const expected = expectedCorrectAnswers[scenario.id];
    const grade = gradePositionSizingAnswer(scenario, expected);
    expect(grade.correctAnswer).toBe(expected);
    expect(grade.correct).toBe(true);
    expect(grade.explanation).toContain(String(expected));
  });

  it('marks a deliberately wrong answer as incorrect and still returns the right correctAnswer', () => {
    const scenario = positionSizingFixtures.find((s) => s.id === 'round-numbers')!;
    const grade = gradePositionSizingAnswer(scenario, 999);
    expect(grade.correct).toBe(false);
    expect(grade.correctAnswer).toBe(50);
  });

  it('rounds down rather than to the nearest whole share', () => {
    const scenario = positionSizingFixtures.find((s) => s.id === 'requires-rounding-down')!;
    // 100 / 3 = 33.33... — must floor to 33, not round to 33 by coincidence of nearest-int.
    const grade = gradePositionSizingAnswer(scenario, 34);
    expect(grade.correct).toBe(false);
    expect(grade.correctAnswer).toBe(33);
  });

  it('includes the scenario math in the explanation', () => {
    const scenario = positionSizingFixtures.find((s) => s.id === 'wide-stop')!;
    const grade = gradePositionSizingAnswer(scenario, 20);
    expect(grade.explanation).toMatch(/\$100\.00/);
    expect(grade.explanation).toMatch(/\$5\.00/);
  });
});
