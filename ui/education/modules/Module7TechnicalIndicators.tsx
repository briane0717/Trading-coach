import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import {
  calculateATR,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  calculateVWAP,
} from '../indicators';
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
 * Fresh, hand-authored 38-bar series built only for this module's ATR section: 18 calm bars
 * (small day-to-day drift, a fixed small wick offset on every candle) followed by a breakout
 * bar and 19 more bars of sustained wide ranges trending higher. ATR(14) needs 14 true ranges
 * for its first value, so it's exposed from candle index 14 on — well within the calm phase,
 * with plenty of room left to reach the expansion phase before the series ends.
 *
 * Two conditions were checked programmatically against `calculateATR`'s real output before
 * this array was finalized: ATR(14) lands around 1-2% of price during the calm phase and
 * around 3-5% of price during the expansion phase, and the expansion reading is meaningfully
 * higher than the calm one (not just marginally). At the end of the calm stretch
 * (2026-01-28), ATR(14) is about $0.93 on a $80.20 close — about 1.16% of price. By the last
 * bar (2026-02-25), ATR(14) has grown to about $3.38 on a $99.60 close — about 3.40% of
 * price, roughly 3.6x the calm-phase reading. This is the exact array that passed both
 * checks on the first attempt.
 */
const ATR_VOLATILITY_CANDLES: Candle[] = [
  { timestamp: 1767571200000, open: 80, high: 80.65, low: 79.65, close: 80.3, volume: 900000 },
  { timestamp: 1767657600000, open: 80.3, high: 80.6, low: 79.8, close: 80.1, volume: 880000 },
  { timestamp: 1767744000000, open: 80.1, high: 80.85, low: 79.75, close: 80.5, volume: 920000 },
  { timestamp: 1767830400000, open: 80.5, high: 80.8, low: 79.9, close: 80.2, volume: 900000 },
  { timestamp: 1767916800000, open: 80.2, high: 80.7, low: 79.9, close: 80.4, volume: 880000 },
  { timestamp: 1768176000000, open: 80.4, high: 80.75, low: 79.65, close: 80, volume: 920000 },
  { timestamp: 1768262400000, open: 80, high: 80.6, low: 79.7, close: 80.3, volume: 900000 },
  { timestamp: 1768348800000, open: 80.3, high: 80.6, low: 79.8, close: 80.1, volume: 880000 },
  { timestamp: 1768435200000, open: 80.1, high: 81, low: 79.7, close: 80.6, volume: 940000 },
  { timestamp: 1768521600000, open: 80.6, high: 80.9, low: 80, close: 80.3, volume: 900000 },
  { timestamp: 1768780800000, open: 80.3, high: 80.8, low: 80, close: 80.5, volume: 880000 },
  { timestamp: 1768867200000, open: 80.5, high: 80.85, low: 79.75, close: 80.1, volume: 920000 },
  { timestamp: 1768953600000, open: 80.1, high: 80.7, low: 79.8, close: 80.4, volume: 900000 },
  { timestamp: 1769040000000, open: 80.4, high: 80.7, low: 79.9, close: 80.2, volume: 880000 },
  { timestamp: 1769126400000, open: 80.2, high: 80.95, low: 79.85, close: 80.6, volume: 920000 },
  { timestamp: 1769385600000, open: 80.6, high: 80.9, low: 80, close: 80.3, volume: 900000 },
  { timestamp: 1769472000000, open: 80.3, high: 80.8, low: 80, close: 80.5, volume: 880000 },
  { timestamp: 1769558400000, open: 80.5, high: 80.8, low: 79.9, close: 80.2, volume: 900000 },
  { timestamp: 1769644800000, open: 80.2, high: 85.2, low: 78.8, close: 83.8, volume: 1600000 },
  { timestamp: 1769731200000, open: 83.8, high: 86.7, low: 82.7, close: 85.6, volume: 1400000 },
  { timestamp: 1769990400000, open: 85.6, high: 86.8, low: 83.2, close: 84.4, volume: 1300000 },
  { timestamp: 1770076800000, open: 84.4, high: 88, low: 83.2, close: 86.8, volume: 1450000 },
  { timestamp: 1770163200000, open: 86.8, high: 89.5, low: 85.7, close: 88.4, volume: 1350000 },
  { timestamp: 1770249600000, open: 88.4, high: 89.6, low: 85.4, close: 86.6, volume: 1400000 },
  { timestamp: 1770336000000, open: 86.6, high: 90.4, low: 85.4, close: 89.2, volume: 1450000 },
  { timestamp: 1770595200000, open: 89.2, high: 91.7, low: 88.1, close: 90.6, volume: 1350000 },
  { timestamp: 1770681600000, open: 90.6, high: 91.7, low: 87.9, close: 89, volume: 1350000 },
  { timestamp: 1770768000000, open: 89, high: 92.4, low: 87.8, close: 91.2, volume: 1400000 },
  { timestamp: 1770854400000, open: 91.2, high: 94.1, low: 90.1, close: 93, volume: 1350000 },
  { timestamp: 1770940800000, open: 93, high: 94.1, low: 90.5, close: 91.6, volume: 1300000 },
  { timestamp: 1771200000000, open: 91.6, high: 94.8, low: 90.4, close: 93.6, volume: 1400000 },
  { timestamp: 1771286400000, open: 93.6, high: 96.3, low: 92.5, close: 95.2, volume: 1350000 },
  { timestamp: 1771372800000, open: 95.2, high: 96.4, low: 92.2, close: 93.4, volume: 1400000 },
  { timestamp: 1771459200000, open: 93.4, high: 97, low: 92.2, close: 95.8, volume: 1450000 },
  { timestamp: 1771545600000, open: 95.8, high: 98.3, low: 94.7, close: 97.2, volume: 1350000 },
  { timestamp: 1771804800000, open: 97.2, high: 98.3, low: 94.9, close: 96, volume: 1300000 },
  { timestamp: 1771891200000, open: 96, high: 99.2, low: 94.8, close: 98, volume: 1400000 },
  { timestamp: 1771977600000, open: 98, high: 100.7, low: 96.9, close: 99.6, volume: 1350000 },
];

