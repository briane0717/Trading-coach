import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import { calculateEMA, calculateRSI, calculateSMA } from '../indicators';
import { UPTREND_EXAMPLE_CANDLES } from './Module4TrendAndPriceAction';
import type { Candle } from '../../../normalized';

/**
 * Fresh, hand-authored series built only for this module's RSI section — not reused from
 * any prior module. Constructed in four phases (a flat lead-in, a strong low-pullback rally,
 * a pullback, then a choppier/weaker second rally that grinds to a higher price high) so it
 * exhibits bearish RSI divergence: RSI(14) > 70 at the first swing high (2026-01-23, high
 * 125.32, RSI ~98.15), then a second swing high on 2026-03-01 (high 125.75 — a higher price)
 * whose RSI(14) is only ~81.87 — lower than the first high's, despite the higher price. All
 * three conditions were checked against `calculateRSI`'s real output before this array was
 * finalized (see the generation/verification script noted in this section's commit); this
 * is the exact array that passed.
 */
const RSI_DIVERGENCE_CANDLES: Candle[] = [
  { timestamp: 1767571200000, open: 100, high: 100.49, low: 99.81, close: 100.3, volume: 960000 },
  { timestamp: 1767657600000, open: 100.3, high: 100.48, low: 99.92, close: 100.1, volume: 940000 },
  { timestamp: 1767744000000, open: 100.1, high: 100.71, low: 99.89, close: 100.5, volume: 980000 },
  { timestamp: 1767830400000, open: 100.5, high: 100.7, low: 100.01, close: 100.2, volume: 960000 },
  { timestamp: 1767916800000, open: 100.2, high: 100.58, low: 100.02, close: 100.4, volume: 940000 },
  { timestamp: 1768003200000, open: 100.4, high: 102.28, low: 100.03, close: 101.9, volume: 1200000 },
  { timestamp: 1768089600000, open: 101.9, high: 104.12, low: 101.48, close: 103.7, volume: 1260000 },
  { timestamp: 1768176000000, open: 103.7, high: 105.69, low: 103.31, close: 105.3, volume: 1220000 },
  { timestamp: 1768262400000, open: 105.3, high: 107.75, low: 104.85, close: 107.3, volume: 1300000 },
  { timestamp: 1768348800000, open: 107.3, high: 109.41, low: 106.9, close: 109, volume: 1240000 },
  { timestamp: 1768435200000, open: 109, high: 111.34, low: 108.57, close: 110.9, volume: 1280000 },
  { timestamp: 1768521600000, open: 110.9, high: 112.78, low: 110.53, close: 112.4, volume: 1200000 },
  { timestamp: 1768608000000, open: 112.4, high: 114.62, low: 111.98, close: 114.2, volume: 1260000 },
  { timestamp: 1768694400000, open: 114.2, high: 116.19, low: 113.81, close: 115.8, volume: 1220000 },
  { timestamp: 1768780800000, open: 115.8, high: 118.37, low: 115.34, close: 117.9, volume: 1320000 },
  { timestamp: 1768867200000, open: 117.9, high: 120.01, low: 117.5, close: 119.6, volume: 1240000 },
  { timestamp: 1768953600000, open: 119.6, high: 121.94, low: 119.17, close: 121.5, volume: 1280000 },
  { timestamp: 1769040000000, open: 121.5, high: 123.49, low: 121.11, close: 123.1, volume: 1220000 },
  { timestamp: 1769126400000, open: 123.1, high: 125.32, low: 122.68, close: 124.9, volume: 1260000 },
  { timestamp: 1769212800000, open: 124.9, high: 125.23, low: 123.37, close: 123.7, volume: 1140000 },
  { timestamp: 1769299200000, open: 123.7, high: 124.08, low: 121.83, close: 122.2, volume: 1200000 },
  { timestamp: 1769385600000, open: 122.2, high: 122.55, low: 120.56, close: 120.9, volume: 1160000 },
  { timestamp: 1769472000000, open: 120.9, high: 121.2, low: 119.6, close: 119.9, volume: 1100000 },
  { timestamp: 1769558400000, open: 119.9, high: 120.17, low: 118.83, close: 119.1, volume: 1060000 },
  { timestamp: 1769644800000, open: 119.1, high: 119.42, low: 117.69, close: 118, volume: 1120000 },
  { timestamp: 1769731200000, open: 118, high: 118.29, low: 116.82, close: 117.1, volume: 1080000 },
  { timestamp: 1769817600000, open: 117.1, high: 117.34, low: 116.26, close: 116.5, volume: 1020000 },
  { timestamp: 1769904000000, open: 116.5, high: 116.71, low: 115.89, close: 116.1, volume: 980000 },
  { timestamp: 1769990400000, open: 116.1, high: 116.29, low: 115.61, close: 115.8, volume: 960000 },
  { timestamp: 1770076800000, open: 115.8, high: 116.64, low: 115.56, close: 116.4, volume: 1020000 },
  { timestamp: 1770163200000, open: 116.4, high: 116.63, low: 115.68, close: 115.9, volume: 1000000 },
  { timestamp: 1770249600000, open: 115.9, high: 116.63, low: 115.68, close: 116.4, volume: 1000000 },
  { timestamp: 1770336000000, open: 116.4, high: 116.61, low: 115.79, close: 116, volume: 980000 },
  { timestamp: 1770422400000, open: 116, high: 116.84, low: 115.76, close: 116.6, volume: 1020000 },
  { timestamp: 1770508800000, open: 116.6, high: 116.79, low: 116.11, close: 116.3, volume: 960000 },
  { timestamp: 1770595200000, open: 116.3, high: 116.91, low: 116.09, close: 116.7, volume: 980000 },
  { timestamp: 1770681600000, open: 116.7, high: 116.9, low: 116.21, close: 116.4, volume: 960000 },
  { timestamp: 1770768000000, open: 116.4, high: 117.13, low: 116.18, close: 116.9, volume: 1000000 },
  { timestamp: 1770854400000, open: 116.9, high: 117.08, low: 116.52, close: 116.7, volume: 940000 },
  { timestamp: 1770940800000, open: 116.7, high: 117.31, low: 116.49, close: 117.1, volume: 980000 },
  { timestamp: 1771027200000, open: 117.1, high: 117.28, low: 116.72, close: 116.9, volume: 940000 },
  { timestamp: 1771113600000, open: 116.9, high: 117.63, low: 116.68, close: 117.4, volume: 1000000 },
  { timestamp: 1771200000000, open: 117.4, high: 117.58, low: 117.02, close: 117.2, volume: 940000 },
  { timestamp: 1771286400000, open: 117.2, high: 117.7, low: 117.01, close: 117.5, volume: 960000 },
  { timestamp: 1771372800000, open: 117.5, high: 117.67, low: 117.24, close: 117.4, volume: 920000 },
  { timestamp: 1771459200000, open: 117.4, high: 118.01, low: 117.19, close: 117.8, volume: 980000 },
  { timestamp: 1771545600000, open: 117.8, high: 117.97, low: 117.54, close: 117.7, volume: 920000 },
  { timestamp: 1771632000000, open: 117.7, high: 119.58, low: 117.33, close: 119.2, volume: 1200000 },
  { timestamp: 1771718400000, open: 119.2, high: 119.4, low: 118.71, close: 118.9, volume: 960000 },
  { timestamp: 1771804800000, open: 118.9, high: 120.89, low: 118.51, close: 120.5, volume: 1220000 },
  { timestamp: 1771891200000, open: 120.5, high: 120.7, low: 120.01, close: 120.2, volume: 960000 },
  { timestamp: 1771977600000, open: 120.2, high: 122.31, low: 119.8, close: 121.9, volume: 1240000 },
  { timestamp: 1772064000000, open: 121.9, high: 122.08, low: 121.52, close: 121.7, volume: 940000 },
  { timestamp: 1772150400000, open: 121.7, high: 123.46, low: 121.34, close: 123.1, volume: 1180000 },
  { timestamp: 1772236800000, open: 123.1, high: 124.4, low: 122.8, close: 124.1, volume: 1100000 },
  { timestamp: 1772323200000, open: 124.1, high: 125.75, low: 123.76, close: 125.4, volume: 1160000 },
  { timestamp: 1772409600000, open: 125.4, high: 125.69, low: 124.22, close: 124.5, volume: 1080000 },
  { timestamp: 1772496000000, open: 124.5, high: 124.76, low: 123.55, close: 123.8, volume: 1040000 },
  { timestamp: 1772582400000, open: 123.8, high: 124.03, low: 123.08, close: 123.3, volume: 1000000 },
];

