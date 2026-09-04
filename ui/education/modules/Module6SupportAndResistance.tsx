import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import type { Candle } from '../../../normalized';

const SUPPORT_EXAMPLE_CANDLES: Candle[] = [
  { timestamp: 1784212200000, open: 49.33, high: 52.73, low: 48.65, close: 52.15, volume: 1590871 },
  { timestamp: 1784298600000, open: 52.29, high: 54.91, low: 51.94, close: 54.4, volume: 879140 },
  { timestamp: 1784557800000, open: 54.54, high: 57.05, low: 54.07, close: 56.6, volume: 1200140 },
  { timestamp: 1784644200000, open: 56.53, high: 59.4, low: 56.0, close: 58.84, volume: 1518634 },
  { timestamp: 1784730600000, open: 58.6, high: 61.56, low: 57.96, close: 61.0, volume: 1275294 },
  { timestamp: 1784817000000, open: 61.1, high: 61.79, low: 56.99, close: 57.82, volume: 1511948 },
  { timestamp: 1784903400000, open: 57.6, high: 58.19, low: 53.98, close: 54.73, volume: 1187241 },
  { timestamp: 1785162600000, open: 54.72, high: 55.37, low: 51.08, close: 51.59, volume: 959858 },
  { timestamp: 1785249000000, open: 51.33, high: 51.83, low: 48.01, close: 48.48, volume: 1296170 },
  { timestamp: 1785335400000, open: 48.68, high: 49.44, low: 44.74, close: 45.3, volume: 1317724 },
  { timestamp: 1785421800000, open: 45.44, high: 49.75, low: 44.75, close: 49.07, volume: 1294832 },
  { timestamp: 1785508200000, open: 48.76, high: 53.68, low: 47.96, close: 52.81, volume: 991536 },
  { timestamp: 1785767400000, open: 52.76, high: 57.28, low: 51.9, close: 56.55, volume: 1519976 },
  { timestamp: 1785853800000, open: 57.09, high: 60.95, low: 56.41, close: 60.27, volume: 1008446 },
  { timestamp: 1785940200000, open: 60.46, high: 64.67, low: 59.63, close: 64.0, volume: 1506444 },
  { timestamp: 1786026600000, open: 64.0, high: 64.76, low: 59.44, close: 60.34, volume: 1136375 },
  { timestamp: 1786113000000, open: 60.26, high: 60.95, low: 55.9, close: 56.58, volume: 839801 },
  { timestamp: 1786372200000, open: 56.08, high: 56.77, low: 52.33, close: 53.01, volume: 1607653 },
  { timestamp: 1786458600000, open: 52.96, high: 53.7, low: 48.55, close: 49.27, volume: 1168963 },
  { timestamp: 1786545000000, open: 49.74, high: 50.46, low: 44.82, close: 45.6, volume: 1253140 },
  { timestamp: 1786631400000, open: 45.62, high: 51.0, low: 44.72, close: 50.1, volume: 1174410 },
  { timestamp: 1786717800000, open: 50.18, high: 55.52, low: 49.26, close: 54.58, volume: 921898 },
  { timestamp: 1786977000000, open: 54.34, high: 60.01, low: 53.57, close: 59.01, volume: 1599595 },
  { timestamp: 1787063400000, open: 59.26, high: 64.41, low: 58.43, close: 63.49, volume: 1228573 },
  { timestamp: 1787149800000, open: 63.43, high: 69.05, low: 62.37, close: 68.0, volume: 915273 },
  { timestamp: 1787236200000, open: 68.58, high: 69.73, low: 61.37, close: 62.37, volume: 1255289 },
  { timestamp: 1787322600000, open: 61.97, high: 62.97, low: 55.78, close: 56.65, volume: 1384589 },
  { timestamp: 1787581800000, open: 57.07, high: 58.14, low: 49.9, close: 50.98, volume: 1608122 },
  { timestamp: 1787668200000, open: 50.14, high: 50.91, low: 44.27, close: 45.2, volume: 892716 },
  { timestamp: 1787754600000, open: 45.36, high: 46.63, low: 44.98, close: 46.42, volume: 1339203 },
  { timestamp: 1787841000000, open: 46.32, high: 48.11, low: 45.9, close: 47.72, volume: 1044775 },
  { timestamp: 1787927400000, open: 47.89, high: 49.37, low: 47.53, close: 49.0, volume: 1349774 },
];

