import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CandlestickChart } from '../education/CandlestickChart';
import type { IndicatorRequest, IndicatorResult, SourceType, Timeframe, WithMeta, Quote } from '../../normalized';
import { getBuyingPower, getEquity, getUnrealizedPnL } from '../../trading-engine';
import { usePaperAccount } from './usePaperAccount';
import { OrderForm, selectMarketDataProvider } from './OrderForm';
import './PaperTradingDashboard.css';

const provider = selectMarketDataProvider(import.meta.env.VITE_MARKET_DATA_PROVIDER);

const SOURCE_LABEL: Record<SourceType, string> = {
  'real-time': 'Real-time',
  delayed: 'Delayed',
  historical: 'Historical',
  simulated: 'Simulated',
};

type BottomPane = 'None' | 'RSI' | 'ATR' | 'MACD';

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '1d'];

// Fixed defaults for this round — no period-customization UI yet (see ARCHITECTURE.md Step 4).
const SMA_PERIOD = 20;
const EMA_PERIOD = 20;
const RSI_PERIOD = 14;
const ATR_PERIOD = 14;

function asNumber(value: number | Record<string, number>): number {
  return value as number;
}

const fmtMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/**
 * Paper-trading account view: cash/buying-power/equity summary, open positions with live
 * unrealized P/L, the order-entry form, and trade history. Account state and persistence come
 * from usePaperAccount (autosaves to localStorage after every fill — see that hook's docblock).
 * This is a paper account only — no brokerage connection, no real money, no order ever leaves
 * this browser (CLAUDE.md's non-negotiable rule).
 *
 * Equity and each position's unrealized P/L need a *current* price per held symbol, which this
 * component fetches itself (provider.getQuote per symbol) — the engine never fetches quotes on
 * its own (see engine.ts). The active provider is selected via VITE_MARKET_DATA_PROVIDER, same
 * as OrderForm (see selectMarketDataProvider), so the two screens can't disagree about which
 * provider is in use. While those quotes are loading, equity is shown as cash-only (an
 * understatement for an account with open positions) with a note, rather than blocking the page
 * or guessing; getEquity() would throw if called with a partial price map.
 */
