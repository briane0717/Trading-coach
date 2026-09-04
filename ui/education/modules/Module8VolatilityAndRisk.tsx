import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import { calculateATR } from '../indicators';
import { ATR_VOLATILITY_CANDLES } from './Module7TechnicalIndicators';
import type { Candle } from '../../../normalized';

/**
 * Fresh, hand-authored 35-bar series built only for this module: a single stock that stays
 * structurally calm the entire time — no breakout, no expansion phase, unlike this module's
 * other example (Module 7's `ATR_VOLATILITY_CANDLES`, reused below), which is one stock whose
 * volatility changes partway through. Same tight-range character as that array's first 18
 * bars (small day-to-day drift, a fixed small wick offset on every candle), just sustained for
 * the whole series instead of breaking into a wide-range expansion.
 *
 * One condition was checked programmatically against `calculateATR`'s real output before this
 * array was finalized: ATR(14) stays in a consistent, narrow range for every exposed point,
 * with no meaningful drift from the first reading to the last. ATR(14) first becomes available
 * at candle index 14 (2026-01-23), reading about $0.45 on a $40.00 close — about 1.13% of
 * price. By the last bar (2026-02-20), ATR(14) is about $0.43 on a $40.05 close — about 1.08%
 * of price. Every one of the 21 exposed ATR(14) readings in between falls within that same
 * roughly 1.08%-1.13% band — this is the exact array that passed on the first attempt.
 */
