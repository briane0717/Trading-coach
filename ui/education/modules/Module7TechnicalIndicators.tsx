import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import { calculateEMA, calculateMACD, calculateRSI, calculateSMA } from '../indicators';
import { UPTREND_EXAMPLE_CANDLES } from './Module4TrendAndPriceAction';
import type { Candle } from '../../../normalized';

/**
 * Fresh, hand-authored series built only for this module's RSI section — not reused from
 * any prior module. Constructed in phases (a flat lead-in, a rally with occasional down
 * bars to the first swing high, a pullback, then a long choppy consolidation followed by a
 * tapering second rally that grinds out a higher price high) so it exhibits bearish RSI
 * divergence with realistic magnitudes: RSI(14) reaches a strong-but-typical overbought
 * reading of ~82.8 at the first swing high (2026-01-21, high 114.81) — not a near-100
 * extreme — then a second, higher swing high on 2026-03-01 (high 116.02) prints with
 * RSI(14) at only ~64.1, clearly back below the 70 overbought threshold. Four conditions
 * were checked programmatically against `calculateRSI`'s real output before this array was
 * finalized — RSI > 70 at the first high; second high's price above the first's; second
 * high's RSI below the first's; second high's RSI below 70 (confirming it's genuinely off
 * the overbought shelf, not just marginally less extreme) — see the generation/verification
 * script referenced in the commit that revised this section. This is the exact array that
 * passed all four.
 */