const RESISTANCE_EXAMPLE_CANDLES: Candle[] = [
  { timestamp: 1784212200000, open: 60.36, high: 60.88, low: 57.22, close: 57.75, volume: 1631995 },
  { timestamp: 1784298600000, open: 57.5, high: 58.12, low: 55.07, close: 55.57, volume: 855657 },
  { timestamp: 1784557800000, open: 55.77, high: 56.2, low: 52.87, close: 53.41, volume: 1408789 },
  { timestamp: 1784644200000, open: 53.37, high: 53.82, low: 50.71, close: 51.24, volume: 1045242 },
  { timestamp: 1784730600000, open: 51.36, high: 51.76, low: 48.51, close: 49.0, volume: 970729 },
  { timestamp: 1784817000000, open: 48.71, high: 52.93, low: 48.16, close: 52.14, volume: 1499644 },
  { timestamp: 1784903400000, open: 52.18, high: 56.04, low: 51.55, close: 55.31, volume: 1270553 },
  { timestamp: 1785162600000, open: 55.54, high: 58.89, low: 54.87, close: 58.38, volume: 1266823 },
  { timestamp: 1785249000000, open: 58.73, high: 62.02, low: 58.11, close: 61.53, volume: 1461996 },
  { timestamp: 1785335400000, open: 61.8, high: 65.34, low: 61.01, close: 64.7, volume: 1491228 },
  { timestamp: 1785421800000, open: 64.33, high: 65.15, low: 60.36, close: 61.03, volume: 1159574 },
  { timestamp: 1785508200000, open: 60.95, high: 61.67, low: 56.67, close: 57.28, volume: 1589962 },
  { timestamp: 1785767400000, open: 57.06, high: 57.73, low: 52.83, close: 53.48, volume: 1608259 },
  { timestamp: 1785853800000, open: 53.48, high: 54.31, low: 48.95, close: 49.68, volume: 1581543 },
  { timestamp: 1785940200000, open: 49.64, high: 50.3, low: 45.29, close: 46.0, volume: 955407 },
  { timestamp: 1786026600000, open: 45.55, high: 50.79, low: 44.68, close: 49.91, volume: 1477025 },
  { timestamp: 1786113000000, open: 50.27, high: 54.53, low: 49.66, close: 53.75, volume: 1266902 },
  { timestamp: 1786372200000, open: 54.28, high: 58.42, low: 53.56, close: 57.63, volume: 1423811 },
  { timestamp: 1786458600000, open: 57.52, high: 62.28, low: 56.64, close: 61.42, volume: 821063 },
  { timestamp: 1786545000000, open: 61.62, high: 66.21, low: 60.91, close: 65.3, volume: 897827 },
  { timestamp: 1786631400000, open: 64.85, high: 65.68, low: 60.05, close: 60.89, volume: 1006699 },
  { timestamp: 1786717800000, open: 60.94, high: 61.7, low: 55.43, close: 56.38, volume: 1380045 },
  { timestamp: 1786977000000, open: 56.46, high: 57.35, low: 51.09, close: 51.87, volume: 1277249 },
  { timestamp: 1787063400000, open: 51.6, high: 52.33, low: 46.57, close: 47.38, volume: 934816 },
  { timestamp: 1787149800000, open: 46.86, high: 47.53, low: 42.15, close: 43.0, volume: 1201287 },
  { timestamp: 1787236200000, open: 42.46, high: 49.58, low: 41.35, close: 48.49, volume: 1203568 },
  { timestamp: 1787322600000, open: 48.85, high: 54.68, low: 47.9, close: 53.85, volume: 902463 },
  { timestamp: 1787581800000, open: 53.86, high: 60.27, low: 52.77, close: 59.33, volume: 1196720 },
  { timestamp: 1787668200000, open: 58.99, high: 65.81, low: 58.0, close: 64.8, volume: 897517 },
  { timestamp: 1787754600000, open: 64.64, high: 64.98, low: 63.06, close: 63.58, volume: 1645725 },
  { timestamp: 1787841000000, open: 63.69, high: 64.1, low: 61.92, close: 62.19, volume: 871805 },
  { timestamp: 1787927400000, open: 62.05, high: 62.25, low: 60.76, close: 61.0, volume: 1160146 },
];

