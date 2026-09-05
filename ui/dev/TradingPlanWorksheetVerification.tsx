import { TradingPlanWorksheet } from '../education/TradingPlanWorksheet';

/**
 * Throwaway verification route — not linked from the app, not part of any module. Renders
 * TradingPlanWorksheet so its fields (and the embedded PositionSizeCalculator) can be
 * hand-checked before Module 10's real content is built on top of it. Delete once Module 10
 * ships and wires the component into real curriculum content.
 */
export function TradingPlanWorksheetVerification() {
  return (
    <article className="module">
      <p className="module-eyebrow">Dev · Trading Plan Worksheet Verification</p>
      <h1>Trading Plan Worksheet — Verification</h1>
      <p className="module-intro">
        Check that every text field is independently typeable and retains its own value, and
        that the embedded position size calculator renders and computes correctly inside the
        worksheet.
      </p>

      <section>
        <h2>Empty worksheet</h2>
        <p>
          All four text fields should start empty with visible placeholder text. Typing in one
          field should not affect the others. The embedded calculator should show its own
          "enter values" placeholder until account size, risk %, entry, and stop are filled in.
        </p>
        <TradingPlanWorksheet />
      </section>

      <section>
        <h2>Prefilled worksheet</h2>
        <p>
          Entry condition, stop rule, target rule, and rationale should all load with the text
          below and remain fully editable. The embedded calculator is intentionally left blank
          here — position sizing is independent of the worksheet's initial values by design.
        </p>
        <TradingPlanWorksheet
          initialValues={{
            entryCondition: 'Price closes above $52.00 on volume at least 1.5x the 20-day average.',
            stopRule: 'Below $49.30 — the most recent swing low.',
            targetRule: '$58.00, the prior resistance level from March.',
            rationale: 'Fits my trend-following criteria and keeps risk within my weekly budget.',
          }}
        />
      </section>
    </article>
  );
}