const RSI_DIVERGENCE_CANDLES: Candle[] = [
  { timestamp: 1767571200000, open: 100, high: 100.49, low: 99.81, close: 100.3, volume: 960000 },
  { timestamp: 1767657600000, open: 100.3, high: 100.48, low: 99.92, close: 100.1, volume: 940000 },
  { timestamp: 1767744000000, open: 100.1, high: 100.71, low: 99.89, close: 100.5, volume: 980000 },
  { timestamp: 1767830400000, open: 100.5, high: 102.72, low: 100.08, close: 102.3, volume: 1260000 },
  { timestamp: 1767916800000, open: 102.3, high: 104.41, low: 101.9, close: 104, volume: 1240000 },
  { timestamp: 1768003200000, open: 104, high: 104.29, low: 102.82, close: 103.1, volume: 1080000 },
  { timestamp: 1768089600000, open: 103.1, high: 105.32, low: 102.68, close: 104.9, volume: 1260000 },
  { timestamp: 1768176000000, open: 104.9, high: 107.01, low: 104.5, close: 106.6, volume: 1240000 },
  { timestamp: 1768262400000, open: 106.6, high: 106.89, low: 105.42, close: 105.7, volume: 1080000 },
  { timestamp: 1768348800000, open: 105.7, high: 107.92, low: 105.28, close: 107.5, volume: 1260000 },
  { timestamp: 1768435200000, open: 107.5, high: 109.61, low: 107.1, close: 109.2, volume: 1240000 },
  { timestamp: 1768521600000, open: 109.2, high: 109.49, low: 108.02, close: 108.3, volume: 1080000 },
  { timestamp: 1768608000000, open: 108.3, high: 110.52, low: 107.88, close: 110.1, volume: 1260000 },
  { timestamp: 1768694400000, open: 110.1, high: 112.21, low: 109.7, close: 111.8, volume: 1240000 },
  { timestamp: 1768780800000, open: 111.8, high: 112.09, low: 110.62, close: 110.9, volume: 1080000 },
  { timestamp: 1768867200000, open: 110.9, high: 113.12, low: 110.48, close: 112.7, volume: 1260000 },
  { timestamp: 1768953600000, open: 112.7, high: 114.81, low: 112.3, close: 114.4, volume: 1240000 },
  { timestamp: 1769040000000, open: 114.4, high: 114.73, low: 112.87, close: 113.2, volume: 1140000 },
  { timestamp: 1769126400000, open: 113.2, high: 113.58, low: 111.33, close: 111.7, volume: 1200000 },
  { timestamp: 1769212800000, open: 111.7, high: 112.05, low: 110.06, close: 110.4, volume: 1160000 },
  { timestamp: 1769299200000, open: 110.4, high: 110.7, low: 109.1, close: 109.4, volume: 1100000 },
  { timestamp: 1769385600000, open: 109.4, high: 109.67, low: 108.33, close: 108.6, volume: 1060000 },
  { timestamp: 1769472000000, open: 108.6, high: 108.92, low: 107.19, close: 107.5, volume: 1120000 },
  { timestamp: 1769558400000, open: 107.5, high: 107.79, low: 106.32, close: 106.6, volume: 1080000 },
  { timestamp: 1769644800000, open: 106.6, high: 106.84, low: 105.76, close: 106, volume: 1020000 },
  { timestamp: 1769731200000, open: 106, high: 106.21, low: 105.39, close: 105.6, volume: 980000 },
  { timestamp: 1769817600000, open: 105.6, high: 105.79, low: 105.11, close: 105.3, volume: 960000 },
  { timestamp: 1769904000000, open: 105.3, high: 106.14, low: 105.06, close: 105.9, volume: 1020000 },
  { timestamp: 1769990400000, open: 105.9, high: 106.14, low: 105.06, close: 105.3, volume: 1020000 },
  { timestamp: 1770076800000, open: 105.3, high: 106.03, low: 105.08, close: 105.8, volume: 1000000 },
  { timestamp: 1770163200000, open: 105.8, high: 106.03, low: 105.08, close: 105.3, volume: 1000000 },
  { timestamp: 1770249600000, open: 105.3, high: 106.14, low: 105.06, close: 105.9, volume: 1020000 },
  { timestamp: 1770336000000, open: 105.9, high: 106.14, low: 105.06, close: 105.3, volume: 1020000 },
  { timestamp: 1770422400000, open: 105.3, high: 106.03, low: 105.08, close: 105.8, volume: 1000000 },
  { timestamp: 1770508800000, open: 105.8, high: 106.03, low: 105.08, close: 105.3, volume: 1000000 },
  { timestamp: 1770595200000, open: 105.3, high: 107.75, low: 104.85, close: 107.3, volume: 1300000 },
  { timestamp: 1770681600000, open: 107.3, high: 107.54, low: 106.46, close: 106.7, volume: 1020000 },
  { timestamp: 1770768000000, open: 106.7, high: 109.15, low: 106.25, close: 108.7, volume: 1300000 },
  { timestamp: 1770854400000, open: 108.7, high: 108.94, low: 107.86, close: 108.1, volume: 1020000 },
  { timestamp: 1770940800000, open: 108.1, high: 110.44, low: 107.67, close: 110, volume: 1280000 },
  { timestamp: 1771027200000, open: 110, high: 110.26, low: 109.05, close: 109.3, volume: 1040000 },
  { timestamp: 1771113600000, open: 109.3, high: 111.64, low: 108.87, close: 111.2, volume: 1280000 },
  { timestamp: 1771200000000, open: 111.2, high: 111.46, low: 110.25, close: 110.5, volume: 1040000 },
  { timestamp: 1771286400000, open: 110.5, high: 112.72, low: 110.08, close: 112.3, volume: 1260000 },
  { timestamp: 1771372800000, open: 112.3, high: 112.57, low: 111.23, close: 111.5, volume: 1060000 },
  { timestamp: 1771459200000, open: 111.5, high: 113.72, low: 111.08, close: 113.3, volume: 1260000 },
  { timestamp: 1771545600000, open: 113.3, high: 113.57, low: 112.23, close: 112.5, volume: 1060000 },
  { timestamp: 1771632000000, open: 112.5, high: 114.49, low: 112.11, close: 114.1, volume: 1220000 },
  { timestamp: 1771718400000, open: 114.1, high: 114.39, low: 112.92, close: 113.2, volume: 1080000 },
  { timestamp: 1771804800000, open: 113.2, high: 115.19, low: 112.81, close: 114.8, volume: 1220000 },
  { timestamp: 1771891200000, open: 114.8, high: 115.09, low: 113.62, close: 113.9, volume: 1080000 },
  { timestamp: 1771977600000, open: 113.9, high: 115.66, low: 113.54, close: 115.3, volume: 1180000 },
  { timestamp: 1772064000000, open: 115.3, high: 115.6, low: 114, close: 114.3, volume: 1100000 },
  { timestamp: 1772150400000, open: 114.3, high: 115.95, low: 113.96, close: 115.6, volume: 1160000 },
  { timestamp: 1772236800000, open: 115.6, high: 115.9, low: 114.3, close: 114.6, volume: 1100000 },
  { timestamp: 1772323200000, open: 114.6, high: 116.02, low: 114.29, close: 115.7, volume: 1120000 },
  { timestamp: 1772409600000, open: 115.7, high: 116, low: 114.4, close: 114.7, volume: 1100000 },
  { timestamp: 1772496000000, open: 114.7, high: 114.99, low: 113.52, close: 113.8, volume: 1080000 },
  { timestamp: 1772582400000, open: 113.8, high: 114.06, low: 112.85, close: 113.1, volume: 1040000 },
  { timestamp: 1772668800000, open: 113.1, high: 113.32, low: 112.38, close: 112.6, volume: 1000000 },
];

