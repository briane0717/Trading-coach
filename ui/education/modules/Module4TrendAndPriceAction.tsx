import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import type { Candle } from '../../../normalized';

const UPTREND_EXAMPLE_CANDLES: Candle[] = [
  { timestamp: 1784644200000, open: 49.56, high: 52.54, low: 49.07, close: 51.98, volume: 1243601 },
  { timestamp: 1784730600000, open: 52.01, high: 54.3, low: 51.67, close: 53.96, volume: 1219248 },
  { timestamp: 1784817000000, open: 53.78, high: 56.58, low: 53.28, close: 56.02, volume: 1029794 },
  { timestamp: 1784903400000, open: 55.91, high: 58.47, low: 55.43, close: 57.95, volume: 1448557 },
  { timestamp: 1785162600000, open: 57.83, high: 60.61, low: 57.24, close: 60.0, volume: 1007487 },
  { timestamp: 1785249000000, open: 59.85, high: 62.54, low: 59.32, close: 62.0, volume: 1061447 },
  { timestamp: 1785335400000, open: 62.18, high: 62.72, low: 60.04, close: 60.43, volume: 1080499 },
  { timestamp: 1785421800000, open: 60.64, high: 60.96, low: 58.58, close: 59.0, volume: 959716 },
  { timestamp: 1785508200000, open: 59.12, high: 59.46, low: 56.99, close: 57.43, volume: 1616789 },
  { timestamp: 1785767400000, open: 57.23, high: 57.66, low: 55.54, close: 56.0, volume: 910784 },
  { timestamp: 1785853800000, open: 56.05, high: 59.1, low: 55.57, close: 58.44, volume: 1083350 },
  { timestamp: 1785940200000, open: 58.59, high: 61.52, low: 58.02, close: 60.94, volume: 1584444 },
  { timestamp: 1786026600000, open: 60.91, high: 64.19, low: 60.18, close: 63.49, volume: 1221675 },
  { timestamp: 1786113000000, open: 63.47, high: 66.7, low: 63.03, close: 66.04, volume: 1376597 },
  { timestamp: 1786372200000, open: 66.19, high: 69.06, low: 65.46, close: 68.45, volume: 1537549 },
  { timestamp: 1786458600000, open: 68.7, high: 71.49, low: 68.17, close: 71.0, volume: 1554515 },
  { timestamp: 1786545000000, open: 71.09, high: 71.41, low: 68.78, close: 69.27, volume: 1384793 },
  { timestamp: 1786631400000, open: 69.1, high: 69.42, low: 67.28, close: 67.58, volume: 914200 },
  { timestamp: 1786717800000, open: 67.72, high: 68.1, low: 65.34, close: 65.76, volume: 1474227 },
  { timestamp: 1786977000000, open: 65.71, high: 66.31, low: 63.68, close: 64.0, volume: 1333041 },
  { timestamp: 1787063400000, open: 63.96, high: 67.39, low: 63.2, close: 66.74, volume: 1029157 },
  { timestamp: 1787149800000, open: 66.98, high: 69.96, low: 66.5, close: 69.26, volume: 1262120 },
  { timestamp: 1787236200000, open: 69.19, high: 72.66, low: 68.39, close: 72.06, volume: 1577308 },
  { timestamp: 1787322600000, open: 72.41, high: 75.07, low: 71.96, close: 74.63, volume: 1463003 },
  { timestamp: 1787581800000, open: 74.42, high: 77.85, low: 73.75, close: 77.28, volume: 1436989 },
  { timestamp: 1787668200000, open: 77.35, high: 80.55, low: 76.91, close: 80.0, volume: 1047218 },
  { timestamp: 1787754600000, open: 79.96, high: 80.4, low: 77.95, close: 78.46, volume: 1646609 },
  { timestamp: 1787841000000, open: 78.65, high: 79.23, low: 76.56, close: 77.06, volume: 1212146 },
  { timestamp: 1787927400000, open: 77.12, high: 77.69, low: 75.19, close: 75.5, volume: 1226964 },
];

