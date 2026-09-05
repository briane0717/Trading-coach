import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import { TradingPlanWorksheet } from '../TradingPlanWorksheet';
import { calculateATR } from '../indicators';
import { ATR_VOLATILITY_CANDLES } from './Module7TechnicalIndicators';

/**
 * Target price for the worked example below. Not derived from a formula — it's a chosen
 * price, the way a trader would actually pick a target, constrained by a real rendering limit:
 * `CandlestickChart`'s price scale autoscales to the visible candle data (this series never
 * prints above its actual high of $100.70) plus a modest margin for price lines, not to an
 * arbitrary price line value. Verified empirically before finalizing this file — a target of
 * $113.00 (2×risk above entry, matching Module 9's other worked example) rendered off the top
 * of the chart entirely; $108.00 and $110.00 did too; $105.00 rendered but was cramped against
 * the top edge; $103.00 rendered cleanly with room to spare. $103.00 was chosen for that reason,
 * and also happens to be a modest, plausible near-term extension — only about 2.3% above this
 * series' actual highest print, not a number invented to force a particular ratio.
 *
 * What's NOT hand-picked is the risk/reward ratio this target produces: that's computed live
 * from `atrEntry`/`atrStop`/this target inside the component below, then stated in prose and
 * asked about in the quiz — the same discipline as every other worked-example number in
 * Modules 7-9. Verified once against `calculateATR`'s real output before this file was
 * finalized: entry $99.60, ATR(14) ≈ $3.3815 (displays $3.38), stop ≈ $92.83696 (displays
 * $92.84), risk ≈ $6.763, reward = $103.00 − $99.60 = $3.40, so $3.40 ÷ $6.763 ≈ 0.50 —
 * written 0.50:1 below and in the quiz. That ratio is modest, and the module says so plainly
 * rather than picking a different, more flattering target: seeing an unflattering number
 * before entering, not after, is the entire point of writing a plan down in advance.
 */
const WORKED_EXAMPLE_TARGET = 103.0;

