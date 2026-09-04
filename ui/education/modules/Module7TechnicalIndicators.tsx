import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import { calculateEMA, calculateSMA } from '../indicators';
import { UPTREND_EXAMPLE_CANDLES } from './Module4TrendAndPriceAction';

/**
 * Education · Module 7, section 1 of 5: Moving Averages. Introduces SMA and EMA as the
 * first technical indicator, using `ui/education/indicators.ts` (the thin wrapper around
 * `data-providers/internal/indicators.ts` — see that file's header for why this is the
 * single place in the repo computing this math) and CandlestickChart's `overlayLines`
 * prop. Reuses Module 4's `UPTREND_EXAMPLE_CANDLES` rather than generating a new series,
 * so the same chart already familiar from swing-high/swing-low teaching now carries
 * moving-average lines too. Deliberately stops short of a crossover example — two MAs of
 * different lengths crossing is exactly what MACD (a later section of this module) does,
 * so that mechanic is taught once, there, instead of twice.
 *
 * RSI, MACD, ATR, and VWAP are separate sections still to be added. The end-of-module quiz
 * is deferred until all five indicators exist, so it can cover all of them at once instead
 * of one quiz per section.
 */
export function Module7TechnicalIndicators() {
  const sma20 = calculateSMA(UPTREND_EXAMPLE_CANDLES, 20);
  const ema20 = calculateEMA(UPTREND_EXAMPLE_CANDLES, 20);

  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 7</p>
      <h1>Technical Indicators: Moving Averages</h1>
      <p className="module-intro">
        Everything so far — swing highs and lows, trend, volume, support and resistance —
        has come straight from reading the raw candles. Starting with this module, we add{' '}
        <strong>indicators</strong>: values calculated from price (and sometimes volume)
        that summarize something the raw candles make you eyeball for yourself. Module 7
        covers five of them across separate sections; this one starts with the simplest and
        most widely used — the moving average.
      </p>

      <section>
        <h2>What a moving average is</h2>
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
    </article>
  );
}