/**
 * Fresh, hand-authored 27-bar intraday series built only for this module's VWAP section —
 * 15-minute bars across a single ~6.5-hour session (2026-03-16, 09:30-16:00). Unlike every
 * other series in this module, these timestamps span one trading day, not many, since VWAP
 * is a same-session indicator. Three phases: a 10-bar morning rally that pulls price well
 * above the still-rising VWAP, a 6-bar pullback that dips down to test VWAP (the low of the
 * 12:30 bar comes within a cent of the VWAP value at that same timestamp) without any bar's
 * close dropping below it, then an 11-bar bounce back to a new session high.
 *
 * Two conditions were checked programmatically against `calculateVWAP`'s real output before
 * this array was finalized: the pullback's lowest-relative-to-VWAP bar's low sits within a
 * small tolerance of VWAP at that timestamp (found: low $50.80 vs. VWAP $50.81, essentially a
 * touch) while every pullback-phase close still holds at or above VWAP, and every bar after
 * the pullback closes above VWAP. This is the exact array that passed both checks.
 */
const VWAP_INTRADAY_CANDLES: Candle[] = [
  { timestamp: 1773667800000, open: 50, high: 50.33, low: 49.95, close: 50.25, volume: 210000 },
  { timestamp: 1773668700000, open: 50.25, high: 50.52, low: 50.2, close: 50.45, volume: 190000 },
  { timestamp: 1773669600000, open: 50.45, high: 50.66, low: 50.41, close: 50.6, volume: 170000 },
  { timestamp: 1773670500000, open: 50.6, high: 50.84, low: 50.56, close: 50.78, volume: 150000 },
  { timestamp: 1773671400000, open: 50.78, high: 50.95, low: 50.74, close: 50.9, volume: 140000 },
  { timestamp: 1773672300000, open: 50.9, high: 51.05, low: 50.87, close: 51, volume: 120000 },
  { timestamp: 1773673200000, open: 51, high: 51.12, low: 50.97, close: 51.08, volume: 110000 },
  { timestamp: 1773674100000, open: 51.08, high: 51.19, low: 51.05, close: 51.15, volume: 100000 },
  { timestamp: 1773675000000, open: 51.15, high: 51.23, low: 51.12, close: 51.2, volume: 95000 },
  { timestamp: 1773675900000, open: 51.2, high: 51.28, low: 51.17, close: 51.25, volume: 90000 },
  { timestamp: 1773676800000, open: 51.25, high: 51.28, low: 51.15, close: 51.2, volume: 100000 },
  { timestamp: 1773677700000, open: 51.2, high: 51.23, low: 51.11, close: 51.17, volume: 105000 },
  { timestamp: 1773678600000, open: 51.17, high: 51.2, low: 50.8, close: 51.15, volume: 130000 },
  { timestamp: 1773679500000, open: 51.15, high: 51.24, low: 51.11, close: 51.2, volume: 110000 },
  { timestamp: 1773680400000, open: 51.2, high: 51.33, low: 51.17, close: 51.28, volume: 100000 },
  { timestamp: 1773681300000, open: 51.28, high: 51.41, low: 51.25, close: 51.36, volume: 95000 },
  { timestamp: 1773682200000, open: 51.36, high: 51.53, low: 51.33, close: 51.48, volume: 100000 },
  { timestamp: 1773683100000, open: 51.48, high: 51.68, low: 51.45, close: 51.63, volume: 105000 },
  { timestamp: 1773684000000, open: 51.63, high: 51.82, low: 51.6, close: 51.77, volume: 110000 },
  { timestamp: 1773684900000, open: 51.77, high: 51.95, low: 51.74, close: 51.9, volume: 115000 },
  { timestamp: 1773685800000, open: 51.9, high: 52.12, low: 51.87, close: 52.06, volume: 120000 },
  { timestamp: 1773686700000, open: 52.06, high: 52.27, low: 52.03, close: 52.21, volume: 130000 },
  { timestamp: 1773687600000, open: 52.21, high: 52.41, low: 52.18, close: 52.35, volume: 140000 },
  { timestamp: 1773688500000, open: 52.35, high: 52.53, low: 52.32, close: 52.48, volume: 150000 },
  { timestamp: 1773689400000, open: 52.48, high: 52.65, low: 52.45, close: 52.6, volume: 165000 },
  { timestamp: 1773690300000, open: 52.6, high: 52.81, low: 52.57, close: 52.75, volume: 185000 },
  { timestamp: 1773691200000, open: 52.75, high: 52.94, low: 52.72, close: 52.88, volume: 210000 },
];

