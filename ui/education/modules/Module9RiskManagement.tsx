import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import { PositionSizeCalculator } from '../PositionSizeCalculator';
import { calculateATR } from '../indicators';
import { ATR_VOLATILITY_CANDLES } from './Module7TechnicalIndicators';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'risk-percent-of-account-not-position',
    prompt:
      "This module caps risk as a percentage of account size, not a percentage of position size. Tying back to Module 8's volatility lesson, why does that distinction matter?",
    choices: [
      'It doesn\'t matter — the two percentages always work out to the same dollar amount',
      "Because stop distance (and therefore dollars risked per share) varies by stock and by volatility, the same % of account size still buys a different share count depending on where the stop sits — sizing off position size instead would ignore that entirely",
      'Because a position is always smaller than the account that holds it',
      'Because brokers require risk to be expressed as a percent of account size by regulation',
    ],
    correctIndex: 1,
    explanation:
      "Module 8's point was that the same dollar risk buys a different number of shares depending on how far away the stop needs to sit — a volatile stock needs more room per share, so each share costs more risk dollars. Capping risk as a % of account size keeps the total dollars at risk constant no matter which stock is being traded; capping it as a % of position size instead would let a wide-stop volatile stock and a tight-stop calm stock consume very different actual risk for the \"same\" percentage.",
  },
  {
    id: 'atr-based-stop-benefit',
    prompt:
      "The stop-loss example below sets a stop 2×ATR(14) below entry — entry $99.60, ATR(14) ≈ $3.38, stop ≈ $92.84. What's the benefit of sizing a stop this way instead of applying a fixed dollar distance, like \"$5 below entry,\" to every trade?",
    choices: [
      'None — a fixed dollar stop and an ATR-based stop always land at the same price',
      "It scales the stop's distance to how much this specific stock actually moves day to day, the same ATR concept from Module 7/8 — a calmer stock gets a tighter stop, a more volatile one gets more room, instead of one arbitrary distance applied to every stock regardless of its normal swings",
      'It guarantees the stop will never actually be hit',
      'It only works on stocks priced under $100',
    ],
    correctIndex: 1,
    explanation:
      "A fixed dollar stop treats every stock the same regardless of how much it typically moves. An ATR-based stop scales with the stock's own recent volatility — tighter for a calm stock, wider for a volatile one — so the stop sits far enough away to avoid ordinary noise without being arbitrarily far or arbitrarily close. It's the same ATR idea from Module 7/8, just applied to stop placement instead of just described.",
  },
  {
    id: 'rr-worked-example',
    prompt:
      'In the risk/reward worked example — entry $50, stop $47, target $59 — what is the risk/reward ratio?',
    choices: ['1:1', '2:1', '3:1', '9:1'],
    correctIndex: 2,
    explanation:
      'Risk = |entry − stop| = |50 − 47| = $3. Reward = |target − entry| = |59 − 50| = $9. Risk/reward = reward ÷ risk = 9 ÷ 3 = 3, written 3:1 — for every $1 risked, $3 of reward is targeted if the trade reaches its target.',
  },
  {
    id: 'floor-not-round',
    prompt:
      'In the full worked example (account $30,000, risk 1%, entry $64.50, stop $61.82), dollar risk ÷ stop distance = $300 ÷ $2.68 = 111.94. How many shares does the math actually call for, and why?',
    choices: [
      '112, because 111.94 rounds up to the nearest whole share',
      "111, because share count is always floored, never rounded — 112 shares × $2.68 stop distance = $300.16, which is over the $300 that was actually budgeted, while 111 shares × $2.68 = $297.48 stays under it",
      '111.94, since fractional shares are allowed',
      "0, because the numbers don't divide evenly",
    ],
    correctIndex: 1,
    explanation:
      "Flooring, not rounding, is what keeps actual dollar risk from exceeding the planned amount. 112 shares would risk $300.16 — sixteen cents more than the $300 budget — while 111 shares risks $297.48, staying at or under budget. Rounding 111.94 up to 112 because it's \"close enough\" would quietly blow past the risk limit the whole calculation exists to enforce.",
  },
  {
    id: 'calculator-share-count-not-verdict',
    prompt:
      'The Position Size Calculator below computes a share count from whatever risk, entry, and stop you type in. Does that share count tell you whether this is a good trade to take?',
    choices: [
      'Yes — if the calculator returns a share count, the trade is safe to take',
      "No — the calculator only tells you how many shares match the risk and stop you already chose; it says nothing about whether that entry, stop, or target reflect a sound setup, or whether now is even the right time to enter at all",
      'Yes, because the risk/reward ratio it computes doubles as a buy signal',
      "No, because the underlying math is unreliable",
    ],
    correctIndex: 1,
    explanation:
      "The calculator takes entry, stop, and target on faith — it has no idea whether those numbers came from a well-reasoned setup or were typed in at random. It answers exactly one question: given this risk and this stop, how many shares fit? It does not evaluate the setup itself, and it never tells you whether or when to enter a trade — that judgment stays entirely with the trader.",
  },
];