/**
 * Fresh, hand-authored 66-bar series built only for this module's MACD section — a
 * downtrend (not a straight line: it flattens briefly around a failed bounce, then resumes)
 * that reverses into an uptrend, constructed so MACD(12,26,9) actually crosses bullish
 * partway through with visible runway on both sides. MACD(12,26,9) needs 34 bars before its
 * first exposed point (26 for the slow EMA, 9 more for the signal line), so the decline had
 * to stay steep enough through at least bar 34 that the crossover doesn't happen "off
 * screen" before any data is visible — an early version of this series had exactly that bug
 * (the crossover was already positive at the very first exposed point).
 *
 * Four conditions were checked programmatically against `calculateMACD`'s real output
 * before this array was finalized: (1) MACD stays below signal throughout the visible
 * pre-crossover runway; (2) an actual crossover occurs; (3) MACD stays above signal for a
 * meaningful stretch afterward (>= 8 bars, no immediate re-cross); (4) the histogram's sign
 * flips from negative to positive exactly at the crossover bar. The crossover lands on
 * 2026-02-17 (histogram goes from -0.068 the prior bar to +0.024), with 10 visible bars of
 * MACD-below-signal beforehand and 22 of MACD-above-signal after — this is the exact array
 * that passed all four checks.
 */
const MACD_CROSSOVER_CANDLES: Candle[] = [
  { timestamp: 1767571200000, open: 100, high: 100.35, low: 98.36, close: 98.7, volume: 1160000 },
  { timestamp: 1767657600000, open: 98.7, high: 99.08, low: 96.83, close: 97.2, volume: 1200000 },
  { timestamp: 1767744000000, open: 97.2, high: 97.53, low: 95.67, close: 96, volume: 1140000 },
  { timestamp: 1767830400000, open: 96, high: 96.36, low: 94.24, close: 94.6, volume: 1180000 },
  { timestamp: 1767916800000, open: 94.6, high: 94.92, low: 93.19, close: 93.5, volume: 1120000 },
  { timestamp: 1768003200000, open: 93.5, high: 93.89, low: 91.51, close: 91.9, volume: 1220000 },
  { timestamp: 1768089600000, open: 91.9, high: 92.25, low: 90.26, close: 90.6, volume: 1160000 },
  { timestamp: 1768176000000, open: 90.6, high: 90.9, low: 89.3, close: 89.6, volume: 1100000 },
  { timestamp: 1768262400000, open: 89.6, high: 89.93, low: 88.07, close: 88.4, volume: 1140000 },
  { timestamp: 1768348800000, open: 88.4, high: 88.76, low: 86.64, close: 87, volume: 1180000 },
  { timestamp: 1768435200000, open: 87, high: 87.33, low: 85.47, close: 85.8, volume: 1140000 },
  { timestamp: 1768521600000, open: 85.8, high: 86.16, low: 84.04, close: 84.4, volume: 1180000 },
  { timestamp: 1768608000000, open: 84.4, high: 84.72, low: 82.99, close: 83.3, volume: 1120000 },
  { timestamp: 1768694400000, open: 83.3, high: 83.65, low: 81.66, close: 82, volume: 1160000 },
  { timestamp: 1768780800000, open: 82, high: 82.3, low: 80.7, close: 81, volume: 1100000 },
  { timestamp: 1768867200000, open: 81, high: 81.84, low: 80.76, close: 81.6, volume: 1020000 },
  { timestamp: 1768953600000, open: 81.6, high: 82.32, low: 81.38, close: 82.1, volume: 1000000 },
  { timestamp: 1769040000000, open: 82.1, high: 82.31, low: 81.49, close: 81.7, volume: 980000 },
  { timestamp: 1769126400000, open: 81.7, high: 82.31, low: 81.49, close: 82.1, volume: 980000 },
  { timestamp: 1769212800000, open: 82.1, high: 82.34, low: 81.26, close: 81.5, volume: 1020000 },
  { timestamp: 1769299200000, open: 81.5, high: 81.88, low: 79.63, close: 80, volume: 1200000 },
  { timestamp: 1769385600000, open: 80, high: 80.41, low: 77.9, close: 78.3, volume: 1240000 },
  { timestamp: 1769472000000, open: 78.3, high: 78.66, low: 76.54, close: 76.9, volume: 1180000 },
  { timestamp: 1769558400000, open: 76.9, high: 77.29, low: 74.91, close: 75.3, volume: 1220000 },
  { timestamp: 1769644800000, open: 75.3, high: 75.65, low: 73.66, close: 74, volume: 1160000 },
  { timestamp: 1769731200000, open: 74, high: 74.38, low: 72.13, close: 72.5, volume: 1200000 },
  { timestamp: 1769817600000, open: 72.5, high: 72.83, low: 70.97, close: 71.3, volume: 1140000 },
  { timestamp: 1769904000000, open: 71.3, high: 71.66, low: 69.54, close: 69.9, volume: 1180000 },
  { timestamp: 1769990400000, open: 69.9, high: 70.22, low: 68.49, close: 68.8, volume: 1120000 },
  { timestamp: 1770076800000, open: 68.8, high: 69.15, low: 67.16, close: 67.5, volume: 1160000 },
  { timestamp: 1770163200000, open: 67.5, high: 67.83, low: 65.97, close: 66.3, volume: 1140000 },
  { timestamp: 1770249600000, open: 66.3, high: 66.66, low: 64.54, close: 64.9, volume: 1180000 },
  { timestamp: 1770336000000, open: 64.9, high: 65.22, low: 63.49, close: 63.8, volume: 1120000 },
  { timestamp: 1770422400000, open: 63.8, high: 64.15, low: 62.16, close: 62.5, volume: 1160000 },
  { timestamp: 1770508800000, open: 62.5, high: 62.8, low: 61.2, close: 61.5, volume: 1100000 },
  { timestamp: 1770595200000, open: 61.5, high: 61.83, low: 59.97, close: 60.3, volume: 1140000 },
  { timestamp: 1770681600000, open: 60.3, high: 60.65, low: 58.66, close: 59, volume: 1160000 },
  { timestamp: 1770768000000, open: 59, high: 59.32, low: 57.59, close: 57.9, volume: 1120000 },
  { timestamp: 1770854400000, open: 57.9, high: 58.23, low: 56.37, close: 56.7, volume: 1140000 },
  { timestamp: 1770940800000, open: 56.7, high: 57, low: 55.4, close: 55.7, volume: 1100000 },
  { timestamp: 1771027200000, open: 55.7, high: 55.96, low: 54.75, close: 55, volume: 1040000 },
  { timestamp: 1771113600000, open: 55, high: 55.24, low: 54.16, close: 54.4, volume: 1020000 },
  { timestamp: 1771200000000, open: 54.4, high: 54.63, low: 53.68, close: 53.9, volume: 1000000 },
  { timestamp: 1771286400000, open: 53.9, high: 54.14, low: 53.06, close: 53.3, volume: 1020000 },
  { timestamp: 1771372800000, open: 53.3, high: 53.51, low: 52.69, close: 52.9, volume: 980000 },
  { timestamp: 1771459200000, open: 52.9, high: 53.13, low: 52.18, close: 52.4, volume: 1000000 },
  { timestamp: 1771545600000, open: 52.4, high: 52.6, low: 51.91, close: 52.1, volume: 960000 },
  { timestamp: 1771632000000, open: 52.1, high: 52.31, low: 51.49, close: 51.7, volume: 980000 },
  { timestamp: 1771718400000, open: 51.7, high: 52.2, low: 51.51, close: 52, volume: 960000 },
  { timestamp: 1771804800000, open: 52, high: 52.21, low: 51.39, close: 51.6, volume: 980000 },
  { timestamp: 1771891200000, open: 51.6, high: 52.33, low: 51.38, close: 52.1, volume: 1000000 },
  { timestamp: 1771977600000, open: 52.1, high: 52.3, low: 51.61, close: 51.8, volume: 960000 },
  { timestamp: 1772064000000, open: 51.8, high: 52.41, low: 51.59, close: 52.2, volume: 980000 },
  { timestamp: 1772150400000, open: 52.2, high: 52.38, low: 51.82, close: 52, volume: 940000 },
  { timestamp: 1772236800000, open: 52, high: 52.5, low: 51.81, close: 52.3, volume: 960000 },
  { timestamp: 1772323200000, open: 52.3, high: 52.47, low: 52.04, close: 52.2, volume: 920000 },
  { timestamp: 1772409600000, open: 52.2, high: 53.39, low: 51.92, close: 53.1, volume: 1080000 },
  { timestamp: 1772496000000, open: 53.1, high: 54.52, low: 52.79, close: 54.2, volume: 1120000 },
  { timestamp: 1772582400000, open: 54.2, high: 55.27, low: 53.93, close: 55, volume: 1060000 },
  { timestamp: 1772668800000, open: 55, high: 56.53, low: 54.67, close: 56.2, volume: 1140000 },
  { timestamp: 1772755200000, open: 56.2, high: 57.5, low: 55.9, close: 57.2, volume: 1100000 },
  { timestamp: 1772841600000, open: 57.2, high: 58.85, low: 56.86, close: 58.5, volume: 1160000 },
  { timestamp: 1772928000000, open: 58.5, high: 59.92, low: 58.19, close: 59.6, volume: 1120000 },
  { timestamp: 1773014400000, open: 59.6, high: 61.36, low: 59.24, close: 61, volume: 1180000 },
  { timestamp: 1773100800000, open: 61, high: 62.53, low: 60.67, close: 62.2, volume: 1140000 },
  { timestamp: 1773187200000, open: 62.2, high: 64.08, low: 61.83, close: 63.7, volume: 1200000 },
];