const DOWNTREND_EXAMPLE_CANDLES: Candle[] = [
  { timestamp: 1784644200000, open: 80.49, high: 80.94, low: 77.62, close: 78.08, volume: 1535515 },
  { timestamp: 1784730600000, open: 77.98, high: 78.43, low: 75.37, close: 76.05, volume: 1042917 },
  { timestamp: 1784817000000, open: 75.85, high: 76.17, low: 73.37, close: 74.07, volume: 979673 },
  { timestamp: 1784903400000, open: 74.09, high: 74.5, low: 71.49, close: 72.06, volume: 1303900 },
  { timestamp: 1785162600000, open: 71.76, high: 72.28, low: 69.29, close: 69.98, volume: 1512655 },
  { timestamp: 1785249000000, open: 70.2, high: 70.83, low: 67.53, close: 68.0, volume: 1007696 },
  { timestamp: 1785335400000, open: 67.94, high: 69.76, low: 67.39, close: 69.44, volume: 1414453 },
  { timestamp: 1785421800000, open: 69.45, high: 71.59, low: 69.05, close: 71.02, volume: 1175264 },
  { timestamp: 1785508200000, open: 70.91, high: 73.01, low: 70.26, close: 72.43, volume: 906995 },
  { timestamp: 1785767400000, open: 72.59, high: 74.57, low: 72.02, close: 74.0, volume: 1571493 },
  { timestamp: 1785853800000, open: 74.18, high: 74.73, low: 70.79, close: 71.45, volume: 1374399 },
  { timestamp: 1785940200000, open: 71.34, high: 71.75, low: 68.53, close: 68.94, volume: 1530281 },
  { timestamp: 1786026600000, open: 68.78, high: 69.26, low: 65.83, close: 66.47, volume: 1632094 },
  { timestamp: 1786113000000, open: 66.82, high: 67.46, low: 63.11, close: 63.92, volume: 912067 },
  { timestamp: 1786372200000, open: 64.29, high: 65.09, low: 60.82, close: 61.41, volume: 1311823 },
  { timestamp: 1786458600000, open: 61.21, high: 61.65, low: 58.57, close: 59.0, volume: 1151747 },
  { timestamp: 1786545000000, open: 58.85, high: 61.2, low: 58.25, close: 60.69, volume: 1242180 },
  { timestamp: 1786631400000, open: 60.88, high: 62.91, low: 60.38, close: 62.48, volume: 864723 },
  { timestamp: 1786717800000, open: 62.63, high: 64.48, low: 62.14, close: 64.18, volume: 1102485 },
  { timestamp: 1786977000000, open: 64.41, high: 66.55, low: 63.87, close: 66.0, volume: 1405055 },
  { timestamp: 1787063400000, open: 65.98, high: 66.48, low: 62.64, close: 63.35, volume: 827989 },
  { timestamp: 1787149800000, open: 63.21, high: 63.92, low: 59.85, close: 60.61, volume: 1265860 },
  { timestamp: 1787236200000, open: 60.53, high: 61.08, low: 57.23, close: 57.96, volume: 1033662 },
  { timestamp: 1787322600000, open: 58.14, high: 58.65, low: 54.81, close: 55.31, volume: 1200141 },
  { timestamp: 1787581800000, open: 55.03, high: 55.69, low: 52.01, close: 52.65, volume: 1380264 },
  { timestamp: 1787668200000, open: 52.36, high: 52.99, low: 49.34, close: 50.0, volume: 904742 },
  { timestamp: 1787754600000, open: 50.07, high: 51.89, low: 49.67, close: 51.54, volume: 1304533 },
  { timestamp: 1787841000000, open: 51.37, high: 53.35, low: 50.82, close: 53.06, volume: 1363849 },
  { timestamp: 1787927400000, open: 53.12, high: 54.89, low: 52.62, close: 54.5, volume: 1027701 },
];

