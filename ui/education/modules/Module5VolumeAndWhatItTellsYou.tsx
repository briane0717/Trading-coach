import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import type { Candle } from '../../../normalized';

const CONFIRMED_UPTREND_CANDLES: Candle[] = [
  { timestamp: 1784644200000, open: 49.56, high: 52.54, low: 49.07, close: 51.98, volume: 1017522 },
  { timestamp: 1784730600000, open: 52.01, high: 54.3, low: 51.67, close: 53.96, volume: 1082066 },
  { timestamp: 1784817000000, open: 53.78, high: 56.58, low: 53.28, close: 56.02, volume: 975937 },
  { timestamp: 1784903400000, open: 55.91, high: 58.47, low: 55.43, close: 57.95, volume: 1121824 },
  { timestamp: 1785162600000, open: 57.83, high: 60.61, low: 57.24, close: 60.0, volume: 1002522 },
  { timestamp: 1785249000000, open: 59.85, high: 62.54, low: 59.32, close: 62.0, volume: 1079153 },
  { timestamp: 1785335400000, open: 62.18, high: 62.72, low: 60.04, close: 60.43, volume: 539783 },
  { timestamp: 1785421800000, open: 60.64, high: 60.96, low: 58.58, close: 59.0, volume: 536774 },
  { timestamp: 1785508200000, open: 59.12, high: 59.46, low: 56.99, close: 57.43, volume: 621887 },
  { timestamp: 1785767400000, open: 57.23, high: 57.66, low: 55.54, close: 56.0, volume: 574745 },
  { timestamp: 1785853800000, open: 56.05, high: 59.1, low: 55.57, close: 58.44, volume: 1445555 },
  { timestamp: 1785940200000, open: 58.59, high: 61.52, low: 58.02, close: 60.94, volume: 1554715 },
  { timestamp: 1786026600000, open: 60.91, high: 64.19, low: 60.18, close: 63.49, volume: 1637137 },
  { timestamp: 1786113000000, open: 63.47, high: 66.7, low: 63.03, close: 66.04, volume: 1408335 },
  { timestamp: 1786372200000, open: 66.19, high: 69.06, low: 65.46, close: 68.45, volume: 1546420 },
  { timestamp: 1786458600000, open: 68.7, high: 71.49, low: 68.17, close: 71.0, volume: 1481772 },
  { timestamp: 1786545000000, open: 71.09, high: 71.41, low: 68.78, close: 69.27, volume: 659704 },
  { timestamp: 1786631400000, open: 69.1, high: 69.42, low: 67.28, close: 67.58, volume: 699949 },
  { timestamp: 1786717800000, open: 67.72, high: 68.1, low: 65.34, close: 65.76, volume: 580957 },
  { timestamp: 1786977000000, open: 65.71, high: 66.31, low: 63.68, close: 64.0, volume: 662888 },
  { timestamp: 1787063400000, open: 63.96, high: 67.39, low: 63.2, close: 66.74, volume: 2037413 },
  { timestamp: 1787149800000, open: 66.98, high: 69.96, low: 66.5, close: 69.26, volume: 2133613 },
  { timestamp: 1787236200000, open: 69.19, high: 72.66, low: 68.39, close: 72.06, volume: 2198762 },
  { timestamp: 1787322600000, open: 72.41, high: 75.07, low: 71.96, close: 74.63, volume: 1909348 },
  { timestamp: 1787581800000, open: 74.42, high: 77.85, low: 73.75, close: 77.28, volume: 1935044 },
  { timestamp: 1787668200000, open: 77.35, high: 80.55, low: 76.91, close: 80.0, volume: 2014764 },
  { timestamp: 1787754600000, open: 79.96, high: 80.4, low: 77.95, close: 78.46, volume: 608772 },
  { timestamp: 1787841000000, open: 78.65, high: 79.23, low: 76.56, close: 77.06, volume: 652416 },
  { timestamp: 1787927400000, open: 77.12, high: 77.69, low: 75.19, close: 75.5, volume: 662485 },
];