/**
 * Education · Module 7, sections 1-3 of 5: Moving Averages, RSI, then MACD. All three use
 * `ui/education/indicators.ts` (the thin wrapper around `data-providers/internal/indicators.ts`
 * — see that file's header for why this is the single place in the repo computing this math).
 *
 * Section 1 (Moving Averages) reuses Module 4's `UPTREND_EXAMPLE_CANDLES` via
 * CandlestickChart's `overlayLines` prop, so the same chart already familiar from
 * swing-high/swing-low teaching now carries moving-average lines too. Deliberately stops
 * short of a crossover example — two MAs of different lengths crossing is exactly what
 * MACD does, so that mechanic is taught once, in section 3, instead of twice.
 *
 * Section 2 (RSI) uses a fresh, hand-authored 60-bar series (`RSI_DIVERGENCE_CANDLES`, this
 * file) built specifically to show bearish divergence at realistic magnitudes: RSI(14)
 * reaches a strong-but-typical overbought reading (~83) at the first swing high, then a
 * second, higher swing high prints with RSI clearly back below 70 (~64) — momentum
 * genuinely faded, not just marginally less extreme. Four conditions were checked
 * programmatically against `calculateRSI`'s actual output before this array was committed
 * (RSI > 70 at the first high; second high's price above the first's; second high's RSI
 * below the first's; second high's RSI below 70) — see the verification script referenced
 * in the commit that revised this section. Renders via CandlestickChart's `oscillatorPane`
 * prop, which gives RSI its own 0-100 sub-pane instead of sharing the price scale.
 *
 * Section 3 (MACD) uses a fresh, hand-authored 66-bar series (`MACD_CROSSOVER_CANDLES`,
 * this file) built to show an actual bullish MACD/signal crossover with visible runway on
 * both sides: a downtrend, a reversal, then an uptrend. Four conditions were checked
 * programmatically against `calculateMACD`'s actual output before this array was committed
 * — see that constant's doc comment for the specifics. Renders via CandlestickChart's
 * `macdPane` prop (added alongside this section), which gives MACD's two lines and
 * histogram their own shared sub-pane.
 *
 * ATR and VWAP are separate sections still to be added. The end-of-module quiz is deferred
 * until all five indicators exist, so it can cover all of them at once instead of one quiz
 * per section.
 */
