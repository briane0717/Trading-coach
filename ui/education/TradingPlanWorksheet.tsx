import { useEffect, useId, useState } from 'react';
import { PositionSizeCalculator } from './PositionSizeCalculator';
import './TradingPlanWorksheet.css';

export interface TradingPlanWorksheetInitialValues {
  entryCondition?: string;
  stopRule?: string;
  targetRule?: string;
  rationale?: string;
}

interface PersistedFields {
  entryCondition: string;
  stopRule: string;
  targetRule: string;
  rationale: string;
}

function loadPersisted(persistKey: string): PersistedFields | undefined {
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return undefined;
    return {
      entryCondition: typeof parsed.entryCondition === 'string' ? parsed.entryCondition : '',
      stopRule: typeof parsed.stopRule === 'string' ? parsed.stopRule : '',
      targetRule: typeof parsed.targetRule === 'string' ? parsed.targetRule : '',
      rationale: typeof parsed.rationale === 'string' ? parsed.rationale : '',
    };
  } catch {
    return undefined;
  }
}

function savePersisted(persistKey: string, fields: PersistedFields): void {
  try {
    window.localStorage.setItem(persistKey, JSON.stringify(fields));
  } catch {
    // Storage unavailable (private browsing, quota, disabled) — fall back to in-memory only.
  }
}

/**
 * Fill-in-the-blank worksheet for Module 10 — every field is free text the user writes about
 * their own plan. There is no symbol field and nothing here is checked against market data;
 * position sizing is delegated entirely to PositionSizeCalculator (embedded, not reimplemented,
 * and never persisted here) so this stays inside CLAUDE.md's phase boundary. Output is the
 * user's own words reflected back as a saved plan, not advice or an evaluation of one.
 *
 * `persistKey` is opt-in: when provided, the four text fields (only) load from and save to
 * localStorage under that key as a single JSON object. Omit it for pure in-memory behavior.
 */
export function TradingPlanWorksheet({
  initialValues,
  persistKey,
}: {
  initialValues?: TradingPlanWorksheetInitialValues;
  persistKey?: string;
}) {
  const id = useId();
  const [persisted] = useState(() => (persistKey ? loadPersisted(persistKey) : undefined));
  const [entryCondition, setEntryCondition] = useState(
    persisted?.entryCondition ?? initialValues?.entryCondition ?? ''
  );
  const [stopRule, setStopRule] = useState(persisted?.stopRule ?? initialValues?.stopRule ?? '');
  const [targetRule, setTargetRule] = useState(
    persisted?.targetRule ?? initialValues?.targetRule ?? ''
  );
  const [rationale, setRationale] = useState(persisted?.rationale ?? initialValues?.rationale ?? '');

  useEffect(() => {
    if (!persistKey) return;
    savePersisted(persistKey, { entryCondition, stopRule, targetRule, rationale });
  }, [persistKey, entryCondition, stopRule, targetRule, rationale]);

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