export function PaperTradingDashboard() {
  const { account, submitOrder, lastSaveFailed } = usePaperAccount();
  const [quotes, setQuotes] = useState<Record<string, WithMeta<Quote>>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string>('');
  const [timeframe, setTimeframe] = useState<Timeframe>('1d');

  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showVWAP, setShowVWAP] = useState(false);
  const [bottomPane, setBottomPane] = useState<BottomPane>('None');
  const [indicators, setIndicators] = useState<IndicatorResult[]>([]);
  const [indicatorsError, setIndicatorsError] = useState<string | null>(null);

  useEffect(() => {
    const symbols = Object.keys(account.positions);
    if (symbols.length === 0) {
      setQuotes({});
      setQuotesError(null);
      return;
    }
    let cancelled = false;
    setQuotesLoading(true);
    setQuotesError(null);
    Promise.all(symbols.map((s) => provider.getQuote(s)))
      .then((results) => {
        if (cancelled) return;
        const map: Record<string, WithMeta<Quote>> = {};
        for (const q of results) map[q.symbol] = q;
        setQuotes(map);
      })
      .catch((err: unknown) => {
        if (!cancelled) setQuotesError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setQuotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [account]);

  const heldSymbols = Object.keys(account.positions).sort();

  useEffect(() => {
    if (activeSymbol === '' && heldSymbols.length > 0) {
      setActiveSymbol(heldSymbols[0]);
    }
  }, [activeSymbol, heldSymbols]);

  const allQuotesLoaded = heldSymbols.every((s) => quotes[s] !== undefined);
  const priceMap: Record<string, number> = {};
  for (const symbol of Object.keys(quotes)) priceMap[symbol] = quotes[symbol].price;

  // getEquity() requires a price for every held symbol. Safe to call here whenever there are no
  // positions (priceMap is trivially sufficient — nothing to look up) or once every held
  // symbol's quote has loaded; otherwise fall back to cash (an understatement, flagged to the
  // user via the "(updating…)" label below) rather than risk it throwing on a partial map.
  const equity = heldSymbols.length === 0 || allQuotesLoaded ? getEquity(account, priceMap) : account.cash;
  const buyingPower = getBuyingPower(account);
  const totalUnrealizedPnL =
    allQuotesLoaded && heldSymbols.length > 0
      ? heldSymbols.reduce(
          (sum, symbol) => sum + getUnrealizedPnL(account.positions[symbol], priceMap[symbol]),
          0
        )
      : undefined;

  useEffect(() => {
    const list: IndicatorRequest[] = [];
    if (showSMA) list.push({ name: 'SMA', period: SMA_PERIOD, timeframe });
    if (showEMA) list.push({ name: 'EMA', period: EMA_PERIOD, timeframe });
    if (showVWAP) list.push({ name: 'VWAP', timeframe });
    if (bottomPane === 'RSI') list.push({ name: 'RSI', period: RSI_PERIOD, timeframe });
    if (bottomPane === 'ATR') list.push({ name: 'ATR', period: ATR_PERIOD, timeframe });
    if (bottomPane === 'MACD') list.push({ name: 'MACD', timeframe });

    if (activeSymbol === '' || list.length === 0) {
      setIndicators([]);
      setIndicatorsError(null);
      return;
    }

    let cancelled = false;
    setIndicatorsError(null);
    provider
      .getIndicators(activeSymbol, list)
      .then((result) => {
        if (!cancelled) setIndicators(result.indicators);
      })
      .catch((err: unknown) => {
        if (!cancelled) setIndicatorsError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [activeSymbol, showSMA, showEMA, showVWAP, bottomPane, timeframe]);

  const overlayLines = useMemo(() => {
    const lines: { label: string; color: string; points: { timestamp: number; value: number }[] }[] = [];
    const smaResult = indicators.find((r) => r.name === 'SMA');
    if (smaResult) {
      lines.push({
        label: `SMA(${smaResult.period})`,
        color: '#2563eb',
        points: smaResult.points.map((p) => ({ timestamp: p.timestamp, value: asNumber(p.value) })),
      });
    }
    const emaResult = indicators.find((r) => r.name === 'EMA');
    if (emaResult) {
      lines.push({
        label: `EMA(${emaResult.period})`,
        color: '#f97316',
        points: emaResult.points.map((p) => ({ timestamp: p.timestamp, value: asNumber(p.value) })),
      });
    }
    const vwapResult = indicators.find((r) => r.name === 'VWAP');
    if (vwapResult) {
      lines.push({
        label: 'VWAP',
        color: '#7c3aed',
        points: vwapResult.points.map((p) => ({ timestamp: p.timestamp, value: asNumber(p.value) })),
      });
    }
    return lines;
  }, [indicators]);

  const oscillatorPane = useMemo(() => {
    if (bottomPane === 'RSI') {
      const result = indicators.find((r) => r.name === 'RSI');
      if (!result) return undefined;
      return {
        label: `RSI(${result.period})`,
        color: '#0891b2',
        points: result.points.map((p) => ({ timestamp: p.timestamp, value: asNumber(p.value) })),
        referenceLines: [
          { value: 70, label: '70', color: '#9ca3af' },
          { value: 30, label: '30', color: '#9ca3af' },
        ],
      };
    }
    if (bottomPane === 'ATR') {
      const result = indicators.find((r) => r.name === 'ATR');
      if (!result) return undefined;
      return {
        label: `ATR(${result.period})`,
        color: '#65a30d',
        points: result.points.map((p) => ({ timestamp: p.timestamp, value: asNumber(p.value) })),
      };
    }
    return undefined;
  }, [indicators, bottomPane]);

  const macdPane = useMemo(() => {
    if (bottomPane !== 'MACD') return undefined;
    const result = indicators.find((r) => r.name === 'MACD');
    if (!result) return undefined;
    const asRecord = (value: number | Record<string, number>) => value as Record<string, number>;
    return {
      macdLine: {
        label: 'MACD',
        color: '#2563eb',
        points: result.points.map((p) => ({ timestamp: p.timestamp, value: asRecord(p.value).macd })),
      },
      signalLine: {
        label: 'Signal',
        color: '#f97316',
        points: result.points.map((p) => ({ timestamp: p.timestamp, value: asRecord(p.value).signal })),
      },
      histogram: {
        points: result.points.map((p) => ({ timestamp: p.timestamp, value: asRecord(p.value).histogram })),
      },
    };
  }, [indicators, bottomPane]);

  const recentTrades = [...account.tradeHistory].reverse();

  return (
    <article className="paper-trading">
      <p className="paper-trading-eyebrow">Paper trading</p>
      <div className="paper-trading-header">
        <h1>Your paper account</h1>
        <Link to="/education" className="paper-trading-back-link">
          &larr; Back to lessons
        </Link>
      </div>
      <p className="paper-trading-disclaimer">
        Simulated money only. No brokerage is connected and no order ever leaves this browser.
      </p>

      {lastSaveFailed && (
        <p className="paper-trading-warning">
          Your last trade couldn't be saved to this browser's storage — it's still in your
          current session, but may not survive a refresh.
        </p>
      )}

      <dl className="paper-trading-summary">
        <div className="paper-trading-summary-item">
          <dt>Cash</dt>
          <dd>{fmtMoney(account.cash)}</dd>
        </div>
        <div className="paper-trading-summary-item">
          <dt>Buying power</dt>
          <dd>{fmtMoney(buyingPower)}</dd>
        </div>
        <div className="paper-trading-summary-item">
          <dt>Equity {heldSymbols.length > 0 && quotesLoading && '(updating…)'}</dt>
          <dd>{fmtMoney(equity)}</dd>
        </div>
        {totalUnrealizedPnL !== undefined && (
          <div className="paper-trading-summary-item">
            <dt>Unrealized P/L</dt>
            <dd className={totalUnrealizedPnL >= 0 ? 'paper-trading-good' : 'paper-trading-bad'}>
              {fmtMoney(totalUnrealizedPnL)}
            </dd>
          </div>
        )}
      </dl>

      {quotesError && (
        <p className="paper-trading-warning">Couldn't refresh position prices: {quotesError}</p>
      )}

      <section>
        {activeSymbol === '' ? (
          <p className="paper-trading-placeholder">
            Get a quote or hold a position to see its chart here.
          </p>
        ) : (
          <>
            <div className="paper-trading-timeframe-controls">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  aria-pressed={tf === timeframe}
                  className={
                    tf === timeframe
                      ? 'paper-trading-timeframe-btn paper-trading-timeframe-btn--active'
                      : 'paper-trading-timeframe-btn'
                  }
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="paper-trading-indicator-controls">
              <label>
                <input
                  type="checkbox"
                  checked={showSMA}
                  onChange={(e) => setShowSMA(e.target.checked)}
                />
                SMA ({SMA_PERIOD})
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showEMA}
                  onChange={(e) => setShowEMA(e.target.checked)}
                />
                EMA ({EMA_PERIOD})
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showVWAP}
                  onChange={(e) => setShowVWAP(e.target.checked)}
                />
                VWAP
              </label>
              <label className="paper-trading-bottom-pane-select">
                Bottom pane
                <select
                  value={bottomPane}
                  onChange={(e) => setBottomPane(e.target.value as BottomPane)}
                >
                  <option value="None">None</option>
                  <option value="RSI">RSI ({RSI_PERIOD})</option>
                  <option value="ATR">ATR ({ATR_PERIOD})</option>
                  <option value="MACD">MACD</option>
                </select>
              </label>
            </div>
            {indicatorsError && (
              <p className="paper-trading-warning">
                Couldn't load indicators: {indicatorsError}
              </p>
            )}
            <CandlestickChart
              symbol={activeSymbol}
              timeframe={timeframe}
              provider={provider}
              overlayLines={overlayLines.length > 0 ? overlayLines : undefined}
              oscillatorPane={oscillatorPane}
              macdPane={macdPane}
            />
          </>
        )}
      </section>

      <section>
        <h2>Open positions</h2>
        {heldSymbols.length === 0 ? (
          <p className="paper-trading-placeholder">No open positions yet.</p>
        ) : (
          <table className="paper-trading-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Avg entry</th>
                <th>Current price</th>
                <th>Unrealized P/L</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {heldSymbols.map((symbol) => {
                const position = account.positions[symbol];
                const quote = quotes[symbol];
                const unrealizedPnL = quote ? getUnrealizedPnL(position, quote.price) : undefined;
                return (
                  <tr key={symbol}>
                    <td>{symbol}</td>
                    <td>{position.quantity.toLocaleString('en-US')}</td>
                    <td>{fmtMoney(position.avgEntryPrice)}</td>
                    <td>{quote ? fmtMoney(quote.price) : '—'}</td>
                    <td className={unrealizedPnL === undefined ? undefined : unrealizedPnL >= 0 ? 'paper-trading-good' : 'paper-trading-bad'}>
                      {unrealizedPnL === undefined ? '—' : fmtMoney(unrealizedPnL)}
                    </td>
                    <td>
                      {quote && (
                        <span className={`paper-trading-source-badge paper-trading-source-badge--${quote.sourceType}`}>
                          {SOURCE_LABEL[quote.sourceType]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <OrderForm
          account={account}
          equity={equity}
          onSubmit={submitOrder}
          onQuoteSymbolChange={setActiveSymbol}
        />
      </section>

      <section>
        <h2>Trade history</h2>
        {recentTrades.length === 0 ? (
          <p className="paper-trading-placeholder">No trades yet.</p>
        ) : (
          <div className="paper-trading-history-scroll">
            <table className="paper-trading-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Shares</th>
                  <th>Price</th>
                  <th>Realized P/L</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, i) => (
                  <tr key={`${trade.timestamp}-${i}`}>
                    <td>{new Date(trade.timestamp).toLocaleString()}</td>
                    <td>{trade.symbol}</td>
                    <td className={trade.side === 'buy' ? 'paper-trading-side-buy' : 'paper-trading-side-sell'}>
                      {trade.side}
                    </td>
                    <td>{trade.quantity.toLocaleString('en-US')}</td>
                    <td>{fmtMoney(trade.price)}</td>
                    <td className={trade.realizedPnL === undefined ? undefined : trade.realizedPnL >= 0 ? 'paper-trading-good' : 'paper-trading-bad'}>
                      {trade.realizedPnL === undefined ? '—' : fmtMoney(trade.realizedPnL)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </article>
  );
}
