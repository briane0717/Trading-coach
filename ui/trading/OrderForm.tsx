import { useId, useState } from 'react';
import { SimulatedMarketDataProvider } from '../../data-providers';
import type { SourceType, WithMeta, Quote } from '../../normalized';
import { getBuyingPower } from '../../trading-engine';
import type { Account, Order, OrderResult, OrderSide } from '../../trading-engine';
import './OrderForm.css';

const provider = new SimulatedMarketDataProvider();

const SOURCE_LABEL: Record<SourceType, string> = {
  'real-time': 'Real-time',
  delayed: 'Delayed',
  historical: 'Historical',
  simulated: 'Simulated',
};

function parseNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const fmtMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const fmtPercent = (n: number) => `${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}%`;

/**
 * Order-entry form: get a quote, choose direction/quantity, review, confirm. Only market orders
 * exist in this phase (trading-engine/engine.ts's scope), so "order type" is a fixed label, not
 * a choice.
 *
 * Per CLAUDE.md's non-negotiable order-submission rule, before submission this always shows
 * symbol, direction, share count, order type, estimated price, and buying-power impact, and
 * requires an explicit confirm step. Stop/target/max-loss/%-risk/R:R are also shown, but only
 * for buys — they price the risk of a position you're opening. A sell closes an existing
 * position, where the meaningful number is realized P/L, not a stop distance, so sells show
 * that instead. Stop/target are informational only: trading-engine's Order has no stop/limit
 * fields (out of scope — see engine.ts), so they're never attached to the order that actually
 * executes, only used to compute the numbers displayed here.
 *
 * The execution price used is the quote's ask for a buy and bid for a sell (not the midpoint
 * `price`), matching how a real market order fills and giving a visible, honest cost for
 * crossing the spread — the quote already computes both, this just uses them.
 */