const ROLE_REVERSAL_EXAMPLE_CANDLES: Candle[] = [
  { timestamp: 1784557800000, open: 49.37, high: 52.55, low: 48.81, close: 51.9, volume: 1633595 },
  { timestamp: 1784644200000, open: 51.81, high: 54.25, low: 51.29, close: 53.77, volume: 1137750 },
  { timestamp: 1784730600000, open: 53.55, high: 56.23, low: 53.16, close: 55.69, volume: 1056932 },
  { timestamp: 1784817000000, open: 55.49, high: 57.94, low: 54.96, close: 57.5, volume: 1160587 },
  { timestamp: 1784903400000, open: 57.59, high: 59.71, low: 57.11, close: 59.4, volume: 1179905 },
  { timestamp: 1785162600000, open: 59.32, high: 59.76, low: 57.05, close: 57.44, volume: 1065202 },
  { timestamp: 1785249000000, open: 57.39, high: 57.78, low: 55.11, close: 55.47, volume: 1342516 },
  { timestamp: 1785335400000, open: 55.5, high: 56.03, low: 52.88, close: 53.49, volume: 1021340 },
  { timestamp: 1785421800000, open: 53.6, high: 54.06, low: 51.08, close: 51.5, volume: 1152470 },
  { timestamp: 1785508200000, open: 51.33, high: 53.42, low: 50.95, close: 53.12, volume: 919784 },
  { timestamp: 1785767400000, open: 53.11, high: 55.1, low: 52.74, close: 54.74, volume: 1501666 },
  { timestamp: 1785853800000, open: 54.97, high: 56.84, low: 54.47, close: 56.42, volume: 1284113 },
  { timestamp: 1785940200000, open: 56.44, high: 58.6, low: 55.86, close: 58.12, volume: 1477096 },
  { timestamp: 1786026600000, open: 58.13, high: 60.05, low: 57.66, close: 59.7, volume: 1454263 },
  { timestamp: 1786113000000, open: 59.83, high: 60.23, low: 57.54, close: 58.05, volume: 1290556 },
  { timestamp: 1786372200000, open: 57.81, high: 58.36, low: 56.01, close: 56.4, volume: 1346419 },
  { timestamp: 1786458600000, open: 56.64, high: 57.17, low: 54.11, close: 54.7, volume: 844877 },
  { timestamp: 1786545000000, open: 54.92, high: 55.51, low: 52.56, close: 53.0, volume: 842023 },
  { timestamp: 1786631400000, open: 53.43, high: 56.67, low: 52.94, close: 55.99, volume: 878791 },
  { timestamp: 1786717800000, open: 56.29, high: 59.61, low: 55.78, close: 59.06, volume: 870535 },
  { timestamp: 1786977000000, open: 58.93, high: 62.68, low: 58.27, close: 61.98, volume: 1297209 },
  { timestamp: 1787063400000, open: 61.96, high: 65.79, low: 61.27, close: 65.03, volume: 996777 },
  { timestamp: 1787149800000, open: 64.75, high: 68.75, low: 64.17, close: 68.0, volume: 1585289 },
  { timestamp: 1787236200000, open: 68.23, high: 68.96, low: 65.35, close: 66.02, volume: 821457 },
  { timestamp: 1787322600000, open: 66.2, high: 66.79, low: 63.61, close: 64.23, volume: 1443630 },
  { timestamp: 1787581800000, open: 64.31, high: 64.69, low: 61.79, close: 62.27, volume: 880753 },
  { timestamp: 1787668200000, open: 62.39, high: 62.78, low: 59.81, close: 60.4, volume: 1366021 },
  { timestamp: 1787754600000, open: 60.69, high: 62.6, low: 60.34, close: 62.31, volume: 1133491 },
  { timestamp: 1787841000000, open: 62.5, high: 64.55, low: 62.03, close: 64.08, volume: 1172469 },
  { timestamp: 1787927400000, open: 64.34, high: 66.42, low: 63.72, close: 66.0, volume: 844924 },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'what-is-a-level',
    prompt: 'What is a support or resistance level, really?',
    choices: [
      'A specific magic price that a stock is mathematically guaranteed to respect',
      'A price area where buying or selling pressure has repeatedly shifted, evidenced by a cluster of swing lows or swing highs sitting near the same price',
      'Any round number, like $50 or $100',
      "The stock's 52-week high or low",
    ],
    correctIndex: 1,
    explanation:
      "There's nothing magic about a support or resistance level — it's not a law of physics. It's evidence: when several swing lows (Module 4's concept) land near the same price, that's a level where buyers have repeatedly stepped in. When several swing highs cluster near the same price, that's a level where sellers have repeatedly capped the advance. The cluster of swing points is the level — not a formula, not a round number.",
  },
  {
    id: 'reading-support-correctly',
    prompt:
      "In the support example, the swing highs climb from $61.79 to $64.76 to $69.73 — the stock is clearly in an uptrend. But three separate swing lows print at $44.74, $44.72, and $44.27, almost the same price each time. What's the correct way to read this chart?",
    choices: [
      "It can't be a support level, because a support level requires the whole chart to be flat, like Module 4's range example",
      "The uptrend and the support level are two separate observations: swing highs making sustained progress describes the trend, while one specific low repeating three times describes support — both can be true of the same chart at once",
      'The swing lows are irrelevant since price is trending up overall',
      "It means the stock is actually in a downtrend, since the lows aren't rising",
    ],
    correctIndex: 1,
    explanation:
      "This is the key distinction to isolate: a support level is not the same claim as \"the chart is a flat range.\" Module 4's range example had swing highs and swing lows both stuck near the same ceiling and floor. Here, the swing highs are climbing — a real uptrend by Module 4's definition — while one specific low keeps getting revisited and defended. The trend describes the overall shape; the repeating low is the support level. Read them separately.",
  },
  {
    id: 'reading-resistance-correctly',
    prompt:
      "The resistance example is the mirror image: swing lows decline from $48.16 to $44.68 to $41.35 (a downtrend), while three swing highs cluster near $65.34, $66.21, and $65.81. What does the resistance level represent here?",
    choices: [
      "Since the stock is trending down, the swing highs must be meaningless noise",
      'A ceiling where sellers have repeatedly stepped in and capped the advance, isolated from the fact that the overall structure is a downtrend',
      'Proof that the stock is actually range-bound rather than trending',
      'The average price of the stock over the period shown',
    ],
    correctIndex: 1,
    explanation:
      "Same logic as the support example, mirrored. The declining swing lows describe a downtrend. Separately, three swing highs landing near the same price — repeated failed attempts to push higher — describe a resistance level at that price. The overall trend and the isolated level are two different pieces of information read from the same chart.",
  },
  {
    id: 'role-reversal',
    prompt:
      "In the role reversal example, price is rejected twice near $60 ($59.76, then $60.23), then breaks out to a swing high of $68.96, pulls back, and finds a swing low at $59.81 — almost exactly the old resistance price. What does this illustrate, and how sure can you be it repeats?",
    choices: [
      'A guarantee: once resistance breaks, it will always hold as support on the first retest',
      'A documented tendency worth watching — old resistance frequently becomes new support after a breakout, as in this example, but a broken level does not always hold on retest',
      "Nothing — the $59.81 low landing near $60 is just a coincidence with no broader pattern behind it",
      'Proof that support and resistance levels never actually change once set'
    ],
    correctIndex: 1,
    explanation:
      "This is the single most important teaching moment in this module, and it needs a careful hedge. Two rejections near $60 built a resistance level. Once price finally broke above it and pulled back, the retest landed almost exactly at the old ceiling — and held, becoming a new floor. That flip (old resistance to new support, and the same in reverse) is a real, frequently observed tendency. But it is a tendency, not a rule — plenty of broken levels get revisited and simply fail again. Treat a role-reversal retest as something worth watching closely, not something you can assume will hold.",
  },
  {
    id: 'more-touches-nuance',
    prompt:
      'A level has been touched and defended five separate times. A different level nearby has never been tested at all. What is the fair way to compare their significance?',
    choices: [
      'They are equally significant, since a level either exists at a price or it does not',
      'The untested level is more significant, because it has a "cleaner" price with no history at all',
      'The five-touch level generally draws more trader attention and has more of a track record behind it — more eyes on a well-tested level, not a mechanical law that guarantees it will hold again',
      'Touch count is irrelevant to how traders actually watch a chart',
    ],
    correctIndex: 2,
    explanation:
      "More touches means more trading history at that price — more traders who have watched it hold (or fail) before, and more attention likely to be paid to it next time. That's a real, useful observation. But it isn't a mechanical law: a well-tested level can still break, and an untested level can still hold the very first time it's approached. Touch count is evidence about attention and track record, not a formula that predicts the outcome.",
  },
];