const UNCONFIRMED_UPTREND_CANDLES: Candle[] = [
  { timestamp: 1784644200000, open: 49.56, high: 52.54, low: 49.07, close: 51.98, volume: 968627 },
  { timestamp: 1784730600000, open: 52.01, high: 54.3, low: 51.67, close: 53.96, volume: 1061525 },
  { timestamp: 1784817000000, open: 53.78, high: 56.58, low: 53.28, close: 56.02, volume: 1064421 },
  { timestamp: 1784903400000, open: 55.91, high: 58.47, low: 55.43, close: 57.95, volume: 1008545 },
  { timestamp: 1785162600000, open: 57.83, high: 60.61, low: 57.24, close: 60.0, volume: 1001794 },
  { timestamp: 1785249000000, open: 59.85, high: 62.54, low: 59.32, close: 62.0, volume: 980172 },
  { timestamp: 1785335400000, open: 62.18, high: 62.72, low: 60.04, close: 60.43, volume: 831216 },
  { timestamp: 1785421800000, open: 60.64, high: 60.96, low: 58.58, close: 59.0, volume: 817974 },
  { timestamp: 1785508200000, open: 59.12, high: 59.46, low: 56.99, close: 57.43, volume: 805686 },
  { timestamp: 1785767400000, open: 57.23, high: 57.66, low: 55.54, close: 56.0, volume: 884136 },
  { timestamp: 1785853800000, open: 56.05, high: 59.1, low: 55.57, close: 58.44, volume: 854365 },
  { timestamp: 1785940200000, open: 58.59, high: 61.52, low: 58.02, close: 60.94, volume: 826073 },
  { timestamp: 1786026600000, open: 60.91, high: 64.19, low: 60.18, close: 63.49, volume: 853782 },
  { timestamp: 1786113000000, open: 63.47, high: 66.7, low: 63.03, close: 66.04, volume: 822913 },
  { timestamp: 1786372200000, open: 66.19, high: 69.06, low: 65.46, close: 68.45, volume: 949811 },
  { timestamp: 1786458600000, open: 68.7, high: 71.49, low: 68.17, close: 71.0, volume: 946593 },
  { timestamp: 1786545000000, open: 71.09, high: 71.41, low: 68.78, close: 69.27, volume: 788306 },
  { timestamp: 1786631400000, open: 69.1, high: 69.42, low: 67.28, close: 67.58, volume: 865241 },
  { timestamp: 1786717800000, open: 67.72, high: 68.1, low: 65.34, close: 65.76, volume: 846525 },
  { timestamp: 1786977000000, open: 65.71, high: 66.31, low: 63.68, close: 64.0, volume: 800525 },
  { timestamp: 1787063400000, open: 63.96, high: 67.39, low: 63.2, close: 66.74, volume: 696805 },
  { timestamp: 1787149800000, open: 66.98, high: 69.96, low: 66.5, close: 69.26, volume: 807701 },
  { timestamp: 1787236200000, open: 69.19, high: 72.66, low: 68.39, close: 72.06, volume: 771004 },
  { timestamp: 1787322600000, open: 72.41, high: 75.07, low: 71.96, close: 74.63, volume: 714590 },
  { timestamp: 1787581800000, open: 74.42, high: 77.85, low: 73.75, close: 77.28, volume: 829262 },
  { timestamp: 1787668200000, open: 77.35, high: 80.55, low: 76.91, close: 80.0, volume: 734856 },
  { timestamp: 1787754600000, open: 79.96, high: 80.4, low: 77.95, close: 78.46, volume: 724371 },
  { timestamp: 1787841000000, open: 78.65, high: 79.23, low: 76.56, close: 77.06, volume: 759201 },
  { timestamp: 1787927400000, open: 77.12, high: 77.69, low: 75.19, close: 75.5, volume: 800381 },
];