export function OrderForm({
  account,
  equity,
  onSubmit,
}: {
  account: Account;
  /** Current total account equity (cash + market value of all positions) — used for % account
   * risk. Computed by the caller since that already fetches quotes for every held position;
   * this form only fetches a quote for the symbol being traded. */
  equity: number;
  onSubmit: (order: Order) => OrderResult;
}) {
  const id = useId();
  const [symbolInput, setSymbolInput] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<WithMeta<Quote> | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [side, setSide] = useState<OrderSide>('buy');
  const [quantityRaw, setQuantityRaw] = useState('');
  const [stopRaw, setStopRaw] = useState('');
  const [targetRaw, setTargetRaw] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [lastResult, setLastResult] = useState<OrderResult | null>(null);

  const normalizedSymbol = symbolInput.trim().toUpperCase();
  // Only trust the fetched quote while it's still for the symbol currently typed — editing the
  // symbol after fetching invalidates it rather than silently trading the old symbol's price.
  const quoteMatchesSymbol = quote !== null && quote.symbol === normalizedSymbol;

  async function handleGetQuote() {
    if (!normalizedSymbol) return;
    setQuoteLoading(true);
    setQuoteError(null);
    setLastResult(null);
    try {
      const result = await provider.getQuote(normalizedSymbol);
      setQuote(result);
    } catch (err) {
      setQuote(null);
      setQuoteError(err instanceof Error ? err.message : String(err));
    } finally {
      setQuoteLoading(false);
    }
  }

  const executionPrice = quoteMatchesSymbol ? (side === 'buy' ? quote!.ask : quote!.bid) : undefined;
  const quantity = parseNumber(quantityRaw);
  const quantityError =
    quantityRaw.trim() !== '' && (quantity === undefined || !Number.isInteger(quantity) || quantity <= 0)
      ? 'Enter a whole number of shares greater than 0.'
      : undefined;
  const validQuantity = quantityError === undefined ? quantity : undefined;

  const heldPosition = account.positions[normalizedSymbol];
  const buyingPower = getBuyingPower(account);

  const stopNum = side === 'buy' ? parseNumber(stopRaw) : undefined;
  const stopError =
    side === 'buy' && stopRaw.trim() !== '' && executionPrice !== undefined
      ? stopNum === undefined || stopNum <= 0
        ? 'Stop must be a number greater than $0.'
        : stopNum >= executionPrice
          ? "Stop must be below the estimated buy price — a stop above entry isn't a stop for a long position."
          : undefined
      : undefined;
  const validStop = stopError === undefined ? stopNum : undefined;

  const targetNum = side === 'buy' ? parseNumber(targetRaw) : undefined;
  const targetError =
    side === 'buy' && targetRaw.trim() !== '' && (targetNum === undefined || targetNum <= 0)
      ? 'Target must be a number greater than $0.'
      : undefined;

  const orderCost =
    executionPrice !== undefined && validQuantity !== undefined ? executionPrice * validQuantity : undefined;

  const buyingPowerOk = side === 'buy' ? orderCost === undefined || orderCost <= buyingPower : true;
  const sharesHeld = heldPosition?.quantity ?? 0;
  const sharesHeldOk = side === 'sell' ? validQuantity === undefined || validQuantity <= sharesHeld : true;

  const maxLoss =
    side === 'buy' && executionPrice !== undefined && validQuantity !== undefined && validStop !== undefined
      ? (executionPrice - validStop) * validQuantity
      : undefined;
  const pctAccountRisk = maxLoss !== undefined && equity > 0 ? (maxLoss / equity) * 100 : undefined;
  const riskRewardRatio =
    side === 'buy' &&
    executionPrice !== undefined &&
    validStop !== undefined &&
    targetError === undefined &&
    targetNum !== undefined
      ? Math.abs(targetNum - executionPrice) / (executionPrice - validStop)
      : undefined;

  const estimatedRealizedPnL =
    side === 'sell' && executionPrice !== undefined && validQuantity !== undefined && heldPosition
      ? (executionPrice - heldPosition.avgEntryPrice) * validQuantity
      : undefined;

  const canReview =
    quoteMatchesSymbol &&
    validQuantity !== undefined &&
    stopError === undefined &&
    targetError === undefined;
  const canConfirm = canReview && buyingPowerOk && sharesHeldOk;

  function handleReview() {
    setLastResult(null);
    setReviewing(true);
  }

  function handleBack() {
    setReviewing(false);
  }

  function handleConfirm() {
    if (!quoteMatchesSymbol || validQuantity === undefined || executionPrice === undefined) return;
    const order: Order = {
      symbol: normalizedSymbol,
      side,
      quantity: validQuantity,
      executionPrice,
    };
    const result = onSubmit(order);
    setLastResult(result);
    if (result.ok) {
      setReviewing(false);
      setQuote(null);
      setSymbolInput('');
      setQuantityRaw('');
      setStopRaw('');
      setTargetRaw('');
    }
  }

  return (
    <div className="order-form">
      <h2>Place an order</h2>

      <div className="order-form-row">
        <div className="order-form-field">
          <label htmlFor={`${id}-symbol`}>Symbol</label>
          <input
            id={`${id}-symbol`}
            type="text"
            value={symbolInput}
            disabled={reviewing}
            onChange={(e) => {
              setSymbolInput(e.target.value);
              setLastResult(null);
            }}
            placeholder="e.g. AAPL"
          />
        </div>
        <button
          type="button"
          className="order-form-quote-btn"
          onClick={handleGetQuote}
          disabled={!normalizedSymbol || quoteLoading || reviewing}
        >
          {quoteLoading ? 'Loading…' : 'Get quote'}
        </button>
      </div>

      {quoteError && <p className="order-form-error">Couldn't fetch a quote: {quoteError}</p>}

      {quoteMatchesSymbol && (
        <div className="order-form-quote">
          <span className="order-form-quote-price">{fmtMoney(quote!.price)}</span>
          <span className="order-form-quote-detail">
            bid {fmtMoney(quote!.bid)} · ask {fmtMoney(quote!.ask)}
          </span>
          <span className={`order-form-source-badge order-form-source-badge--${quote!.sourceType}`}>
            {SOURCE_LABEL[quote!.sourceType]} data
          </span>
        </div>
      )}

      <div className="order-form-row">
        <div className="order-form-field">
          <label>Direction</label>
          <div className="order-form-side-toggle">
            <button
              type="button"
              className={side === 'buy' ? 'order-form-side-btn order-form-side-btn--active' : 'order-form-side-btn'}
              disabled={reviewing}
              onClick={() => setSide('buy')}
            >
              Buy
            </button>
            <button
              type="button"
              className={side === 'sell' ? 'order-form-side-btn order-form-side-btn--active' : 'order-form-side-btn'}
              disabled={reviewing}
              onClick={() => setSide('sell')}
            >
              Sell
            </button>
          </div>
        </div>

        <div className="order-form-field">
          <label htmlFor={`${id}-quantity`}>Shares</label>
          <input
            id={`${id}-quantity`}
            type="text"
            inputMode="numeric"
            value={quantityRaw}
            disabled={reviewing}
            onChange={(e) => {
              setQuantityRaw(e.target.value);
              setLastResult(null);
            }}
            placeholder="e.g. 10"
          />
          {quantityError && <p className="order-form-error">{quantityError}</p>}
        </div>

        <div className="order-form-field">
          <label>Order type</label>
          <p className="order-form-static-value">
            Market — this phase supports market orders only.
          </p>
        </div>
      </div>

      {side === 'sell' && quoteMatchesSymbol && (
        <p className="order-form-note">
          You hold {sharesHeld.toLocaleString('en-US')} share(s) of {normalizedSymbol}.
        </p>
      )}

      {side === 'buy' && (
        <div className="order-form-row">
          <div className="order-form-field">
            <label htmlFor={`${id}-stop`}>Stop price ($) — optional</label>
            <input
              id={`${id}-stop`}
              type="text"
              inputMode="decimal"
              value={stopRaw}
              disabled={reviewing}
              onChange={(e) => {
                setStopRaw(e.target.value);
                setLastResult(null);
              }}
              placeholder="for risk math only, not a real stop order"
            />
            {stopError && <p className="order-form-error">{stopError}</p>}
          </div>
          <div className="order-form-field">
            <label htmlFor={`${id}-target`}>Target price ($) — optional</label>
            <input
              id={`${id}-target`}
              type="text"
              inputMode="decimal"
              value={targetRaw}
              disabled={reviewing}
              onChange={(e) => {
                setTargetRaw(e.target.value);
                setLastResult(null);
              }}
              placeholder="for risk math only"
            />
            {targetError && <p className="order-form-error">{targetError}</p>}
          </div>
        </div>
      )}

      {side === 'buy' && executionPrice !== undefined && validQuantity !== undefined && (
        <dl className="order-form-risk">
          <div className="order-form-risk-row">
            <dt>Estimated cost</dt>
            <dd>{fmtMoney(orderCost!)}</dd>
          </div>
          {maxLoss !== undefined && (
            <div className="order-form-risk-row">
              <dt>Max potential loss (to stop)</dt>
              <dd>{fmtMoney(maxLoss)}</dd>
            </div>
          )}
          {pctAccountRisk !== undefined && (
            <div className="order-form-risk-row">
              <dt>% of account equity at risk</dt>
              <dd>{fmtPercent(pctAccountRisk)}</dd>
            </div>
          )}
          {riskRewardRatio !== undefined && (
            <div className="order-form-risk-row">
              <dt>Risk/reward ratio</dt>
              <dd>{riskRewardRatio.toFixed(2)}:1</dd>
            </div>
          )}
          <div className="order-form-risk-row">
            <dt>Buying-power impact</dt>
            <dd className={buyingPowerOk ? undefined : 'order-form-risk-bad'}>
              {fmtMoney(orderCost!)} of {fmtMoney(buyingPower)} available
            </dd>
          </div>
        </dl>
      )}

      {side === 'sell' && executionPrice !== undefined && validQuantity !== undefined && (
        <dl className="order-form-risk">
          <div className="order-form-risk-row">
            <dt>Estimated proceeds</dt>
            <dd>{fmtMoney(executionPrice * validQuantity)}</dd>
          </div>
          {estimatedRealizedPnL !== undefined && (
            <div className="order-form-risk-row">
              <dt>Estimated realized P/L</dt>
              <dd className={estimatedRealizedPnL >= 0 ? 'order-form-risk-good' : 'order-form-risk-bad'}>
                {fmtMoney(estimatedRealizedPnL)}
              </dd>
            </div>
          )}
          <div className="order-form-risk-row">
            <dt>Shares held</dt>
            <dd className={sharesHeldOk ? undefined : 'order-form-risk-bad'}>
              {sharesHeld.toLocaleString('en-US')}
            </dd>
          </div>
        </dl>
      )}

      {!reviewing ? (
        <button type="button" className="order-form-primary-btn" disabled={!canReview} onClick={handleReview}>
          Review order
        </button>
      ) : (
        <div className="order-form-confirm">
          <p className="order-form-confirm-summary">
            {side === 'buy' ? 'Buy' : 'Sell'} {validQuantity} share(s) of {normalizedSymbol} at an estimated{' '}
            {fmtMoney(executionPrice!)} (market order) — {fmtMoney(orderCost ?? 0)}{' '}
            {side === 'buy' ? 'cost' : 'proceeds'}.
          </p>
          {!buyingPowerOk && (
            <p className="order-form-error">
              This order costs more than your available buying power ({fmtMoney(buyingPower)}).
            </p>
          )}
          {!sharesHeldOk && (
            <p className="order-form-error">
              You only hold {sharesHeld.toLocaleString('en-US')} share(s) of {normalizedSymbol}.
            </p>
          )}
          <div className="order-form-confirm-actions">
            <button type="button" className="order-form-secondary-btn" onClick={handleBack}>
              Back
            </button>
            <button type="button" className="order-form-primary-btn" disabled={!canConfirm} onClick={handleConfirm}>
              Confirm & submit
            </button>
          </div>
        </div>
      )}

      {lastResult && !lastResult.ok && <p className="order-form-error">Order rejected: {lastResult.reason}</p>}
      {lastResult && lastResult.ok && (
        <p className="order-form-success">
          Filled: {lastResult.trade.side} {lastResult.trade.quantity} {lastResult.trade.symbol} @{' '}
          {fmtMoney(lastResult.trade.price)}.
        </p>
      )}
    </div>
  );
}