const CALM_STOCK_CANDLES: Candle[] = [
  { timestamp: 1767623400000, open: 39.9, high: 40.15, low: 39.75, close: 40, volume: 700000 },
  { timestamp: 1767709800000, open: 40, high: 40.35, low: 39.85, close: 40.2, volume: 715000 },
  { timestamp: 1767796200000, open: 40.2, high: 40.35, low: 39.9, close: 40.05, volume: 730000 },
  { timestamp: 1767882600000, open: 40.05, high: 40.2, low: 39.75, close: 39.9, volume: 745000 },
  { timestamp: 1767969000000, open: 39.9, high: 40.25, low: 39.75, close: 40.1, volume: 760000 },
  { timestamp: 1768228200000, open: 40.1, high: 40.4, low: 39.95, close: 40.25, volume: 700000 },
  { timestamp: 1768314600000, open: 40.25, high: 40.4, low: 39.95, close: 40.1, volume: 715000 },
  { timestamp: 1768401000000, open: 40.1, high: 40.25, low: 39.8, close: 39.95, volume: 730000 },
  { timestamp: 1768487400000, open: 39.95, high: 40.1, low: 39.65, close: 39.8, volume: 745000 },
  { timestamp: 1768573800000, open: 39.8, high: 40.1, low: 39.65, close: 39.95, volume: 760000 },
  { timestamp: 1768833000000, open: 39.95, high: 40.25, low: 39.8, close: 40.1, volume: 700000 },
  { timestamp: 1768919400000, open: 40.1, high: 40.35, low: 39.95, close: 40.2, volume: 715000 },
  { timestamp: 1769005800000, open: 40.2, high: 40.35, low: 39.9, close: 40.05, volume: 730000 },
  { timestamp: 1769092200000, open: 40.05, high: 40.2, low: 39.75, close: 39.9, volume: 745000 },
  { timestamp: 1769178600000, open: 39.9, high: 40.15, low: 39.75, close: 40, volume: 760000 },
  { timestamp: 1769437800000, open: 40, high: 40.3, low: 39.85, close: 40.15, volume: 700000 },
  { timestamp: 1769524200000, open: 40.15, high: 40.45, low: 40, close: 40.3, volume: 715000 },
  { timestamp: 1769610600000, open: 40.3, high: 40.45, low: 40, close: 40.15, volume: 730000 },
  { timestamp: 1769697000000, open: 40.15, high: 40.3, low: 39.85, close: 40, volume: 745000 },
  { timestamp: 1769783400000, open: 40, high: 40.15, low: 39.7, close: 39.85, volume: 760000 },
  { timestamp: 1770042600000, open: 39.85, high: 40.1, low: 39.7, close: 39.95, volume: 700000 },
  { timestamp: 1770129000000, open: 39.95, high: 40.25, low: 39.8, close: 40.1, volume: 715000 },
  { timestamp: 1770215400000, open: 40.1, high: 40.35, low: 39.95, close: 40.2, volume: 730000 },
  { timestamp: 1770301800000, open: 40.2, high: 40.35, low: 39.9, close: 40.05, volume: 745000 },
  { timestamp: 1770388200000, open: 40.05, high: 40.2, low: 39.75, close: 39.9, volume: 760000 },
  { timestamp: 1770647400000, open: 39.9, high: 40.15, low: 39.75, close: 40, volume: 700000 },
  { timestamp: 1770733800000, open: 40, high: 40.3, low: 39.85, close: 40.15, volume: 715000 },
  { timestamp: 1770820200000, open: 40.15, high: 40.4, low: 40, close: 40.25, volume: 730000 },
  { timestamp: 1770906600000, open: 40.25, high: 40.4, low: 39.95, close: 40.1, volume: 745000 },
  { timestamp: 1770993000000, open: 40.1, high: 40.25, low: 39.8, close: 39.95, volume: 760000 },
  { timestamp: 1771252200000, open: 39.95, high: 40.2, low: 39.8, close: 40.05, volume: 700000 },
  { timestamp: 1771338600000, open: 40.05, high: 40.35, low: 39.9, close: 40.2, volume: 715000 },
  { timestamp: 1771425000000, open: 40.2, high: 40.35, low: 39.95, close: 40.1, volume: 730000 },
  { timestamp: 1771511400000, open: 40.1, high: 40.25, low: 39.8, close: 39.95, volume: 745000 },
  { timestamp: 1771597800000, open: 39.95, high: 40.2, low: 39.8, close: 40.05, volume: 760000 },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'volatility-definition',
    prompt: 'What does "volatility" mean, in the way this module (and Module 7\'s ATR section) defines it?',
    choices: [
      'Whether a stock is going up or down',
      'The magnitude of a stock\'s price movement, regardless of direction — how big its swings have recently been',
      'How many shares of a stock trade per day',
      'How long a stock has been publicly traded',
    ],
    correctIndex: 1,
    explanation:
      "Volatility is about size, not direction. It's the magnitude of a stock's recent price movement — how big its swings have been — the same thing ATR measures in Module 7. A stock can be volatile while trending up, trending down, or going nowhere at all; volatility on its own says nothing about which way price is headed.",
  },
  {
    id: 'same-stock-two-phases',
    prompt:
      "Module 7's ATR example is one stock across one chart: ATR(14) reads about 1.16% of price ($0.93 on an $80.20 close) at the end of the calm phase, then about 3.40% of price ($3.38 on a $99.60 close) by the last bar. What does that comparison show?",
    choices: [
      'That the stock became a completely different company partway through the chart',
      "That the same stock's volatility isn't fixed — it can be calm for a long stretch and then expand into much wider swings, all on the same ticker",
      'That ATR is unreliable and gave two contradictory readings',
      'That the stock was about to reverse direction',
    ],
    correctIndex: 1,
    explanation:
      "This is one stock, one continuous chart. ATR(14) roughly tripled from the calm phase to the expansion phase — clear evidence that volatility isn't a fixed trait of a stock, it's a condition that can change over time. Same company, same shares, a very different trading environment a few weeks later.",
  },
  {
    id: 'calm-stock-reading',
    prompt:
      "This module's second example is a different stock. Its ATR(14) opens around 1.13% of price and closes the series around 1.08% — every one of the 21 exposed readings in between stays in that same roughly 1.08%-1.13% band, with no breakout. How should that be read alongside Module 7's stock?",
    choices: [
      "It proves ATR doesn't work on this stock, since the number barely changed",
      "It's the other half of the same lesson: this stock isn't in a temporary calm phase waiting to expand — it's just a lower-volatility stock, period, the way Module 7's stock was calm for a while and then wasn't",
      'It means this stock never has any price movement at all',
      "It shows this stock is riskier than Module 7's, because its ATR percentage is a specific decimal number",
    ],
    correctIndex: 1,
    explanation:
      "Two different lessons, deliberately paired. Module 7's stock shows volatility changing over time within one ticker. This stock shows the other half: some stocks simply run calmer than others as an ongoing characteristic, not a phase. Both are real, and telling them apart matters — one is \"wait, this could expand again,\" the other is \"this one just doesn't move much.\"",
  },
  {
    id: 'dollar-risk-share-count',
    prompt:
      "This module's closing idea is that the same dollar amount of risk buys a different number of shares depending on volatility. Without doing any math, why would that be true?",
    choices: [
      'It isn\'t true — a fixed dollar risk always buys the same number of shares regardless of the stock',
      "A more volatile stock's price swings farther per share, so a stop placed far enough away to avoid getting shaken out by normal movement represents more dollars of risk per share — meaning fewer shares fit inside the same total risk budget than a calmer stock would allow",
      'Only the share price matters — volatility has no bearing on how many shares a fixed risk amount buys',
      'A calmer stock always means a smaller total position, regardless of price',
    ],
    correctIndex: 1,
    explanation:
      "A wider-swinging (more volatile) stock needs more room per share between entry and a sensible stop, so each share carries more dollars of risk. A calmer stock needs less room per share, so each share carries fewer dollars of risk. Same total risk budget, but it buys fewer shares of the volatile stock and more shares of the calm one. This module is just the concept — the actual formula for turning this into a share count is Module 9.",
  },
  {
    id: 'volatile-not-automatically-bad',
    prompt: 'Does higher volatility mean a stock should be avoided?',
    choices: [
      'Yes — any stock with above-average volatility is too risky to ever trade',
      "No — volatility isn't a verdict on whether to trade a stock, it's information about how big that stock's typical swings are, which should shape how a position gets sized rather than whether it gets taken at all",
      'No, because volatility has no real effect on a trade at all',
      'Yes, but only for stocks priced under $50',
    ],
    correctIndex: 1,
    explanation:
      "Same hedge this module keeps coming back to: volatility isn't good or bad on its own, and it isn't a reason to avoid a stock outright. It's information — how big this stock's normal swings tend to be — that should inform how a position is sized, so a normal move for that specific stock doesn't blow past a planned risk amount. Module 9 covers the actual sizing mechanics.",
  },
];