export function Module7TechnicalIndicators() {
  const sma20 = calculateSMA(UPTREND_EXAMPLE_CANDLES, 20);
  const ema20 = calculateEMA(UPTREND_EXAMPLE_CANDLES, 20);
  const rsi14 = calculateRSI(RSI_DIVERGENCE_CANDLES, 14);
  const macd = calculateMACD(MACD_CROSSOVER_CANDLES, 12, 26, 9);

  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 7</p>
      <h1>Technical Indicators</h1>
      <p className="module-intro">
        Everything so far — swing highs and lows, trend, volume, support and resistance —
        has come straight from reading the raw candles. Starting with this module, we add{' '}
        <strong>indicators</strong>: values calculated from price (and sometimes volume)
        that summarize something the raw candles make you eyeball for yourself. Module 7
        covers five of them across separate sections: moving averages first, then RSI,
        MACD, ATR, and VWAP.
      </p>

      <section>
        <h2>Moving averages: what one is</h2>
        <p>
          A moving average takes the last <em>N</em> closing prices and averages them, then
          recalculates that average on every new candle — a running average that slides
          forward one bar at a time. Because it's an average of recent prices rather than
          the current price itself, it does two things at once: it{' '}
          <strong>smooths out noise</strong> (a single sharp candle barely moves it) and it{' '}
          <strong>lags behind price</strong> (it can only reflect a change in direction once
          enough new bars have pulled the average with them).
        </p>
        <p>
          There are two versions of it in this module, and the difference between them is
          entirely about that lag:
        </p>
        <ul>
          <li>
            <strong>SMA (simple moving average)</strong> weights every one of the last{' '}
            <em>N</em> closes equally. It's the plainest possible average, and the least
            reactive — a big move 18 bars ago counts exactly as much as yesterday's close
            until it finally drops out of the window.
          </li>
          <li>
            <strong>EMA (exponential moving average)</strong> weights recent closes more
            heavily than older ones, so it responds to a new move faster than an SMA of the
            same length does. It's still lagging price — it's still an average — just less
            of a lag than the SMA.
          </li>
        </ul>
        <p>
          Neither one is "better" in every situation. A longer-lag SMA filters out more
          noise but reacts slower to a genuine change in direction; a faster EMA catches
          that change sooner but is also quicker to wobble on noise that isn't a real
          change. It's a tradeoff between smoothness and responsiveness, not a right answer.
        </p>
      </section>

      <VideoEmbed
        youtubeId="teNQ6ZUS1C4"
        title="Master Moving Averages: SMA and EMA Explained for Beginners — Alice Blue"
        caption="Alice Blue: Master Moving Averages — SMA and EMA Explained for Beginners"
      />

      <section>
        <h2>SMA(20) and EMA(20) on the Module 4 uptrend example</h2>
        <p>
          Below is the same uptrend chart from Module 4, with a 20-period SMA and a
          20-period EMA plotted on top. Both lines only start once 20 candles exist to
          average, so they pick up partway through the chart — from{' '}
          <strong>2026-08-17</strong> onward — and both climb through most of that window,
          running <strong>below</strong> the candles the whole time. That's typical of an
          uptrend: because price has been rising, any trailing average of recent closes
          sits under the current price. Some traders watch a rising moving average like this
          as a level of <strong>dynamic support</strong> — a floor that rises along with the
          trend rather than sitting at one fixed price — though, like the static support
          levels in Module 6, that's a tendency worth watching, not a rule a moving average
          is obligated to respect.
        </p>
        <p>
          Look closely at the right-hand edge of the chart. The last few candles pull back
          from the swing high near <strong>$80</strong> down to about{' '}
          <strong>$75.50</strong>. Over those same four bars, EMA(20)'s day-over-day gain
          shrinks from about <strong>+$1.35</strong> to about <strong>+$0.61</strong> — more
          than cut in half — as it responds to the pullback. SMA(20)'s day-over-day gain
          barely moves over the same stretch, holding at roughly{' '}
          <strong>+$0.90</strong> the whole way. That's the lag/responsiveness tradeoff from
          above, playing out on an actual chart: same data, same period length, two
          different amounts of lag.
        </p>
        <CandlestickChart
          symbol="Example: Uptrend (Module 4) with SMA(20) / EMA(20)"
          timeframe="1d"
          candles={UPTREND_EXAMPLE_CANDLES}
          sourceType="simulated"
          overlayLines={[
            { label: 'SMA(20)', color: '#2563eb', points: sma20 },
            { label: 'EMA(20)', color: '#dc2626', points: ema20 },
          ]}
        />
        <p>
          One thing this chart deliberately does not show: two moving averages of different
          lengths crossing each other to signal a trend change. That comparison — a fast
          average against a slow one — is exactly what MACD does, covered next, so it's
          taught there once instead of being built twice.
        </p>
      </section>

      <section>
        <h2>RSI: what it measures</h2>
        <p>
          A moving average is built from price itself — the same dollars the candles show.{' '}
          <strong>RSI (Relative Strength Index)</strong> is different: it doesn't measure
          price, it measures <strong>momentum</strong> — the speed and size of recent price
          changes. It's calculated from the ratio of average gains to average losses over the
          last 14 candles (the standard period), then scaled to run from{' '}
          <strong>0 to 100</strong>. A stock can be at a new high in price while RSI says its
          momentum is actually cooling off — that gap between "what price is doing" and
          "how much force is behind it" is exactly what makes RSI useful on top of a raw
          chart.
        </p>
        <p>
          Two levels get watched closely: a reading above <strong>70</strong> is generally
          called <strong>overbought</strong>, and a reading below <strong>30</strong> is
          called <strong>oversold</strong>. As with Module 6's support and resistance levels,
          treat 70/30 as widely-watched reference points, not hard rules — a strong uptrend
          can hold RSI above 70 for a long stretch without reversing, the same way a stock can
          punch through a resistance level instead of stopping at it. Overbought doesn't mean
          "sell now"; it means momentum is currently running hot.
        </p>
      </section>

      <VideoEmbed
        youtubeId="M7xplaA4-gk"
        title="The ONLY RSI Divergence Guide You'll Ever Need — Asia Forex Mentor, Ezekiel Chew"
        caption="Asia Forex Mentor: The ONLY RSI Divergence Guide You'll Ever Need"
      />

      <section>
        <h2>Bearish divergence: price and RSI telling different stories</h2>
        <p>
          The chart below is a fresh example built specifically for this section — a rally
          that pushes to a swing high, a pullback, then a second rally that grinds out to an
          even <strong>higher</strong> swing high. Read the price alone and it looks like
          straightforward continued strength: a higher high following an earlier high.
        </p>
        <p>
          Now look at RSI(14) in the pane underneath. At the <strong>first</strong> swing
          high (2026-01-21, price <strong>$114.81</strong>), RSI reads about{' '}
          <strong>83</strong> — a strong, typical overbought reading. At the{' '}
          <strong>second</strong> swing high (2026-03-01, price <strong>$116.02</strong> — a
          new high), RSI reads only about <strong>64</strong>, clearly back{' '}
          <strong>below</strong> the 70 overbought line. Price made more progress the second
          time. Momentum did not — the second rally took longer, ground higher in a
          choppier, more interrupted climb, and RSI never got anywhere close to overbought
          again on the way to that new high.
        </p>
        <p>
          That pattern — price making a higher high while RSI makes a{' '}
          <strong>lower</strong> high at the same point — is called{' '}
          <strong>bearish divergence</strong>. It's evidence that the buying pressure behind
          the advance is fading even though price itself hasn't turned down yet. Like every
          other pattern in this module, it's a caution flag to weigh, not a prediction: plenty
          of divergences resolve with price simply continuing higher until momentum and price
          eventually agree again, and some do precede a real reversal. It's one more piece of
          evidence, read alongside price, not a signal that tells you what to do next.
        </p>
        <CandlestickChart
          symbol="Example: Bearish RSI Divergence"
          timeframe="1d"
          candles={RSI_DIVERGENCE_CANDLES}
          sourceType="simulated"
          oscillatorPane={{
            label: 'RSI(14)',
            color: '#7c3aed',
            points: rsi14,
            referenceLines: [
              { value: 70, label: 'Overbought (70)', color: '#dc2626' },
              { value: 30, label: 'Oversold (30)', color: '#16a34a' },
            ],
          }}
        />
      </section>

      <section>
        <h2>MACD: two moving averages compared</h2>
        <p>
          The moving-average section above stopped short of comparing two moving averages
          of different speeds to each other — that comparison is exactly what{' '}
          <strong>MACD (Moving Average Convergence/Divergence)</strong> is. It's built from
          three pieces:
        </p>
        <ul>
          <li>
            The <strong>MACD line</strong>: a fast 12-period EMA of price minus a slower
            26-period EMA of price. When the fast EMA is above the slow one, MACD is
            positive; when it's below, MACD is negative. The further apart the two EMAs
            get, the larger MACD's value in either direction.
          </li>
          <li>
            The <strong>signal line</strong>: a 9-period EMA of the MACD line itself — a
            moving average of a moving-average comparison, one level removed from price.
          </li>
          <li>
            The <strong>histogram</strong>: MACD line minus signal line, plotted as bars.
            It's just the gap between the two lines made visible — positive bars when MACD
            is above signal, negative bars when it's below, and the bars grow or shrink as
            that gap widens or narrows.
          </li>
        </ul>
        <p>
          A <strong>bullish crossover</strong> — the MACD line crossing above the signal
          line — is the headline signal traders watch for. It means the fast/slow EMA
          relationship has just tilted from "recent price weaker than the trailing average"
          to "recent price stronger than the trailing average." A bearish crossover is the
          mirror image, MACD crossing below signal.
        </p>
      </section>

      <VideoEmbed
        youtubeId="HZtJCCRvgJo"
        title="MACD Indicator Explained Simply (MACD Line, Signal Line, Histogram, Crossover, Zero Line) — Mind Math Money"
        caption="Mind Math Money: MACD Indicator Explained Simply"
      />

      <section>
        <h2>A bullish crossover, start to finish</h2>
        <p>
          The chart below is a fresh example: a downtrend that runs from about{' '}
          <strong>$98.70</strong> down to about <strong>$51.60</strong> over roughly seven
          weeks, then reverses into an uptrend that climbs back to about{' '}
          <strong>$63.70</strong>. It isn't a straight line down — there's a failed bounce
          partway through — but the overall direction is clear: a real downtrend, followed
          by a real uptrend.
        </p>
        <p>
          Look at the MACD pane underneath. For the first{' '}
          <strong>10 visible bars</strong> (2026-02-07 through 2026-02-16), the MACD line
          sits below the signal line and the histogram prints negative — momentum is still
          pointed down, consistent with the downtrend still in force. On{' '}
          <strong>2026-02-17</strong>, the MACD line crosses <strong>above</strong> the
          signal line — the histogram flips from about <strong>-0.07</strong> the day
          before to about <strong>+0.02</strong>. MACD then stays above signal for the next{' '}
          <strong>22 bars</strong> straight, with the histogram growing to about{' '}
          <strong>+1.90</strong> by the end of the chart, as the uptrend builds momentum.
        </p>
        <p>
          Notice the crossover (2026-02-17, price <strong>$53.30</strong>) happens{' '}
          <em>before</em> price actually bottoms (2026-02-23, price <strong>$51.60</strong>)
          — price keeps drifting slightly lower for a few more bars even after MACD has
          already turned up. That's normal, not a bug: MACD reacts to the rate of change in
          an EMA-smoothed average, which can start improving before the very last low
          prints. Like every signal in this module, a crossover is evidence to weigh, not a
          guarantee — MACD can whipsaw back and forth in a choppy market the same way any
          other indicator can.
        </p>
        <CandlestickChart
          symbol="Example: MACD Bullish Crossover"
          timeframe="1d"
          candles={MACD_CROSSOVER_CANDLES}
          sourceType="simulated"
          macdPane={{
            macdLine: { label: 'MACD', color: '#2563eb', points: macd.macdLine },
            signalLine: { label: 'Signal', color: '#dc2626', points: macd.signalLine },
            histogram: { points: macd.histogram },
          }}
        />
      </section>
    </article>
  );
}