/**
 * Education · Module 7, sections 1-2 of 5: Moving Averages, then RSI. Both use
 * `ui/education/indicators.ts` (the thin wrapper around `data-providers/internal/indicators.ts`
 * — see that file's header for why this is the single place in the repo computing this math).
 *
 * Section 1 (Moving Averages) reuses Module 4's `UPTREND_EXAMPLE_CANDLES` via
 * CandlestickChart's `overlayLines` prop, so the same chart already familiar from
 * swing-high/swing-low teaching now carries moving-average lines too. Deliberately stops
 * short of a crossover example — two MAs of different lengths crossing is exactly what
 * MACD (a later section) does, so that mechanic is taught once, there, instead of twice.
 *
 * Section 2 (RSI) uses a fresh, hand-authored ~59-bar series (`RSI_DIVERGENCE_CANDLES`,
 * this file) built specifically to show bearish divergence: RSI(14) crosses above 70 into
 * the first swing high, then a second, higher swing high prints with a lower RSI reading —
 * momentum fading even as price makes new highs. The three conditions that make that claim
 * true (RSI > 70 at the first high; second high's price above the first; second high's RSI
 * below the first's) were checked programmatically against `calculateRSI`'s actual output
 * before this array was committed — see the verification script referenced in the commit
 * that added this section. Renders via CandlestickChart's `oscillatorPane` prop (added
 * alongside this section), which gives RSI its own 0-100 sub-pane instead of sharing the
 * price scale.
 *
 * MACD, ATR, and VWAP are separate sections still to be added. The end-of-module quiz is
 * deferred until all five indicators exist, so it can cover all of them at once instead of
 * one quiz per section.
 */
export function Module7TechnicalIndicators() {
  const sma20 = calculateSMA(UPTREND_EXAMPLE_CANDLES, 20);
  const ema20 = calculateEMA(UPTREND_EXAMPLE_CANDLES, 20);
  const rsi14 = calculateRSI(RSI_DIVERGENCE_CANDLES, 14);

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
          high (2026-01-23, price <strong>$125.32</strong>), RSI reads about{' '}
          <strong>98</strong> — deep into overbought territory, reflecting the relentless,
          almost uninterrupted rally that got it there. At the <strong>second</strong> swing
          high (2026-03-01, price <strong>$125.75</strong> — a new high), RSI reads only
          about <strong>82</strong>. Price made more progress the second time. Momentum did
          not — the second rally took longer, ground higher in a choppier, more
          interrupted climb, and RSI never came close to matching its earlier reading.
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
    </article>
  );
}