/**
 * Education · Module 8, single concept: volatility as the size of a stock's price swings,
 * and why that size should shape position sizing (not this module — Module 9 builds the
 * actual formula). Shaped like Modules 4-6 (one flowing set of sections, one end-of-module
 * quiz) rather than Module 7's five-section format, since this module covers one idea.
 *
 * Deliberately does not re-teach ATR's mechanics (true range, the 14-period smoothing) —
 * that belongs to Module 7 and is only recapped here at the definition level ("magnitude of
 * movement, not direction"). Two examples carry the actual teaching:
 *
 * 1. Module 7's `ATR_VOLATILITY_CANDLES` (now exported from that file, reused here
 *    unmodified) — one stock whose ATR(14) roughly triples from a calm phase (~1.16% of
 *    price) to an expansion phase (~3.40% of price) within a single chart. Illustrates that
 *    one stock's volatility can shift over time.
 *
 * 2. A fresh, hand-authored 35-bar series (`CALM_STOCK_CANDLES`, this file) for a different
 *    stock that stays in a tight ~1.08%-1.13% ATR(14) band for its entire length, with no
 *    breakout. One condition was checked programmatically against `calculateATR`'s real
 *    output before this array was finalized: every exposed ATR(14) reading stays within that
 *    narrow band, with no meaningful drift from the first reading to the last — confirming
 *    "structurally calm the whole way through," not just "calm so far." Illustrates the
 *    other half of the lesson: some stocks are simply lower-volatility than others as an
 *    ongoing characteristic, not a temporary phase.
 *
 * Both examples render via CandlestickChart's existing `oscillatorPane` prop, unmodified —
 * the same mechanism Module 7's ATR section uses, since ATR still needs its own auto-scaled
 * sub-pane here for the same reason it does there.
 *
 * The module closes on intuition only, no formula: the same dollar risk amount buys fewer
 * shares of a volatile stock than a calm one, because a volatile stock needs more room per
 * share before a stop is placed far enough away to avoid normal noise. No position-sizing
 * calculation is built here — that's Module 9's job; this module only sets up why the
 * calculation will need to account for volatility at all.
 */