const RANGE_EXAMPLE_CANDLES: Candle[] = [
  { timestamp: 1784903400000, open: 54.88, high: 56.62, low: 54.43, close: 56.24, volume: 1454922 },
  { timestamp: 1785162600000, open: 56.26, high: 57.87, low: 55.88, close: 57.55, volume: 1305176 },
  { timestamp: 1785249000000, open: 57.57, high: 59.25, low: 57.32, close: 58.79, volume: 873810 },
  { timestamp: 1785335400000, open: 58.81, high: 60.29, low: 58.51, close: 60.0, volume: 1194892 },
  { timestamp: 1785421800000, open: 60.17, high: 60.7, low: 57.42, close: 57.96, volume: 955412 },
  { timestamp: 1785508200000, open: 58.12, high: 58.76, low: 55.47, close: 55.97, volume: 1046307 },
  { timestamp: 1785767400000, open: 56.04, high: 56.54, low: 53.46, close: 53.96, volume: 1569883 },
  { timestamp: 1785853800000, open: 54.08, high: 54.55, low: 51.52, close: 52.01, volume: 988623 },
  { timestamp: 1785940200000, open: 52.0, high: 52.59, low: 49.47, close: 50.0, volume: 1603819 },
  { timestamp: 1786026600000, open: 50.22, high: 52.54, low: 49.86, close: 51.99, volume: 1283171 },
  { timestamp: 1786113000000, open: 52.03, high: 54.54, low: 51.47, close: 53.96, volume: 1444340 },
  { timestamp: 1786372200000, open: 53.73, high: 56.47, low: 53.22, close: 56.05, volume: 1006253 },
  { timestamp: 1786458600000, open: 55.8, high: 58.42, low: 55.42, close: 57.98, volume: 1347638 },
  { timestamp: 1786545000000, open: 58.09, high: 60.57, low: 57.48, close: 60.0, volume: 1512374 },
  { timestamp: 1786631400000, open: 59.79, high: 60.33, low: 57.49, close: 58.01, volume: 1004573 },
  { timestamp: 1786717800000, open: 57.8, high: 58.38, low: 55.46, close: 56.06, volume: 858862 },
  { timestamp: 1786977000000, open: 55.88, high: 56.49, low: 53.55, close: 53.99, volume: 935125 },
  { timestamp: 1787063400000, open: 53.98, high: 54.59, low: 51.5, close: 52.06, volume: 844435 },
  { timestamp: 1787149800000, open: 51.85, high: 52.28, low: 49.55, close: 50.0, volume: 999502 },
  { timestamp: 1787236200000, open: 49.89, high: 52.69, low: 49.42, close: 52.25, volume: 1316738 },
  { timestamp: 1787322600000, open: 52.4, high: 54.85, low: 51.9, close: 54.5, volume: 1537084 },
  { timestamp: 1787581800000, open: 54.46, high: 57.06, low: 54.0, close: 56.69, volume: 1259377 },
  { timestamp: 1787668200000, open: 56.78, high: 59.52, low: 56.39, close: 59.0, volume: 905102 },
  { timestamp: 1787754600000, open: 59.2, high: 59.72, low: 57.04, close: 57.62, volume: 1266085 },
  { timestamp: 1787841000000, open: 57.46, high: 57.76, low: 56.04, close: 56.26, volume: 1482715 },
  { timestamp: 1787927400000, open: 56.37, high: 56.69, low: 54.72, close: 55.0, volume: 910197 },
];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'uptrend-definition',
    prompt: 'What actually defines an uptrend?',
    choices: [
      'The price is higher today than it was a week ago',
      'Swing highs keep getting higher AND swing lows keep getting higher',
      'The most recent few candles closed higher than they opened',
      'The price is above where it started, regardless of the path it took to get there',
    ],
    correctIndex: 1,
    explanation:
      "\"Price went up\" isn't enough — a stock can be higher than last week and still be in a downtrend if it just bounced partway back before rolling over again. An uptrend requires structure: each swing high has to exceed the last swing high, AND each swing low has to exceed the last swing low. Both conditions, together, over more than one swing.",
  },
  {
    id: 'swing-low-definition',
    prompt: 'What is a swing low?',
    choices: [
      'The lowest price a stock has ever traded at',
      'A candle whose low is lower than the lows of the candles immediately around it — a local trough',
      'Any candle that closes red (lower than it opened)',
      'The average low price over the last several candles',
    ],
    correctIndex: 1,
    explanation:
      "A swing low is a local trough — a point where price stopped falling and turned back up, so the candles right before and right after it both have higher lows than it does. It's not about the all-time low, and it's not about candle color; a swing low is defined by its neighbors, not by any single candle's own properties.",
  },
  {
    id: 'read-sequence',
    prompt:
      'A stock prints swing highs at $40, then $36, then $31 — each one lower than the last. Its swing lows over the same stretch are $34, then $29, then $24 — also each one lower than the last. What is this?',
    choices: [
      'An uptrend, since the stock is still trading well above zero',
      'A range, since the price keeps moving back and forth',
      'A downtrend — both swing highs and swing lows are making lower, not higher, progress',
      'Not enough information — you would also need the volume at each swing point',
    ],
    correctIndex: 2,
    explanation:
      "This is the mirror image of an uptrend's definition: swing highs getting lower AND swing lows getting lower, both conditions holding across multiple swings. That structure is what a downtrend is — not a single big drop, but a repeating pattern of lower highs and lower lows.",
  },
  {
    id: 'range-is-not-nothing',
    prompt: "A stock has been bouncing between roughly $50 and $60 for weeks, going nowhere net. What's the best description of this?",
    choices: [
      'The stock isn\'t moving — it\'s essentially flat',
      "It's a range: plenty of movement each way, but no swing high or swing low is making sustained progress beyond the last one",
      'It must be a very slow uptrend, since it keeps bouncing off $50 and climbing back',
      'It\'s impossible to say anything without a longer timeframe',
    ],
    correctIndex: 1,
    explanation:
      "A range isn't stillness — the candles can be just as large and active as in a trend. What makes it a range is that swing highs keep topping out around the same ceiling instead of climbing, and swing lows keep bottoming out around the same floor instead of falling. Lots of motion, no net progression in either direction.",
  },
  {
    id: 'streak-not-proof',
    prompt:
      'A stock closes higher for six candles in a row, with no pullback anywhere in that stretch. Is that enough, by itself, to call it an uptrend?',
    choices: [
      'Yes — six consecutive higher closes is the definition of an uptrend',
      "No — an uninterrupted rally is only one swing. Calling it an uptrend needs a pullback that forms a swing low, followed by that swing low being exceeded to the upside",
      'Yes, but only if the six candles are on a daily timeframe',
      'No — nothing can be called a trend until at least twenty candles have printed',
    ],
    correctIndex: 1,
    explanation:
      "An unbroken rally is just one long swing up — there's no second swing high or swing low yet to compare it against, so the higher-highs/higher-lows structure hasn't actually been established. An uptrend needs at least one confirmed pullback (which sets a swing low) followed by a fresh push that sets a higher swing high than the one before the pullback. A streak of green candles can be the start of that, but it isn't proof of it on its own — plenty of rallies without a single pullback simply exhaust and reverse.",
  },
];

