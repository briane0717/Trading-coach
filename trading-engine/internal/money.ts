/**
 * Rounds to the nearest cent. Applied everywhere this module computes money (cash, cost,
 * proceeds, avg entry price, P/L, equity) so results stay consistent and don't accumulate
 * floating-point noise across a sequence of trades — the same convention simulated.ts uses
 * for prices.
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