/**
 * Education · Module 7, all 5 of 5 sections: Moving Averages, RSI, MACD, ATR, then VWAP. All five use
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
 * Section 4 (ATR) uses a fresh, hand-authored 38-bar series (`ATR_VOLATILITY_CANDLES`, this
 * file) showing a calm, tight-range stretch followed by a breakout into a wide-range
 * expansion — ATR(14) only needs 14 true ranges for its first value, nowhere near MACD's
 * 34-bar wall, so 38 bars is enough to show both phases clearly. Two conditions were checked
 * programmatically against `calculateATR`'s actual output before this array was committed:
 * the calm-phase reading lands around 1-2% of price, the expansion-phase reading lands
 * around 3-5% of price, and the expansion reading is meaningfully higher than the calm one
 * — see that constant's doc comment for the specifics. Renders via CandlestickChart's
 * existing `oscillatorPane` prop, reused without modification: ATR is a single line that
 * needs its own auto-scaled sub-pane for the same reason RSI does (its values aren't in the
 * same range as price), and the prop's `referenceLines` were already optional, so ATR is
 * simply the first user of that prop that passes none — no fixed thresholds apply to ATR the
 * way 70/30 do to RSI, since ATR has no upper or lower bound.
 *
 * Section 5 (VWAP) uses a fresh, hand-authored 27-bar series (`VWAP_INTRADAY_CANDLES`, this
 * file) — 15-minute bars across one trading session, not many days like every prior section,
 * since VWAP resets each session by definition. Two conditions were checked programmatically
 * against `calculateVWAP`'s actual output before this array was committed: the pullback
 * phase's low comes within a small tolerance of VWAP at that timestamp without any close in
 * that phase dropping below VWAP, and every bar after the pullback closes above VWAP — see
 * that constant's doc comment for the specifics. Renders via CandlestickChart's existing
 * `overlayLines` prop, the same mechanism as the SMA/EMA section — VWAP is priced in the same
 * dollar terms as the candles, so unlike RSI/ATR it shares the price scale instead of needing
 * its own sub-pane.
 *
 * All five indicators now exist. The end-of-module quiz, deferred throughout this module so
 * it could cover all of them at once instead of one quiz per section, can be built next.
 */
