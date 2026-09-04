import { PositionSizeCalculator } from '../education/PositionSizeCalculator';

/**
 * Throwaway verification route — not linked from the app, not part of any module. Renders
 * PositionSizeCalculator with a few preset inputs so its math can be hand-checked against the
 * expected values noted below before Module 9's real content is built on top of it. Delete
 * once Module 9 ships and wires the component into real curriculum content — don't leave this
 * sitting around the way ui/dev/IndicatorVerification.tsx did after Module 7 shipped.
 */
export function PositionSizeVerification() {
  return (
    <article className="module">
      <p className="module-eyebrow">Dev · Position Size Verification</p>
      <h1>Position Size Calculator — Verification</h1>
      <p className="module-intro">
        Six preset scenarios below, each a separate live instance of the component (fields
        stay editable — presets just save re-typing). Expected values are written out next to
        each one for hand-checking.
      </p>

      <section>
        <h2>Preset 1 — floor behavior (no target)</h2>
        <p>
          Account $25,000, risk 1%, entry $52.30, stop $49.30. Dollar risk = $250.00. Stop
          distance = $3.00. 250 / 3 = 83.33…, so shares should floor to <strong>83</strong>,
          not round to 83 either way by luck — this is the case that actually exercises the
          floor. Position cost = 83 × $52.30 = <strong>$4,340.90</strong>. No target entered, so
          no risk/reward row should render.
        </p>
        <PositionSizeCalculator
          initialValues={{
            accountSize: '25000',
            riskPercent: '1',
            entryPrice: '52.30',
            stopPrice: '49.30',
          }}
        />
      </section>

      <section>
        <h2>Preset 2 — with target price (risk/reward ratio)</h2>
        <p>
          Account $10,000, risk 1.5%, entry $20.00, stop $18.50, target $25.00. Dollar risk =
          $150.00. Stop distance = $1.50. 150 / 1.5 = 100 exactly, so shares ={' '}
          <strong>100</strong>. Position cost = 100 × $20.00 = <strong>$2,000.00</strong>.
          Risk/reward = |25 − 20| / 1.50 = 3.333…, displayed as <strong>3.33:1</strong>.
        </p>
        <PositionSizeCalculator
          initialValues={{
            accountSize: '10000',
            riskPercent: '1.5',
            entryPrice: '20.00',
            stopPrice: '18.50',
            targetPrice: '25.00',
          }}
        />
      </section>

      <section>
        <h2>Preset 3 — risk % warning trigger</h2>
        <p>
          Account $50,000, risk 3%, entry $100.00, stop $95.00. 3% is above the ~0.5%-2% range
          this module teaches, so a soft warning should appear under the risk field — math
          still computes, nothing is blocked. Dollar risk = $1,500.00. Stop distance = $5.00.
          1500 / 5 = 300 exactly, so shares = <strong>300</strong>. Position cost = 300 ×
          $100.00 = <strong>$30,000.00</strong>.
        </p>
        <PositionSizeCalculator
          initialValues={{
            accountSize: '50000',
            riskPercent: '3',
            entryPrice: '100.00',
            stopPrice: '95.00',
          }}
        />
      </section>

      <section>
        <h2>Preset 4 — validation errors (divide-by-zero guard)</h2>
        <p>
          Entry $40.00 equals stop $40.00. The stop field should show an inline error about
          dividing by zero, and no output section (dollar risk, shares, etc.) should render
          until the fields are corrected — the guard should not silently clamp or substitute a
          fallback value.
        </p>
        <PositionSizeCalculator
          initialValues={{
            accountSize: '25000',
            riskPercent: '1',
            entryPrice: '40.00',
            stopPrice: '40.00',
          }}
        />
      </section>

      <section>
        <h2>Preset 5 — validation errors (negative account size)</h2>
        <p>
          Account size is <strong>-25000</strong>. The account size field should show an inline
          error that it must be greater than $0, and no output section should render — no
          negative dollar risk, no garbage negative share count.
        </p>
        <PositionSizeCalculator
          initialValues={{
            accountSize: '-25000',
            riskPercent: '1',
            entryPrice: '52.30',
            stopPrice: '49.30',
          }}
        />
      </section>

      <section>
        <h2>Preset 6 — validation errors (negative risk %)</h2>
        <p>
          Risk per trade is <strong>-1</strong>%. The risk field should show an inline error
          that it must be greater than 0 (not the soft out-of-range warning — this is a hard
          block), and no output section should render.
        </p>
        <PositionSizeCalculator
          initialValues={{
            accountSize: '25000',
            riskPercent: '-1',
            entryPrice: '52.30',
            stopPrice: '49.30',
          }}
        />
      </section>
    </article>
  );
}
