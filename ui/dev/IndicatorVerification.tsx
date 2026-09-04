import { CandlestickChart } from '../education/CandlestickChart';
import type { Candle } from '../../normalized';
import {
  calculateATR,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
} from '../education/indicators';

const DAY_MS = 86_400_000;

/**
 * Deterministic, generic OHLCV series generated only for this verification pass — not
 * exported, not a teaching example, not reused by any module. Module 4's committed uptrend
 * example is real curriculum content and stays untouched; MACD(12,26,9) alone needs 34+ bars
 * to produce a signal/histogram value, more than any committed module example has, so this
 * route generates its own bars instead of extending or repurposing shipped content.
 */
function generateSyntheticCandles(count: number): Candle[] {
  const start = Date.UTC(2026, 0, 1);
  let close = 100;
  const candles: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const open = close;
    const drift = Math.sin(i / 6) * 1.4 + 0.22;
    close = Math.round((open + drift) * 100) / 100;
    const wick = 0.3 + Math.abs(Math.sin(i * 1.7)) * 0.5;
    const high = Math.round((Math.max(open, close) + wick) * 100) / 100;
    const low = Math.round((Math.min(open, close) - wick) * 100) / 100;
    const volume = 900_000 + (i % 9) * 45_000;
    candles.push({ timestamp: start + i * DAY_MS, open, high, low, close, volume });
  }
  return candles;
}

/**
 * Throwaway verification route — not linked from the app, not part of any module. Renders
 * SMA(20)/EMA(20) overlays on a synthetic candle series and prints RSI, MACD, and ATR so the
 * math in `ui/education/indicators.ts` can be checked against a known reference before any
 * module content is built on top of it. Delete once verified.
 */
export function IndicatorVerification() {
  const candles = generateSyntheticCandles(48);
  const sma20 = calculateSMA(candles, 20);
  const ema20 = calculateEMA(candles, 20);
  const rsi14 = calculateRSI(candles, 14);
  const macd = calculateMACD(candles, 12, 26, 9);
  const atr14 = calculateATR(candles, 14);

  const fmt = (n: number) => n.toFixed(4);
  const fmtTime = (ts: number) => new Date(ts).toISOString().slice(0, 10);

  return (
    <article className="module">
      <p className="module-eyebrow">Dev · Indicator Verification</p>
      <h1>Indicator Math Verification</h1>
      <p className="module-intro">
        Uses a 48-bar synthetic candle series generated locally in this file (plain drift +
        oscillation, no specific pattern needed since this is pure arithmetic verification, not
        a teaching example). Module 4's real curriculum data is untouched. SMA(20)/EMA(20)
        render as chart overlays below; RSI/MACD/ATR print as plain numbers for cross-checking
        against a reference implementation. VWAP is intentionally skipped here — it needs real
        intraday session data that doesn't exist yet.
      </p>

      <section>
        <h2>SMA(20) / EMA(20) overlay</h2>
        <CandlestickChart
          symbol="Dev: Synthetic Series"
          timeframe="1d"
          candles={candles}
          sourceType="simulated"
          overlayLines={[
            { label: 'SMA(20)', color: '#2563eb', points: sma20 },
            { label: 'EMA(20)', color: '#dc2626', points: ema20 },
          ]}
        />
      </section>

      <section>
        <h2>RSI(14) — last 10 values</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>RSI</th>
            </tr>
          </thead>
          <tbody>
            {rsi14.slice(-10).map((p) => (
              <tr key={p.timestamp}>
                <td>{fmtTime(p.timestamp)}</td>
                <td>{fmt(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>MACD(12,26,9) — last 10 values</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>MACD</th>
              <th>Signal</th>
              <th>Histogram</th>
            </tr>
          </thead>
          <tbody>
            {macd.signalLine.slice(-10).map((sig) => {
              const macdPoint = macd.macdLine.find((m) => m.timestamp === sig.timestamp);
              const histPoint = macd.histogram.find((h) => h.timestamp === sig.timestamp);
              return (
                <tr key={sig.timestamp}>
                  <td>{fmtTime(sig.timestamp)}</td>
                  <td>{macdPoint ? fmt(macdPoint.value) : '—'}</td>
                  <td>{fmt(sig.value)}</td>
                  <td>{histPoint ? fmt(histPoint.value) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h2>ATR(14) — last 10 values</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>ATR</th>
            </tr>
          </thead>
          <tbody>
            {atr14.slice(-10).map((p) => (
              <tr key={p.timestamp}>
                <td>{fmtTime(p.timestamp)}</td>
                <td>{fmt(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>VWAP — skipped</h2>
        <p>
          <code>calculateVWAP</code> is implemented but not exercised here: it needs a real
          single-session intraday candle series (no multi-day reset logic yet), and no such data
          is committed to the repo. Known gap, not faked.
        </p>
      </section>
    </article>
  );
}