const quizQuestions: QuizQuestion[] = [
  {
    id: 'field-purposes',
    prompt:
      'The worksheet below has four fields: entry condition, stop rule, target rule, and rationale. Which pairing correctly describes two of them?',
    choices: [
      '"Entry condition" records how many shares to buy, and "rationale" records the exact stop price',
      '"Entry condition" describes what has to happen in the market before you\'d get in, and "rationale" is your own explanation of why this trade fits your plan',
      '"Stop rule" and "target rule" are the same field under two different names',
      '"Rationale" is where the app tells you whether the trade is a good idea',
    ],
    correctIndex: 1,
    explanation:
      'Entry condition is the trigger — what has to happen (a price level, a breakout, a close above resistance) before you\'d consider entering, tying back to Module 4\'s trend concepts and Module 6\'s support/resistance. Rationale is separate: your own written reasoning for why the setup fits your plan. Stop rule and target rule are two distinct fields (where the trade is invalidated vs. where profit gets taken), and nothing in the worksheet judges whether the trade is a good idea — see the last question below.',
  },
  {
    id: 'stop-and-size-tie-to-module-9',
    prompt: 'The stop rule and position size fields both connect directly to Module 9. How?',
    choices: [
      "They don't — Module 9 was about volatility, and this module is about writing things down",
      "Stop rule is where you write the same kind of ATR-scaled or structural stop Module 9 taught, and position size is Module 9's actual calculator, embedded here rather than rebuilt",
      'Position size here recalculates automatically from whatever stop rule you type in the text field',
      'Module 9 only applies once a trade is already open, not while planning one',
    ],
    correctIndex: 1,
    explanation:
      "The worksheet doesn't reimplement Module 9's math — it embeds the actual PositionSizeCalculator component, so the same verified formula (dollar risk ÷ stop distance, floored to whole shares) runs here. The stop rule field is where you write down the stop logic Module 9 covered (e.g., a multiple of ATR, or below a structural level), in your own words, as a record — not something read by the calculator, which stays a separate, manually-typed tool.",
  },
  {
    id: 'decide-before-not-during',
    prompt:
      'Why does this module frame a trading plan as decisions written down before entering a trade, rather than figured out during it?',
    choices: [
      "There's no real difference — the math comes out the same either way",
      'Because deciding a stop or target while a position is already open and moving means making that call under the pressure of an unrealized gain or loss, which is exactly when judgment is least reliable — writing it down beforehand locks in the decision while thinking clearly',
      'Because brokers require a written plan before accepting an order',
      'Because prices only move predictably if a plan was written in advance',
    ],
    correctIndex: 1,
    explanation:
      "Once money is on the line and the position is moving, there's real pressure to move the stop further away to avoid a loss, or bail on a target early out of anxiety — reacting in the moment, not following a plan. Deciding the entry condition, stop, target, and reasoning beforehand, while nothing is at stake yet, means the trade gets managed against a decision made with a clear head, not one improvised mid-trade. The worked example below shows another benefit of the same habit: writing the numbers down before entering is what surfaces an unflattering risk/reward ratio while it still only costs a few minutes to reconsider, not after a position is already open.",
  },
  {
    id: 'worked-example-rr',
    prompt:
      'In the worked example below — entry $99.60, ATR(14)-based stop ≈ $92.84, target $103.00 — what is the risk/reward ratio?',
    choices: ['About 0.50:1', 'Exactly 1.00:1', 'About 1.98:1', '3:1'],
    correctIndex: 0,
    explanation:
      'Risk = |entry − stop| = |$99.60 − $92.83696…| ≈ $6.763. Reward = |target − entry| = |$103.00 − $99.60| = $3.40. Risk/reward = $3.40 ÷ $6.763 ≈ 0.50, written 0.50:1 — a modest ratio, stated plainly rather than swapped for a more flattering target, because seeing this number before entering is exactly what a written plan is for.',
  },
  {
    id: 'worksheet-does-not-evaluate',
    prompt:
      'Does filling out this worksheet, or the position size calculator inside it, check your plan against any real or simulated market data — for example, verifying that a stock is actually near your stated entry condition right now?',
    choices: [
      'Yes — typing a price into any field looks it up against live or simulated quotes automatically',
      "No — every field is plain text or numbers you type yourself; there's no symbol field anywhere in the worksheet, and nothing here reads from or checks against the market data provider",
      'Yes, but only for the target rule field',
      'No, but the stop rule field does check against historical volatility automatically',
    ],
    correctIndex: 1,
    explanation:
      "This worksheet is documentation, not evaluation. Every field — entry condition, stop rule, target rule, rationale — is free text you write yourself, and the embedded position size calculator only does arithmetic on numbers you type in. Nothing in this component has a symbol field or calls the market data provider; it never checks whether a real or simulated stock is actually near the entry condition you wrote down. That's a deliberate scope boundary, not a missing feature.",
  },
];

/**
 * Education · Module 10, single flowing narrative (like Modules 4-6, 8, and 9, not Module 7's
 * five-quiz structure) — the four worksheet fields and the worked example all build toward one
 * idea (write the decision down before entering), rather than being independent concepts.
 *
 * Ties together three prior modules by name rather than re-teaching them: entry condition
 * connects to trend (Module 4) and support/resistance (Module 6); stop rule and position size
 * connect to Module 9's ATR-scaled stop and position-sizing formula; target rule connects to
 * Module 9's risk/reward ratio.
 *
 * The worked example reuses Module 7/9's `ATR_VOLATILITY_CANDLES` and `calculateATR` output
 * unmodified — entry ($99.60, the series' actual last close), ATR(14) (≈$3.38), and the
 * resulting stop (≈$92.84) are Module 9's own verified numbers, not re-derived. The only new
 * number this module introduces is the target — see the comment on `WORKED_EXAMPLE_TARGET`
 * above for why $103.00 was chosen (it's the highest price that actually renders on this
 * chart's autoscaled price axis, verified empirically, and it's also a plausible modest
 * extension above this series' real high). The risk/reward ratio it produces (≈0.50:1) is
 * computed live in this component from real entry/stop/target values, not written to look
 * plausible, and the module states the modest result plainly instead of swapping in a
 * different target to manufacture a cleaner-looking ratio. Rendered on `CandlestickChart` via
 * the existing `priceLines` prop (added for Module 6) — no new chart props needed.
 *
 * The worked-example section also renders `TradingPlanWorksheet` with `initialValues` set to
 * static prose describing this hypothetical trade, and deliberately no `persistKey` — this is
 * a fixed illustration of a filled-in plan, not something that should read or write a real
 * saved plan. The "build your own plan" section at the end renders the same component with a
 * fixed `persistKey` ("module10:trading-plan") and no `initialValues`, so the reader gets a
 * blank template that persists across visits via the localStorage support added in the commit
 * immediately before this one.
 *
 * No screener, symbol lookup, or "check this against a symbol" feature exists anywhere in this
 * module or in `TradingPlanWorksheet` itself — every field is user-typed text or numbers, and
 * the last quiz question exists specifically to make that scope boundary explicit rather than
 * only implicit in the component's design.
 *
 * Both video IDs were verified against YouTube's oEmbed endpoint
 * (https://www.youtube.com/oembed?url=...&format=json) before being used here, per the
 * standing convention — see the commit that added this module for the verification results.
 */