const CONFIRMED_DOWNTREND_CANDLES: Candle[] = [
  { timestamp: 1784644200000, open: 80.49, high: 80.94, low: 77.62, close: 78.08, volume: 935349 },
  { timestamp: 1784730600000, open: 77.98, high: 78.43, low: 75.37, close: 76.05, volume: 996817 },
  { timestamp: 1784817000000, open: 75.85, high: 76.17, low: 73.37, close: 74.07, volume: 984314 },
  { timestamp: 1784903400000, open: 74.09, high: 74.5, low: 71.49, close: 72.06, volume: 1135012 },
  { timestamp: 1785162600000, open: 71.76, high: 72.28, low: 69.29, close: 69.98, volume: 1149791 },
  { timestamp: 1785249000000, open: 70.2, high: 70.83, low: 67.53, close: 68.0, volume: 1016240 },
  { timestamp: 1785335400000, open: 67.94, high: 69.76, low: 67.39, close: 69.44, volume: 525472 },
  { timestamp: 1785421800000, open: 69.45, high: 71.59, low: 69.05, close: 71.02, volume: 604338 },
  { timestamp: 1785508200000, open: 70.91, high: 73.01, low: 70.26, close: 72.43, volume: 629177 },
  { timestamp: 1785767400000, open: 72.59, high: 74.57, low: 72.02, close: 74.0, volume: 549772 },
  { timestamp: 1785853800000, open: 74.18, high: 74.73, low: 70.79, close: 71.45, volume: 1372418 },
  { timestamp: 1785940200000, open: 71.34, high: 71.75, low: 68.53, close: 68.94, volume: 1540300 },
  { timestamp: 1786026600000, open: 68.78, high: 69.26, low: 65.83, close: 66.47, volume: 1334296 },
  { timestamp: 1786113000000, open: 66.82, high: 67.46, low: 63.11, close: 63.92, volume: 1595245 },
  { timestamp: 1786372200000, open: 64.29, high: 65.09, low: 60.82, close: 61.41, volume: 1301510 },
  { timestamp: 1786458600000, open: 61.21, high: 61.65, low: 58.57, close: 59.0, volume: 1352730 },
  { timestamp: 1786545000000, open: 58.85, high: 61.2, low: 58.25, close: 60.69, volume: 655576 },
  { timestamp: 1786631400000, open: 60.88, high: 62.91, low: 60.38, close: 62.48, volume: 602542 },
  { timestamp: 1786717800000, open: 62.63, high: 64.48, low: 62.14, close: 64.18, volume: 562215 },
  { timestamp: 1786977000000, open: 64.41, high: 66.55, low: 63.87, close: 66.0, volume: 670451 },
  { timestamp: 1787063400000, open: 65.98, high: 66.48, low: 62.64, close: 63.35, volume: 1945713 },
  { timestamp: 1787149800000, open: 63.21, high: 63.92, low: 59.85, close: 60.61, volume: 2034465 },
  { timestamp: 1787236200000, open: 60.53, high: 61.08, low: 57.23, close: 57.96, volume: 1955450 },
  { timestamp: 1787322600000, open: 58.14, high: 58.65, low: 54.81, close: 55.31, volume: 2059479 },
  { timestamp: 1787581800000, open: 55.03, high: 55.69, low: 52.01, close: 52.65, volume: 2024406 },
  { timestamp: 1787668200000, open: 52.36, high: 52.99, low: 49.34, close: 50.0, volume: 2238805 },
  { timestamp: 1787754600000, open: 50.07, high: 51.89, low: 49.67, close: 51.54, volume: 630140 },
  { timestamp: 1787841000000, open: 51.37, high: 53.35, low: 50.82, close: 53.06, volume: 610627 },
  { timestamp: 1787927400000, open: 53.12, high: 54.89, low: 52.62, close: 54.5, volume: 645375 },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'confirming-volume-meaning',
    prompt: "When a trader says volume \"confirms\" a price move, what do they actually mean?",
    choices: [
      'Volume crossing some specific number of shares proves the move is real',
      "Volume moving in the same direction as price is already moving — rising on a rally, rising on a decline — agrees with what price is doing",
      "The stock's average daily volume over the past year",
      'Volume being higher than it was the day before, regardless of which way price moved',
    ],
    correctIndex: 1,
    explanation:
      "Confirmation isn't about hitting some magic volume threshold — there's no specific share count that flips a move from \"unconfirmed\" to \"confirmed.\" It's a comparison: does volume agree with the direction price is already moving? Rising volume on a rally, or rising volume on a decline, means participation is moving the same way as price.",
  },
  {
    id: 'unconfirmed-uptrend-reading',
    prompt:
      "In the \"Same price, unconfirmed\" example, the swing highs and swing lows form the exact same uptrend structure as the confirmed example — but each rally's volume is smaller than the one before it. What does that shrinking volume suggest?",
    choices: [
      "Nothing — if the price structure says uptrend, the volume is irrelevant",
      "It's a guarantee the stock is about to reverse and start falling",
      'A caution flag: participation is fading even as price keeps making new highs — something worth weighing alongside the price structure, not a prediction of what happens next',
      "It means the data must be wrong, since price and volume always move together",
    ],
    correctIndex: 2,
    explanation:
      "Shrinking rally volume isn't a guarantee of a reversal — plenty of uptrends keep climbing on fading volume for a while, or never reverse at all. What it is, is a caution flag: fewer shares are changing hands on each push to a new high than the price chart alone would suggest. It's one more piece of evidence to weigh, not a directive telling you what happens next.",
  },
  {
    id: 'confirmed-downtrend-reading',
    prompt:
      "In the confirmed downtrend example, each decline leg trades on higher volume than the one before it, while each bounce in between stays weak. What does that tell you?",
    choices: [
      'That the stock is about to bottom and reverse upward',
      "That real selling pressure is behind the move down — participation increasing on the way down and fading on the bounces, the mirror image of what a confirmed uptrend looks like on the upside",
      'That the downtrend is fake, because volume should never rise during a decline',
      "Nothing — downtrends don't need volume confirmation the way uptrends do",
    ],
    correctIndex: 1,
    explanation:
      "This is the mirror image of a confirmed uptrend. Rising volume on each leg down means more shares are trading hands as price falls — real selling pressure, not just drift. Weak volume on the bounces means those relief rallies aren't attracting much participation either. Together, that combination is what a \"confirmed\" downtrend looks like.",
  },
  {
    id: 'volume-has-no-direction',
    prompt: 'Does high volume, by itself, tell you whether a move is bullish or bearish?',
    choices: [
      'Yes — high volume is always bullish',
      'Yes — high volume is always bearish',
      "No — volume has no direction of its own; it's the price direction on that volume that gives it meaning. High volume on an up day is bullish confirmation, high volume on a down day is bearish confirmation",
      'No — volume only matters on weekly charts, not daily ones',
    ],
    correctIndex: 2,
    explanation:
      "Volume is just a count of shares traded — it doesn't carry a bullish or bearish label on its own. What gives it meaning is what price did on that volume. The exact same high-volume reading confirms a rally if price closed higher, or confirms a decline if price closed lower. Always read volume together with the price direction it accompanied, never in isolation.",
  },
  {
    id: 'candle-size-vs-volume',
    prompt: "A candle has an unusually large range — a big gap between its high and low. Does that automatically mean it happened on high volume?",
    choices: [
      'Yes, candle size and volume always move together',
      "No — a large-range candle can happen on relatively low volume, and a small-range candle can happen on high volume. Candle size and volume are two separate pieces of information",
      "No, because volume only affects a candle's color, not its size",
      'Yes, but only on daily timeframes',
    ],
    correctIndex: 1,
    explanation:
      "Candle range (how far price traveled during the period) and volume (how many shares traded during it) measure two different things. A stock can swing wildly on thin trading — a large range on relatively low volume — or trade in a tight range with heavy participation — a small range on high volume. Don't assume one from the other; check both separately.",
  },
];

