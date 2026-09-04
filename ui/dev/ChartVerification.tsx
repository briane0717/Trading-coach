import { useState } from 'react';
import { CandlestickChart } from '../education/CandlestickChart';
import type { Timeframe } from '../../normalized';

const SYMBOLS = ['ACME', 'ZETA'];
const TIMEFRAMES: Timeframe[] = ['5m', '15m', '1h', '1d'];

/**
 * Temporary verification page for CandlestickChart — confirms it renders real candles
 * from SimulatedMarketDataProvider before Module 3 content is built around it. The
 * symbol/timeframe buttons exist only to exercise prop-change behavior during this
 * verification pass. Not linked from navigation; not part of the education module registry.
 */
export function ChartVerification() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>(TIMEFRAMES[0]);

  return (
    <article className="module">
      <p className="module-eyebrow">Dev · Verification</p>
      <h1>Candlestick Chart Verification</h1>
      <p className="module-intro">
        Temporary page to confirm CandlestickChart renders simulated OHLC data correctly.
        Remove once Module 3 is built.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {SYMBOLS.map((s) => (
          <button key={s} onClick={() => setSymbol(s)} disabled={s === symbol}>
            {s}
          </button>
        ))}
        {TIMEFRAMES.map((tf) => (
          <button key={tf} onClick={() => setTimeframe(tf)} disabled={tf === timeframe}>
            {tf}
          </button>
        ))}
      </div>
      <CandlestickChart symbol={symbol} timeframe={timeframe} />
    </article>
  );
}