export function Module10BuildingATradingPlan() {
  const atr14 = calculateATR(ATR_VOLATILITY_CANDLES, 14);
  const lastCandle = ATR_VOLATILITY_CANDLES[ATR_VOLATILITY_CANDLES.length - 1];
  const lastAtr = atr14[atr14.length - 1].value;
  const atrEntry = lastCandle.close;
  const atrStop = atrEntry - 2 * lastAtr;
  const atrTarget = WORKED_EXAMPLE_TARGET;
  const riskDistance = Math.abs(atrEntry - atrStop);
  const rewardDistance = Math.abs(atrTarget - atrEntry);
  const riskReward = rewardDistance / riskDistance;

  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 10</p>
      <h1>Building a Trading Plan</h1>
      <p className="module-intro">
        Every piece of this module has already been taught separately. Module 4 covered trend,
        Module 6 covered support and resistance, and Module 9 covered ATR-scaled stops,
        position sizing, and risk/reward ratio. A trading plan doesn't add a new concept on top
        of those — it's a habit: writing down what those concepts say <em>before</em> entering a
        trade, instead of figuring it out while the position is already open and money is on the
        line.
      </p>

      <section>
        <h2>Four decisions, made ahead of time</h2>
        <p>
          A trading plan for a single trade comes down to four written decisions. The{' '}
          <strong>entry condition</strong> is what has to happen in the market before you'd
          consider getting in at all — a trend continuing (Module 4), or price reacting at a
          support or resistance level (Module 6). The <strong>stop rule</strong> is where the
          trade gets invalidated, often scaled to the stock's own volatility the way Module 9's
          ATR-based stop was. <strong>Position size</strong> is Module 9's formula — how many
          shares fit the risk being taken, given that stop. The <strong>target rule</strong> is
          where profit gets taken, and alongside the stop it produces Module 9's risk/reward
          ratio.
        </p>
        <p>
          None of that is new material. What's new is the order: deciding all four{' '}
          <strong>before</strong> the trade exists, not during it. Once a position is open and
          moving, there's real pressure to move a stop further away to avoid taking a loss, or
          to abandon a target early out of anxiety — reacting to the position's live P&amp;L
          instead of following a plan made with a clear head. Writing the four decisions down
          ahead of time is what a plan actually protects against — and, as the worked example
          below shows, it can also surface a number worth reconsidering before any money is at
          risk at all.
        </p>
      </section>

      <VideoEmbed
        youtubeId="prxhC22lE_Y"
        title="A Complete Trading Plan - What to Include So You Trade Your Best — Cory Mitchell Trading"
        caption="Cory Mitchell Trading: A Complete Trading Plan — What to Include So You Trade Your Best"
      />

      <section>
        <h2>Worked example: putting it all together</h2>
        <p>
          Below is the same chart and the same ATR-based stop from Module 9's worked example,
          reused unmodified: entry is this series' actual last close,{' '}
          <strong>${atrEntry.toFixed(2)}</strong>, ATR(14) at that point is about{' '}
          <strong>${lastAtr.toFixed(2)}</strong>, and 2×ATR below entry places a stop at about{' '}
          <strong>${atrStop.toFixed(2)}</strong>. New to this module is a target,{' '}
          <strong>${atrTarget.toFixed(2)}</strong> — a chosen price, not a formula output, and a
          modest one: only a couple of dollars above this series' actual highest print. All
          three are marked on the chart below.
        </p>
        <CandlestickChart
          symbol="Example: Entry, Stop &amp; Target for a Trading Plan"
          timeframe="1d"
          candles={ATR_VOLATILITY_CANDLES}
          sourceType="simulated"
          priceLines={[
            { price: atrEntry, label: `Entry $${atrEntry.toFixed(2)}`, color: '#2563eb' },
            { price: atrStop, label: `Stop (2×ATR) ≈ $${atrStop.toFixed(2)}`, color: '#dc2626' },
            { price: atrTarget, label: `Target $${atrTarget.toFixed(2)}`, color: '#16a34a' },
          ]}
        />
        <p className="module-formula">
          Risk = |${atrEntry.toFixed(2)} − ${atrStop.toFixed(2)}| ≈ ${riskDistance.toFixed(2)} ·
          Reward = |${atrTarget.toFixed(2)} − ${atrEntry.toFixed(2)}| = $
          {rewardDistance.toFixed(2)} · R:R ≈ {riskReward.toFixed(2)}:1
        </p>
        <p>
          That ratio is modest — about <strong>{riskReward.toFixed(2)}:1</strong>, risking more
          than is being targeted — and this module isn't swapping in a more flattering target to
          hide that. This is the actual benefit of writing the plan down first: that number is
          visible <em>before</em> a single share is bought, while reconsidering the target, the
          stop, or the trade itself is still free. Discovering an unfavorable ratio mid-trade,
          after money is already committed, is a much more expensive way to learn the same
          thing.
        </p>
        <p>
          Written into the four worksheet fields, this hypothetical plan reads: the{' '}
          <strong>entry condition</strong> is the breakout itself — price closing at a fresh
          high on expanding ATR, confirming the stock has moved out of its earlier calm range.
          The <strong>stop rule</strong> is 2×ATR(14) below entry, scaling the stop to this
          stock's own recent volatility rather than picking an arbitrary dollar distance. The{' '}
          <strong>target rule</strong> is the chosen ${atrTarget.toFixed(2)} level. And the{' '}
          <strong>rationale</strong> has to be honest about the ratio it produces, not just
          restate the entry logic. Filled in, it looks like the worksheet below — a fixed
          illustration that doesn't save anything you type, unlike the blank one at the end of
          this module.
        </p>
        <TradingPlanWorksheet
          initialValues={{
            entryCondition:
              'Price closes at a fresh high with ATR(14) expanding, confirming the breakout out of the prior calm range.',
            stopRule: `2×ATR(14) below entry ≈ $${atrStop.toFixed(2)} — scales to this stock's own recent volatility.`,
            targetRule: `$${atrTarget.toFixed(2)} — works out to about ${riskReward.toFixed(2)}:1 risk/reward, a modest ratio, not solved backward to force a rounder number.`,
            rationale: `Breakout out of a defined calm range with a volatility-scaled stop. The ${riskReward.toFixed(2)}:1 reward-to-risk is on the low side — worth reconsidering the target, or skipping this one, rather than talking myself into it after the fact.`,
          }}
        />
        <p>
          This is documentation of a hypothetical trade, not a recommendation and not something
          checked against any market data — the chart above is the same static, simulated series
          Module 7 and Module 9 used, not a live quote.
        </p>
      </section>

      <VideoEmbed
        youtubeId="J4NmAppqXnU"
        title="Building Trading Discipline: How to Choose and Stick to a Strategy — FXPesa"
        caption="FXPesa: Building Trading Discipline — How to Choose and Stick to a Strategy"
      />

      <section>
        <h2>Build your own plan</h2>
        <p>
          The worksheet below is blank and yours to fill in with your own entry condition, stop
          rule, target rule, and rationale — practice writing a plan down before a trade exists,
          not during one. It saves what you type in this browser and reloads it the next time
          you visit this page, so you can come back and keep working on it. Nothing you write
          here is evaluated, scored, or checked against any stock, real or simulated — there's
          no symbol field anywhere in it. The position size calculator inside is the same
          one-shot tool from Module 9: type in numbers, see the math, nothing saved.
        </p>
        <TradingPlanWorksheet persistKey="module10:trading-plan" />
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
