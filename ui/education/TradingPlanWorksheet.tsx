import { useId, useState } from 'react';
import { PositionSizeCalculator } from './PositionSizeCalculator';
import './TradingPlanWorksheet.css';

export interface TradingPlanWorksheetInitialValues {
  entryCondition?: string;
  stopRule?: string;
  targetRule?: string;
  rationale?: string;
}

/**
 * Fill-in-the-blank worksheet for Module 10 — every field is free text the user writes about
 * their own plan. There is no symbol field and nothing here is checked against market data;
 * position sizing is delegated entirely to PositionSizeCalculator (embedded, not reimplemented)
 * so this stays inside CLAUDE.md's phase boundary. Output is the user's own words reflected
 * back as a saved plan, not advice or an evaluation of one.
 */
export function TradingPlanWorksheet({
  initialValues,
}: {
  initialValues?: TradingPlanWorksheetInitialValues;
}) {
  const id = useId();
  const [entryCondition, setEntryCondition] = useState(initialValues?.entryCondition ?? '');
  const [stopRule, setStopRule] = useState(initialValues?.stopRule ?? '');
  const [targetRule, setTargetRule] = useState(initialValues?.targetRule ?? '');
  const [rationale, setRationale] = useState(initialValues?.rationale ?? '');

  return (
    <div className="tpw">
      <div className="tpw-section">
        <label htmlFor={`${id}-entry-condition`}>Entry condition</label>
        <p className="tpw-hint">What has to happen for you to enter this trade?</p>
        <textarea
          id={`${id}-entry-condition`}
          value={entryCondition}
          onChange={(e) => setEntryCondition(e.target.value)}
          placeholder="e.g. Price closes above the prior swing high on above-average volume"
        />
      </div>

      <div className="tpw-section">
        <label htmlFor={`${id}-stop-rule`}>Stop rule</label>
        <p className="tpw-hint">Where does this trade get invalidated?</p>
        <textarea
          id={`${id}-stop-rule`}
          value={stopRule}
          onChange={(e) => setStopRule(e.target.value)}
          placeholder="e.g. Below the most recent swing low"
        />
      </div>

      <div className="tpw-section">
        <label htmlFor={`${id}-target-rule`}>Target rule</label>
        <p className="tpw-hint">Where would you take profit, and why?</p>
        <textarea
          id={`${id}-target-rule`}
          value={targetRule}
          onChange={(e) => setTargetRule(e.target.value)}
          placeholder="e.g. Prior resistance level, or 2x the initial risk"
        />
      </div>

      <div className="tpw-section">
        <label>Position size</label>
        <p className="tpw-hint">Use the calculator below to size this trade against your plan.</p>
        <div className="tpw-position-size">
          <PositionSizeCalculator />
        </div>
      </div>

      <div className="tpw-section">
        <label htmlFor={`${id}-rationale`}>Rationale</label>
        <p className="tpw-hint">Why does this trade fit your plan?</p>
        <textarea
          id={`${id}-rationale`}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="e.g. Matches my trend-following setup criteria and fits within my weekly risk budget"
        />
      </div>
    </div>
  );
}