/**
 * Education · Module 9, single flowing narrative (like Modules 4-6 and 8, not Module 7's
 * five-quiz structure) — max risk, ATR-scaled stop placement, and risk/reward all build
 * toward one formula (the position-sizing math Module 8 set up but didn't compute), rather
 * than being independent concepts that deserve separate quizzes.
 *
 * The ATR-based stop example reuses Module 7's exported `ATR_VOLATILITY_CANDLES` unmodified
 * (no fabricated candle data) — entry is that series' actual last close ($99.60, 2026-02-25)
 * and the stop is 2×ATR(14) below it, using `calculateATR`'s real output at that point
 * (≈$3.38), not a number written to look plausible. The "worked example tying it together"
 * section's numbers (account $30,000, risk 1%, entry $64.50, stop $61.82, target $69.86) were
 * likewise verified against the actual position-sizing formula before being written into the
 * lesson text: dollar risk $300.00, stop distance $2.68, raw division 111.94 (deliberately a
 * fraction that rounds up but must floor down, so 112 × $2.68 = $300.16 exceeds the $300
 * budget while 111 × $2.68 = $297.48 stays under it), shares 111, position cost $7,159.50,
 * R:R exactly 2.00:1.
 *
 * "Try it yourself" embeds `PositionSizeCalculator` (built in the two commits immediately
 * before this one) unmodified, framed explicitly as practice with the reader's own numbers —
 * not as a tool for sizing a live position, consistent with this app's Phase 1 (Education)
 * boundary: no symbol field, no data-provider dependency, simulated/static data only.
 *
 * Both video IDs were verified against YouTube's oEmbed endpoint
 * (https://www.youtube.com/oembed?url=...&format=json) before being used here, per the
 * standing convention — see the commit that added this module for the verification results.
 */