/**
 * Education · Module 5. Builds on Module 2 (volume as a number in a quote) and Module 4
 * (price structure alone defining a trend) to cover reading volume alongside price: whether
 * a move has rising or fading participation behind it. Uses CandlestickChart's static-candle
 * path with showVolume on all three examples, since this module is specifically about the
 * volume pane. The confirmed/unconfirmed uptrend pair shares identical OHLC by design, so
 * only volume differs between them.
 */
export function Module5VolumeAndWhatItTellsYou() {
  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 5</p>
      <h1>Volume &amp; What It Tells You</h1>
      <p className="module-intro">
        Module 2 introduced volume as one number sitting in a quote — how many shares had
        traded so far. Module 4 covered how a sequence of candles' price action alone defines
        a trend: higher highs and higher lows for an uptrend, lower highs and lower lows for a
        downtrend. This module connects the two. Every candle carries its own volume, not just
        a running daily total, and reading that volume alongside price tells you something
        price structure alone can't: whether a move has real participation behind it, or is
        drifting on thin trading.
      </p>

      <section>
        <h2>Confirming vs. contradicting</h2>
        <p>
          Volume <strong>confirms</strong> a price move when it agrees with the direction that
          move is already going in: rising volume on a rally, rising volume on a decline.
          Volume <strong>doesn't confirm</strong> — or contradicts — a move when it fades in
          the opposite direction: a rally on shrinking volume, a decline on shrinking volume.
        </p>
        <p>
          That's the whole idea. There's no fixed number of shares that flips a move from
          unconfirmed to confirmed — it's a comparison between what price is doing and what
          volume is doing alongside it.
        </p>
        <p>
          It's worth being precise about what confirmation is and isn't. Confirming (or
          non-confirming) volume is a <strong>caution flag to weigh</strong>, not a predictor
          of what happens next. An uptrend on fading volume doesn't guarantee a reversal — it
          can keep climbing for a long time before anything changes, or never reverse at all.
          What volume confirmation gives you is one more piece of evidence about how much
          participation is actually behind a move, to weigh alongside the price structure —
          not a signal that tells you what to do.
        </p>
      </section>

      <VideoEmbed
        youtubeId="n4FGIDdhZgA"
        title="3 Steps to Master Volume Trading - The Complete Beginner's Guide — Urban Forex"
        caption="Urban Forex: 3 Steps to Master Volume Trading — The Complete Beginner's Guide"
      />

      <section>
        <h2>A confirmed uptrend</h2>
        <p>
          Below is the same stock from Module 4's uptrend example, this time with volume
          showing beneath the candles. Each of the three rallies climbs on progressively
          higher average volume — roughly <strong>1.0 million</strong> shares on the first
          rally, <strong>1.5 million</strong> on the second, and <strong>2.0 million</strong>{' '}
          on the third. Each pullback in between drops to well under half that, roughly{' '}
          <strong>550,000 to 650,000</strong> shares. Rising participation on the way up,
          fading participation on the pullbacks — that combination is what a confirmed uptrend
          looks like.
        </p>
        <CandlestickChart
          symbol="Example: Confirmed Uptrend"
          timeframe="1d"
          candles={CONFIRMED_UPTREND_CANDLES}
          sourceType="simulated"
          showVolume
        />
      </section>

      <section>
        <h2>Same price, unconfirmed</h2>
        <p>
          The chart below has the exact same open, high, low, and close prices as the
          confirmed uptrend above — same swing highs, same swing lows, same
          higher-highs/higher-lows structure that Module 4 defines as an uptrend. Only the
          volume is different.
        </p>
        <p>
          Here, each rally's volume shrinks instead of growing: roughly{' '}
          <strong>1.0 million</strong> shares on the first rally, dropping to about{' '}
          <strong>880,000</strong> on the second, and about <strong>760,000</strong> on the
          third — even as price keeps making new highs. By Module 4's price-structure
          definition alone, this is just as much an uptrend as the chart above. But the volume
          behind it tells a different story: fewer shares changing hands on each push higher —
          a caution flag about weakening participation that price structure by itself would
          never show you.
        </p>
        <CandlestickChart
          symbol="Example: Same Price, Unconfirmed"
          timeframe="1d"
          candles={UNCONFIRMED_UPTREND_CANDLES}
          sourceType="simulated"
          showVolume
        />
      </section>

      <section>
        <h2>A confirmed downtrend</h2>
        <p>
          Volume confirmation works the same way on the downside. In the example below, each
          leg of the decline trades on higher average volume than the one before it — roughly{' '}
          <strong>1.0 million</strong> shares on the first leg, <strong>1.4 million</strong>{' '}
          on the second, and <strong>2.0 million</strong> on the third — while each bounce in
          between stays weak, roughly <strong>550,000 to 650,000</strong> shares. Rising
          participation on the way down, fading participation on the bounces: the mirror image
          of the confirmed uptrend above, and a sign of real selling pressure behind the move
          rather than a drift lower on thin trading.
        </p>
        <CandlestickChart
          symbol="Example: Confirmed Downtrend"
          timeframe="1d"
          candles={CONFIRMED_DOWNTREND_CANDLES}
          sourceType="simulated"
          showVolume
        />
      </section>

      <VideoEmbed
        youtubeId="jyspZ_5Ly-4"
        title="A Guide To Volume Price Analysis (VPA) | Beginner Friendly — TC Trading"
        caption="TC Trading: A Guide To Volume Price Analysis (VPA) — Beginner Friendly"
      />

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