/**
 * Education · Module 4. Builds on Module 3's candlestick/timeframe foundation to cover
 * how a sequence of candles forms a trend: swing highs, swing lows, and the three
 * structures they combine into (uptrend, downtrend, range). Deliberately stops short of
 * support/resistance, which Module 6 introduces. Uses CandlestickChart's static-candle
 * path (candles + sourceType props) with hand-picked example data rather than the live
 * simulated provider, since these examples need a specific, repeatable swing structure.
 */
export function Module4TrendAndPriceAction() {
  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 4</p>
      <h1>Trend &amp; Price Action</h1>
      <p className="module-intro">
        Module 3 covered how a single candle works, and how a timeframe controls how much
        trading gets packed into each one. This module zooms out from a single candle to a
        <em> sequence</em> of them — because it's the pattern across many candles, not any
        one candle on its own, that tells you whether a stock is trending up, trending down,
        or going nowhere in particular.
      </p>

      <section>
        <h2>Swing highs and swing lows</h2>
        <p>
          Zoom out on any chart and you'll notice price doesn't move in a straight line —
          it pushes up for a while, pulls back, pushes up again, pulls back again. Each of
          those turning points has a name.
        </p>
        <p>
          A <strong>swing high</strong> is a candle whose high is higher than the highs of
          the candles immediately around it — a local peak, a point where price stopped
          rising and turned back down. A <strong>swing low</strong> is the mirror image: a
          candle whose low is lower than the lows of the candles immediately around it — a
          local trough, where price stopped falling and turned back up.
        </p>
        <p>
          Neither one is about the highest or lowest price a stock has ever seen — they're
          purely local, defined by comparison to their immediate neighbors. But they're the
          building block for everything else in this module: a trend is nothing more than a
          particular pattern of swing highs and swing lows repeating over time.
        </p>
      </section>

      <VideoEmbed
        youtubeId="Y0k5QBcc1-0"
        title="How To Identify standard Swing Highs & Swing Lows - Trading For Beginners — Trading Drills Academy"
        caption="Trading Drills Academy: How To Identify Standard Swing Highs & Swing Lows"
      />

      <section>
        <h2>Uptrends</h2>
        <p>
          An uptrend is defined by <strong>both</strong> of these holding true across
          multiple swings — not just price being higher than it was recently:
        </p>
        <ul>
          <li>Each swing high is higher than the swing high before it</li>
          <li>Each swing low is higher than the swing low before it</li>
        </ul>
        <p>
          In the example below, the swing highs climb from about <strong>$63</strong>, to
          about <strong>$71</strong>, to about <strong>$80</strong> — each one clearing the
          last. In between, the swing lows climb too, from about <strong>$56</strong> to
          about <strong>$63</strong>. Neither the highs alone nor the lows alone would be
          enough on their own — it's both series rising together that makes this an
          uptrend.
        </p>
        <CandlestickChart
          symbol="Example: Uptrend"
          timeframe="1d"
          candles={UPTREND_EXAMPLE_CANDLES}
          sourceType="simulated"
        />
      </section>

      <section>
        <h2>Downtrends</h2>
        <p>A downtrend is the mirror image, with both conditions again required together:</p>
        <ul>
          <li>Each swing high is lower than the swing high before it</li>
          <li>Each swing low is lower than the swing low before it</li>
        </ul>
        <p>
          In the example below, the swing highs slide from about <strong>$75</strong> down
          to about <strong>$67</strong>, while the swing lows fall from about{' '}
          <strong>$67</strong>, to about <strong>$58</strong>, to about{' '}
          <strong>$49</strong>. Every bounce along the way tops out lower than the last
          bounce, and every pullback digs lower than the last pullback.
        </p>
        <CandlestickChart
          symbol="Example: Downtrend"
          timeframe="1d"
          candles={DOWNTREND_EXAMPLE_CANDLES}
          sourceType="simulated"
        />
      </section>

      <section>
        <h2>Ranges</h2>
        <p>
          Not every stock is trending. A <strong>range</strong> is what happens when price
          oscillates between a rough ceiling and a rough floor, repeatedly, without swing
          highs or swing lows making sustained progress in either direction.
        </p>
        <p>
          A range isn't the absence of movement — the candles below are just as active as in
          the trend examples above. What makes it a range is that the swing highs keep
          topping out near the same ceiling (around <strong>$60</strong>) instead of
          climbing higher each time, and the swing lows keep bottoming out near the same
          floor (around <strong>$50</strong>) instead of falling lower each time. Lots of
          motion, no net progress.
        </p>
        <CandlestickChart
          symbol="Example: Range"
          timeframe="1d"
          candles={RANGE_EXAMPLE_CANDLES}
          sourceType="simulated"
        />
      </section>

      <VideoEmbed
        youtubeId="KK6ttVN9ZZg"
        title="Trend Trading Analysis: Master Uptrends, Downtrends & Consolidation (Market Structure Trading) — Mind Math Money"
        caption="Mind Math Money: Master Uptrends, Downtrends & Consolidation"
      />

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