export function Module8VolatilityAndRisk() {
  const atrExpanding = calculateATR(ATR_VOLATILITY_CANDLES, 14);
  const atrCalm = calculateATR(CALM_STOCK_CANDLES, 14);

  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 8</p>
      <h1>Volatility &amp; Risk Basics</h1>
      <p className="module-intro">
        Module 7 introduced ATR as a way to measure how big a stock's price swings have
        recently been — its <strong>volatility</strong>. This module doesn't re-derive that
        math. It uses two real examples to make one point: volatility isn't a fixed number
        attached to a stock, and it isn't the same for every stock either. Both of those facts
        matter for a question this module sets up but doesn't answer yet — how much of a
        stock to actually buy.
      </p>

      <section>
        <h2>The same stock, two different environments</h2>
        <p>
          Below is the exact chart from Module 7's ATR section: one stock, one continuous
          series of candles. For the first 18 bars, ATR(14) sits around{' '}
          <strong>1.16% of price</strong> (about <strong>$0.93</strong> on an{' '}
          <strong>$80.20</strong> close) — small, tight day-to-day ranges. Then the stock
          breaks out, and by the last bar ATR(14) has climbed to about{' '}
          <strong>3.40% of price</strong> (about <strong>$3.38</strong> on a{' '}
          <strong>$99.60</strong> close) — roughly <strong>3.6 times</strong> the calm-phase
          reading.
        </p>
        <p>
          Same company, same shares outstanding, same ticker. What changed is the trading
          environment: this stock's volatility is not a fixed trait, it's a condition that can
          shift over time.
        </p>
        <CandlestickChart
          symbol="Example: Same Stock, Calm Then Expanding (Module 7)"
          timeframe="1d"
          candles={ATR_VOLATILITY_CANDLES}
          sourceType="simulated"
          oscillatorPane={{ label: 'ATR(14)', color: '#7c3aed', points: atrExpanding }}
        />
      </section>

      <section>
        <h2>A different stock that just stays calm</h2>
        <p>
          The chart below is a different stock entirely. Its ATR(14) opens around{' '}
          <strong>1.13% of price</strong> (about <strong>$0.45</strong> on a{' '}
          <strong>$40.00</strong> close) and closes the series around{' '}
          <strong>1.08%</strong> (about <strong>$0.43</strong> on a <strong>$40.05</strong>{' '}
          close) — every reading in between stays in that same narrow band. No breakout, no
          expansion phase. This isn't a stock that happens to be calm <em>so far</em> — across
          this entire series, it just doesn't move much.
        </p>
        <p>
          Put the two charts side by side and the distinction sharpens: the first stock's
          volatility is a moving target, calm one month and expanding the next. This stock's
          low volatility looks more like an ongoing characteristic. Some stocks are simply
          lower-volatility than others, separate from whichever specific phase any one stock
          happens to be in right now.
        </p>
        <CandlestickChart
          symbol="Example: A Structurally Calm Stock"
          timeframe="1d"
          candles={CALM_STOCK_CANDLES}
          sourceType="simulated"
          oscillatorPane={{ label: 'ATR(14)', color: '#7c3aed', points: atrCalm }}
        />
      </section>

      <VideoEmbed
        youtubeId="fT-HcX6f6Zk"
        title="What is Volatility in Trading? Volatility Trading for Beginners (VIX, ATR, Stocks, Crypto, Forex) — Mind Math Money"
        caption="Mind Math Money: What is Volatility in Trading? — Volatility Trading for Beginners"
      />

      <section>
        <h2>Why this matters before buying a single share</h2>
        <p>
          Here's the idea to carry forward, without doing any math yet: the same dollar amount
          of risk buys a <strong>different number of shares</strong> depending on how volatile
          the stock is.
        </p>
        <p>
          A more volatile stock swings farther per share on an ordinary day. Placing a stop
          close enough to keep risk small, but far enough away that normal noise doesn't
          trigger it, means each share of a volatile stock represents more dollars of risk. A
          calmer stock needs much less room per share before hitting that same balance, so each
          share represents fewer dollars of risk. Given the same total amount a trader is
          willing to risk on one trade, that math works out to <strong>fewer shares</strong> of
          the volatile stock and <strong>more shares</strong> of the calm one.
        </p>
        <p>
          None of that is a reason to avoid volatile stocks — volatility isn't a verdict on
          whether to trade something, it's information about the size of its normal swings.
          What it should change is <strong>how many shares</strong> get bought, not whether to
          buy at all. Turning this intuition into an actual share count — the formula, not just
          the idea — is Module 9.
        </p>
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