/**
 * Education · Module 6. Builds on Module 4's swing highs/swing lows and Module 2/5's
 * general framing to cover support and resistance: a level is nothing more than a
 * cluster of swing lows (support) or swing highs (resistance) sitting at roughly the
 * same price, isolated from the chart's overall trend or range shape. Uses
 * CandlestickChart's static-candle path with `priceLines` (added for this module) to
 * mark each level directly on the chart.
 */
export function Module6SupportAndResistance() {
  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 6</p>
      <h1>Support &amp; Resistance</h1>
      <p className="module-intro">
        Module 4 introduced swing highs and swing lows — the local peaks and troughs that
        define a trend. This module reuses that exact same concept for a new purpose. A{' '}
        <strong>support</strong> or <strong>resistance</strong> level isn't a new idea to
        learn from scratch — it's a cluster of swing lows (support) or swing highs
        (resistance) sitting at roughly the same price, repeated enough times to matter.
      </p>

      <section>
        <h2>Support</h2>
        <p>
          In the chart below, the stock is in a clear uptrend by Module 4's definition —
          swing highs climb from about <strong>$61.79</strong>, to <strong>$64.76</strong>,
          to <strong>$69.73</strong>. But look at the swing lows instead: they print at{' '}
          <strong>$44.74</strong>, then <strong>$44.72</strong>, then{' '}
          <strong>$44.27</strong> — nearly the same price, three separate times.
        </p>
        <p>
          This is <strong>not</strong> a flat range like Module 4's range example, where
          both the highs and the lows were stuck near the same ceiling and floor. Here the
          highs are making real progress upward. The point is narrower than that: one
          specific low keeps getting revisited and defended, regardless of what the rest of
          the chart's shape is doing. That repeating low is the support level.
        </p>
        <CandlestickChart
          symbol="Example: Support"
          timeframe="1d"
          candles={SUPPORT_EXAMPLE_CANDLES}
          sourceType="simulated"
          priceLines={[{ price: 45, label: 'Support ~$45', color: '#16a34a' }]}
        />
      </section>

      <section>
        <h2>Resistance</h2>
        <p>
          Resistance is the mirror image. In the chart below, the stock is in a downtrend —
          swing lows decline from about <strong>$48.16</strong>, to{' '}
          <strong>$44.68</strong>, to <strong>$41.35</strong>. At the same time, three swing
          highs cluster near <strong>$65.34</strong>, <strong>$66.21</strong>, and{' '}
          <strong>$65.81</strong> — repeated failed attempts to push above roughly the same
          price.
        </p>
        <p>
          Same isolation logic as the support example: the declining lows describe the
          overall downtrend, while the clustered highs describe a separate thing, a ceiling
          that keeps capping the advance. Read the level independently of the trend shape
          around it.
        </p>
        <CandlestickChart
          symbol="Example: Resistance"
          timeframe="1d"
          candles={RESISTANCE_EXAMPLE_CANDLES}
          sourceType="simulated"
          priceLines={[{ price: 65.5, label: 'Resistance ~$65.5', color: '#dc2626' }]}
        />
      </section>

      <VideoEmbed
        youtubeId="nuVv0ZWUfs4"
        title="Support and Resistance For Beginners (The Ultimate Guide) — Rayner Teo"
        caption="Rayner Teo: Support and Resistance For Beginners (The Ultimate Guide)"
      />

      <section>
        <h2>When a level flips: role reversal</h2>
        <p>
          Here's the story behind the chart below. Price is rejected near <strong>$60</strong>{' '}
          twice — first at a swing high of <strong>$59.76</strong>, then again at{' '}
          <strong>$60.23</strong>. Twice, buyers push up to roughly the same price and fail
          to break through. That's a resistance level being built in real time.
        </p>
        <p>
          Then price finally breaks out, running to a swing high of{' '}
          <strong>$68.96</strong> — well clear of the old ceiling. It pulls back, and that
          pullback's swing low lands at <strong>$59.81</strong> — almost exactly the same
          price that rejected price twice before. Only this time, instead of failing, it
          holds. The old ceiling caught the pullback like a floor.
        </p>
        <p>
          This is <strong>the single most important teaching moment in this module</strong>:
          a broken resistance level frequently flips and becomes support on the retest — the
          old ceiling becomes the new floor. It's worth watching for. But it needs a clear
          hedge: this is a documented tendency, not a rule. A broken level doesn't always
          hold on retest — plenty of retests simply fail, and price falls straight back
          through. Treat a role-reversal retest as a place to pay close attention, not a
          guaranteed bounce.
        </p>
        <CandlestickChart
          symbol="Example: Role Reversal"
          timeframe="1d"
          candles={ROLE_REVERSAL_EXAMPLE_CANDLES}
          sourceType="simulated"
          priceLines={[
            { price: 60, label: 'Old resistance / new support ~$60', color: '#2563eb' },
          ]}
        />
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