export function Module7TechnicalIndicators() {
  const sma20 = calculateSMA(UPTREND_EXAMPLE_CANDLES, 20);
  const ema20 = calculateEMA(UPTREND_EXAMPLE_CANDLES, 20);
  const rsi14 = calculateRSI(RSI_DIVERGENCE_CANDLES, 14);
  const macd = calculateMACD(MACD_CROSSOVER_CANDLES, 12, 26, 9);
  const atr14 = calculateATR(ATR_VOLATILITY_CANDLES, 14);
  const vwap = calculateVWAP(VWAP_INTRADAY_CANDLES);

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
          Notice the crossover (2026-02-17, price <strong>$53.30</strong>) does{' '}
          <strong>not</strong> line up with the actual low (2026-02-23, price{' '}
          <strong>$51.60</strong>) — price kept drifting lower for six more bars after MACD
          had already turned up. That's a real limitation, not a footnote: MACD is built
          from smoothed averages, so it inherently lags price, and a crossover only confirms
          a shift in momentum after it's already underway. Treating this crossover as a
          precise entry point would have meant sitting through roughly{' '}
          <strong>$1.70</strong> more of downside before the reversal actually took hold.
          Like every signal in this module, a crossover is evidence a shift may be
          happening, not a guarantee of the exact turn — and it can whipsaw back and forth
          in a choppy market the same way any other indicator can.
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

      <section>
        <h2>ATR: how big price swings are, not which direction</h2>
        <p>
          Every indicator so far — moving averages, RSI, MACD — is built from the{' '}
          <em>direction</em> of price. <strong>ATR (Average True Range)</strong> measures
          something else entirely: how <strong>big</strong> a stock's price swings have
          recently been, regardless of which way they went. It's the average, over the last
          14 candles (the standard period), of each candle's <strong>true range</strong> —
          roughly the high-to-low distance for that bar, adjusted for any gap from the prior
          close. A rising ATR means price is moving a lot bar to bar; a falling ATR means it's
          moving a little. Neither one says whether price is going up or down.
        </p>
        <p>
          That makes ATR explicitly <strong>not a directional signal</strong> — the same way
          volume in Module 5 didn't say which way price would break, ATR doesn't either. It's
          worth remembering past this module, though: ATR feeds directly into{' '}
          <strong>position sizing</strong> (Module 9), where the size of a stock's typical
          swing helps determine how many shares to trade so that a normal move doesn't blow
          past a planned risk amount. This section is the mechanism; Module 9 is where it gets
          used.
        </p>
      </section>

      <VideoEmbed
        youtubeId="NEf62LQqnQs"
        title="Master The ATR Indicator (Most Useful Indicator) — Mind Math Money"
        caption="Mind Math Money: Master The ATR Indicator (Most Useful Indicator)"
      />

      <section>
        <h2>A volatility contraction into an expansion</h2>
        <p>
          The chart below is a fresh example: 18 calm bars where price drifts in a tight
          band around <strong>$80</strong>, followed by a breakout bar on{' '}
          <strong>2026-01-29</strong> that kicks off 19 bars of much wider daily ranges as
          price trends up to about <strong>$99.60</strong>. Price direction happens to be up
          here, but that's incidental to what ATR is showing — the same expansion in ATR
          would show up just as clearly if this breakout had been to the downside.
        </p>
        <p>
          Look at the ATR(14) pane underneath. By the end of the calm stretch
          (<strong>2026-01-28</strong>), ATR(14) sits around <strong>$0.93</strong> on an
          $80.20 close — about <strong>1.2%</strong> of price, a tight, unremarkable reading.
          After the breakout, ATR(14) climbs steadily as the wider bars work their way into
          its 14-bar window. By the last bar (<strong>2026-02-25</strong>), it's grown to
          about <strong>$3.38</strong> on a $99.60 close — about <strong>3.4%</strong> of
          price, roughly <strong>3.6 times</strong> the calm-phase reading. Same stock,
          same indicator, a very different trading environment — a stop or position size that
          made sense during the calm phase would be sized wrong for the expansion phase, which
          is exactly why ATR matters for position sizing rather than just describing what
          already happened.
        </p>
        <CandlestickChart
          symbol="Example: Volatility Contraction into Expansion"
          timeframe="1d"
          candles={ATR_VOLATILITY_CANDLES}
          sourceType="simulated"
          oscillatorPane={{
            label: 'ATR(14)',
            color: '#0891b2',
            points: atr14,
          }}
        />
      </section>

      <section>
        <h2>VWAP: a running average that resets every session</h2>
        <p>
          <strong>VWAP (Volume-Weighted Average Price)</strong> looks similar to the moving
          averages from earlier in this module — it's a single line running through price —
          but it's built differently in two ways. First, it's{' '}
          <strong>volume-weighted</strong>: SMA and EMA treat every closing price as equally
          important regardless of how many shares traded at it, while VWAP weights each
          bar's price by that bar's volume, so a heavy-volume move pulls the line toward it
          harder than a quiet one. Second, VWAP <strong>resets every session</strong> — it's
          a cumulative average starting fresh at the day's open, not a trailing window of the
          last <em>N</em> bars carried over from the day before the way SMA(20) or EMA(20)
          are.
        </p>
        <p>
          Because it resets daily and needs volume data at fine granularity, VWAP is most
          commonly an <strong>intraday, day-trading tool</strong> — it doesn't mean much
          plotted across weeks the way SMA/EMA do. That said, it's still useful context for a
          swing trader: checking where a stock's current price sits relative to VWAP partway
          through the day is a quick read on intraday tone (running hot above VWAP, or cool
          and testing it) without turning this into a day-trading lesson.
        </p>
        <p>
          Like the dynamic support some traders watch in a rising moving average, VWAP gets
          watched the same way intraday — a level price tests and holds above, or fails at.
          Same hedge as everywhere else in this module: it's a level some traders watch, not
          a floor price is obligated to respect.
        </p>
      </section>

      <VideoEmbed
        youtubeId="1ERlFo0lExI"
        title="Understanding Volume-Weighted Average Price (VWAP) — TradeStation"
        caption="TradeStation: Understanding Volume-Weighted Average Price (VWAP)"
      />

      <section>
        <h2>A single session: rally, test VWAP, bounce</h2>
        <p>
          The chart below is a fresh example, and it looks different from every other chart
          in this module: instead of daily bars spanning weeks or months, these are{' '}
          <strong>15-minute bars spanning one trading session</strong> (2026-03-16,
          09:30-16:00) — the timeframe VWAP is actually built for. Price opens at{' '}
          <strong>$50.00</strong>, rallies through the morning to <strong>$51.25</strong> by
          11:45, pulls back through midday, then bounces to close the session at a new high
          of <strong>$52.88</strong>.
        </p>
        <p>
          Watch VWAP (the overlay line) during the midday pullback. At{' '}
          <strong>12:30</strong>, price dips to a low of <strong>$50.80</strong> — almost
          exactly VWAP's value at that same moment, <strong>$50.81</strong> — before closing
          that bar back up at <strong>$51.15</strong>. Price tested VWAP and held above it,
          the same "test, don't close below" pattern as the ATR section's support levels.
          From there, price never closes below VWAP again for the rest of the session, and
          by the close VWAP has only drifted up to <strong>$51.47</strong> — a cumulative
          average moves far more slowly than the price bouncing around it.
        </p>
        <CandlestickChart
          symbol="Example: Intraday Session with VWAP"
          timeframe="15m"
          candles={VWAP_INTRADAY_CANDLES}
          sourceType="simulated"
          overlayLines={[{ label: 'VWAP', color: '#ea580c', points: vwap }]}
        />
      </section>
    </article>
  );
}