export function Module9RiskManagement() {
  const atr14 = calculateATR(ATR_VOLATILITY_CANDLES, 14);
  const lastCandle = ATR_VOLATILITY_CANDLES[ATR_VOLATILITY_CANDLES.length - 1];
  const lastAtr = atr14[atr14.length - 1].value;
  const atrEntry = lastCandle.close;
  const atrStop = atrEntry - 2 * lastAtr;

  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 9</p>
      <h1>Risk Management</h1>
      <p className="module-intro">
        Module 8 ended on an idea without a formula: the same dollar amount of risk buys a
        different number of shares depending on a stock's volatility. This module builds that
        formula. It covers three pieces — how much of an account to risk on one trade, how to
        set a stop that scales with a stock's own volatility, and what risk/reward ratio
        actually means — then puts all three together in one worked example, and hands you a
        calculator to practice with your own numbers.
      </p>

      <section>
        <h2>Max account risk: capping risk as a % of account, not a % of position</h2>
        <p>
          A common practice among traders is to cap how much of their account they're willing
          to risk on any single trade — often expressed as a small percentage, like 1%. That
          cap is deliberately expressed as a percentage of <strong>account size</strong>, not a
          percentage of the position itself, and Module 8's lesson is exactly why: the same
          dollar amount of risk buys a very different number of shares depending on how far
          away the stop needs to sit.
        </p>
        <p>
          Picture two stocks and the same $500 risk budget on each. A calmer stock with a $1
          stop distance lets that $500 buy 500 shares before the risk budget is used up. A more
          volatile stock that needs a $5 stop distance to avoid getting shaken out by normal
          noise only lets that same $500 buy 100 shares. Same dollars at risk, five times the
          share count difference — because the stop distance, not the share count, is what
          volatility actually changes.
        </p>
        <p>
          None of this is a specific percentage this module is telling you to use — it's a
          common practice, not a rule, and the right number for any individual trader depends
          on factors this module doesn't cover. The point is narrower: pinning the risk cap to
          account size, and letting share count float with the stop distance, is what keeps the
          actual dollars at risk consistent from one trade to the next.
        </p>
      </section>

      <VideoEmbed
        youtubeId="LedNZbXqP54"
        title="Risk Management and Position Sizing for Beginners - Trading Tutorial — Koroush AK"
        caption="Koroush AK: Risk Management and Position Sizing for Beginners — Trading Tutorial"
      />

      <section>
        <h2>Stop-loss placement: scaling the stop to volatility</h2>
        <p>
          A stop doesn't have to be an arbitrary fixed dollar amount below entry. Module 7
          introduced ATR as a measure of how big a stock's price swings have recently been, and
          one common way to place a stop is as a <strong>multiple of ATR</strong> — for
          example, "2×ATR below entry" — so the stop's distance scales with that specific
          stock's own volatility instead of using one fixed distance for every stock regardless
          of how much it actually moves.
        </p>
        <p>
          Below is the exact chart from Module 7 and Module 8's ATR examples —{' '}
          <code>ATR_VOLATILITY_CANDLES</code>, unmodified. At the last bar (2026-02-25), the
          close is <strong>${atrEntry.toFixed(2)}</strong> and ATR(14) is about{' '}
          <strong>${lastAtr.toFixed(2)}</strong>. Two times that ATR reading is about{' '}
          <strong>${(2 * lastAtr).toFixed(2)}</strong>, which places a stop at{' '}
          <strong>${atrEntry.toFixed(2)} − ${(2 * lastAtr).toFixed(2)} ≈ ${atrStop.toFixed(2)}</strong>{' '}
          — marked on the chart below alongside entry.
        </p>
        <CandlestickChart
          symbol="Example: ATR-Based Stop (2×ATR below entry)"
          timeframe="1d"
          candles={ATR_VOLATILITY_CANDLES}
          sourceType="simulated"
          oscillatorPane={{ label: 'ATR(14)', color: '#7c3aed', points: atr14 }}
          priceLines={[
            { price: atrEntry, label: `Entry $${atrEntry.toFixed(2)}`, color: '#2563eb' },
            { price: atrStop, label: `Stop (2×ATR) ≈ $${atrStop.toFixed(2)}`, color: '#dc2626' },
          ]}
        />
        <p>
          If this same stock had spent the whole chart in its calm phase instead of expanding,
          ATR(14) would have stayed near the roughly $0.93 reading from the end of that calm
          stretch (see Module 8), and 2×ATR would have placed the stop only about $1.86 below
          entry — much tighter, because the stock wasn't moving nearly as much. The multiple
          stays the same; the dollar distance it produces moves with the stock.
        </p>
      </section>

      <section>
        <h2>Risk/reward ratio</h2>
        <p>
          Risk/reward ratio compares how much is risked to how much is targeted, using the same
          entry, stop, and target this module has been working with:
        </p>
        <p className="module-formula">risk/reward = |target − entry| ÷ |entry − stop|</p>
        <p>
          Worked example: entry <strong>$50</strong>, stop <strong>$47</strong>, target{' '}
          <strong>$59</strong>. Risk = |50 − 47| = <strong>$3</strong>. Reward = |59 − 50| ={' '}
          <strong>$9</strong>. Risk/reward = 9 ÷ 3 = <strong>3, written 3:1</strong> — for every
          $1 risked, $3 of reward is targeted if the trade reaches its target price.
        </p>
        <p>
          A higher ratio isn't automatically "better" on its own — it says nothing about how
          likely the trade is to actually reach that target. It's one more number to weigh
          alongside everything else, not a verdict on the trade by itself.
        </p>
      </section>

      <VideoEmbed
        youtubeId="oypkaebzvUs"
        title="Risk to Reward Ratio: The #1 Trading Secret Beginners Must Know (Step-by-Step Guide) — Chart Champions"
        caption="Chart Champions: Risk to Reward Ratio — The #1 Trading Secret Beginners Must Know"
      />

      <section>
        <h2>Worked example: putting it all together</h2>
        <p>
          One full static walkthrough, with every number checked against the actual formula
          before being written here — not just written to look plausible.
        </p>
        <p className="module-formula">
          Account $30,000.00 · Risk 1% · Entry $64.50 · Stop $61.82 · Target $69.86
        </p>
        <ul className="module-list">
          <li>Dollar risk = $30,000.00 × 1% = <strong>$300.00</strong></li>
          <li>Stop distance = |$64.50 − $61.82| = <strong>$2.68</strong></li>
          <li>
            Shares = floor($300.00 ÷ $2.68) = floor(111.94…) = <strong>111 shares</strong>{' '}
            (112 shares would cost $300.16 of actual risk — over the $300.00 budget — so the
            math floors down to 111, which costs $297.48, rather than rounding up)
          </li>
          <li>Position cost = 111 × $64.50 = <strong>$7,159.50</strong></li>
          <li>
            Risk/reward = |$69.86 − $64.50| ÷ $2.68 = $5.36 ÷ $2.68 ={' '}
            <strong>2.00, written 2.00:1</strong>
          </li>
        </ul>
        <p>
          This is the same math the calculator below runs live — position sizing math, not a
          recommendation. It says how many shares match this specific risk and stop; it doesn't
          say whether $64.50 is a good entry, whether $61.82 is a sensible stop, or whether now
          is the right time to take this trade at all.
        </p>
      </section>

      <section>
        <h2>Try it yourself</h2>
        <p>
          The calculator below is the same component the worked example above used, fully
          editable. Type in your own account size, risk percentage, entry, and stop to see the
          share count and position cost the math produces — this is for practicing the
          calculation itself, on made-up numbers, not for sizing an actual live position.
        </p>
        <PositionSizeCalculator />
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
