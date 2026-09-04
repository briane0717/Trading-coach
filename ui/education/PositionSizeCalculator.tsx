import { useId, useState } from 'react';
import './PositionSizeCalculator.css';

export interface PositionSizeCalculatorInitialValues {
  accountSize?: string;
  riskPercent?: string;
  entryPrice?: string;
  stopPrice?: string;
  targetPrice?: string;
}

function parseNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function positiveFieldError(raw: string, label: string): string | undefined {
  if (raw.trim() === '') return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (n <= 0) return `${label} must be greater than $0.`;
  return undefined;
}

const fmtMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const fmtPercent = (n: number) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 0 });

/**
 * Position sizing math — not a trade recommendation. Every input is user-entered (no symbol
 * field, no data-provider/quote lookup), so this stays fully inside CLAUDE.md's phase
 * boundary: no market data of any kind is wired in. `initialValues` exists only so a caller
 * (e.g. a dev verification route) can prefill the fields for hand-checking; the fields stay
 * fully editable and everything recomputes live as the user types.
 */
export function PositionSizeCalculator({
  initialValues,
}: {
  initialValues?: PositionSizeCalculatorInitialValues;
}) {
  const id = useId();
  const [accountSize, setAccountSize] = useState(initialValues?.accountSize ?? '');
  const [riskPercent, setRiskPercent] = useState(initialValues?.riskPercent ?? '');
  const [entryPrice, setEntryPrice] = useState(initialValues?.entryPrice ?? '');
  const [stopPrice, setStopPrice] = useState(initialValues?.stopPrice ?? '');
  const [targetPrice, setTargetPrice] = useState(initialValues?.targetPrice ?? '');

  const accountSizeNum = parseNumber(accountSize);
  const riskPercentNum = parseNumber(riskPercent);
  const entryNum = parseNumber(entryPrice);
  const stopNum = parseNumber(stopPrice);
  const targetProvided = targetPrice.trim() !== '';
  const targetNum = targetProvided ? parseNumber(targetPrice) : undefined;

  const entryError = positiveFieldError(entryPrice, 'Entry price');
  const stopFieldError = positiveFieldError(stopPrice, 'Stop-loss price');
  const targetError = targetProvided ? positiveFieldError(targetPrice, 'Target price') : undefined;

  const equalError =
    !entryError && !stopFieldError && entryNum !== undefined && stopNum !== undefined && entryNum === stopNum
      ? "Stop-loss price can't equal entry price — that would divide by zero."
      : undefined;

  const stopError = stopFieldError ?? equalError;

  const riskPercentWarning =
    riskPercentNum !== undefined && (riskPercentNum < 0.5 || riskPercentNum > 2)
      ? `${fmtPercent(riskPercentNum)}% is outside the roughly 0.5%–2% range this module teaches as ` +
        `reasonable for a single trade. Still usable — this is a soft guideline, not a hard limit.`
      : undefined;

  const canCalculate =
    accountSizeNum !== undefined &&
    riskPercentNum !== undefined &&
    entryNum !== undefined &&
    stopNum !== undefined &&
    !entryError &&
    !stopError;

  let dollarRisk: number | undefined;
  let stopDistance: number | undefined;
  let shares: number | undefined;
  let positionCost: number | undefined;
  let riskRewardRatio: number | undefined;

  if (canCalculate) {
    dollarRisk = accountSizeNum! * (riskPercentNum! / 100);
    stopDistance = Math.abs(entryNum! - stopNum!);
    shares = Math.floor(dollarRisk / stopDistance);
    positionCost = shares * entryNum!;
    if (targetProvided && targetNum !== undefined && !targetError) {
      riskRewardRatio = Math.abs(targetNum - entryNum!) / stopDistance;
    }
  }

  return (
    <div className="psc">
      <div className="psc-fields">
        <div className="psc-field">
          <label htmlFor={`${id}-account`}>Account size ($)</label>
          <input
            id={`${id}-account`}
            type="text"
            inputMode="decimal"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            placeholder="e.g. 25000"
          />
        </div>

        <div className="psc-field">
          <label htmlFor={`${id}-risk`}>Risk per trade (%)</label>
          <input
            id={`${id}-risk`}
            type="text"
            inputMode="decimal"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="e.g. 1"
          />
          {riskPercentWarning && <p className="psc-warning">{riskPercentWarning}</p>}
        </div>

        <div className="psc-field">
          <label htmlFor={`${id}-entry`}>Entry price ($)</label>
          <input
            id={`${id}-entry`}
            type="text"
            inputMode="decimal"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="e.g. 52.30"
          />
          {entryError && <p className="psc-error">{entryError}</p>}
        </div>

        <div className="psc-field">
          <label htmlFor={`${id}-stop`}>Stop-loss price ($)</label>
          <input
            id={`${id}-stop`}
            type="text"
            inputMode="decimal"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            placeholder="e.g. 49.30"
          />
          {stopError && <p className="psc-error">{stopError}</p>}
        </div>

        <div className="psc-field">
          <label htmlFor={`${id}-target`}>Target price ($) — optional</label>
          <input
            id={`${id}-target`}
            type="text"
            inputMode="decimal"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="e.g. 58.00"
          />
          {targetError && <p className="psc-error">{targetError}</p>}
        </div>
      </div>

      <div className="psc-output">
        <p className="psc-output-label">Position sizing math</p>
        {!canCalculate ? (
          <p className="psc-placeholder">
            Enter account size, risk %, entry, and stop above to see the math.
          </p>
        ) : (
          <>
            <dl className="psc-output-rows">
              <div className="psc-output-row">
                <dt>Dollar risk</dt>
                <dd>{fmtMoney(dollarRisk!)}</dd>
              </div>
              <div className="psc-output-row">
                <dt>Stop distance per share</dt>
                <dd>{fmtMoney(stopDistance!)}</dd>
              </div>
              <div className="psc-output-row">
                <dt>Shares (floored to whole shares)</dt>
                <dd>{shares!.toLocaleString('en-US')}</dd>
              </div>
              <div className="psc-output-row">
                <dt>Position cost</dt>
                <dd>{fmtMoney(positionCost!)}</dd>
              </div>
              {riskRewardRatio !== undefined && (
                <div className="psc-output-row">
                  <dt>Risk/reward ratio</dt>
                  <dd>{riskRewardRatio.toFixed(2)}:1</dd>
                </div>
              )}
            </dl>
            <p className="psc-note">
              This tells you how many shares match your chosen risk and stop — it does not tell
              you whether or when to enter a trade.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
