import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SimulatedMarketDataProvider } from '../../data-providers';
import type { SourceType, WithMeta, Quote } from '../../normalized';
import { getBuyingPower, getEquity, getUnrealizedPnL } from '../../trading-engine';
import { usePaperAccount } from './usePaperAccount';
import { OrderForm } from './OrderForm';
import './PaperTradingDashboard.css';

const provider = new SimulatedMarketDataProvider();

const SOURCE_LABEL: Record<SourceType, string> = {
  'real-time': 'Real-time',
  delayed: 'Delayed',
  historical: 'Historical',
  simulated: 'Simulated',
};

const fmtMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/**
 * Paper-trading account view: cash/buying-power/equity summary, open positions with live
 * unrealized P/L, the order-entry form, and trade history. Account state and persistence come
 * from usePaperAccount (autosaves to localStorage after every fill — see that hook's docblock).
 * This is a paper account only — no brokerage connection, no real money, no order ever leaves
 * this browser (CLAUDE.md's non-negotiable rule).
 *
 * Equity and each position's unrealized P/L need a *current* price per held symbol, which this
 * component fetches itself (SimulatedMarketDataProvider.getQuote per symbol) — the engine never
 * fetches quotes on its own (see engine.ts). While those quotes are loading, equity is shown as
 * cash-only (an understatement for an account with open positions) with a note, rather than
 * blocking the page or guessing; getEquity() would throw if called with a partial price map.
 */
export function PaperTradingDashboard() {
  const { account, submitOrder, lastSaveFailed } = usePaperAccount();
  const [quotes, setQuotes] = useState<Record<string, WithMeta<Quote>>>({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

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
        <OrderForm account={account} equity={equity} onSubmit={submitOrder} />
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
