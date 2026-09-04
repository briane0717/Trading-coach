import { useState } from 'react';
import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';
import { CandlestickChart } from '../CandlestickChart';
import type { Timeframe } from '../../../normalized';

const TIMEFRAMES: Timeframe[] = ['5m', '15m', '1h', '1d'];

const quizQuestions: QuizQuestion[] = [
  {
    id: 'body-meaning',
    prompt: "On a candlestick chart, what do the top and bottom of a candle's thick 'body' represent?",
    choices: [
      'The highest and lowest prices reached during the period',
      "The open and close prices for the period — whichever pair is highest/lowest",
      "The bid and ask at the end of the period",
      "The average price and the day's volume",
    ],
    correctIndex: 1,
    explanation:
      "The body spans the open and close prices — the two prices that bound where the period started and ended. Which one is on top depends on whether the price went up or down over the period. The highest and lowest prices reached are shown separately, by the thin lines above and below the body.",
  },
  {
    id: 'wick-meaning',
    prompt: 'What do the thin lines sticking out above and below a candle\'s body (the "wicks," or "shadows") represent?',
    choices: [
      'A prediction of where the price is likely to go next',
      'The bid-ask spread at that moment',
      'The highest and lowest prices the stock actually traded at during the period, beyond the open/close',
      'Nothing — they are a decorative convention with no data behind them',
    ],
    correctIndex: 2,
    explanation:
      "Wicks show the full range the price actually reached during the period, even if it didn't stay there. A stock can spike well above its close, or dip well below its open, and pull back before the period ends — the wick is the only part of the candle that records that it happened at all.",
  },
  {
    id: 'candle-color',
    prompt: 'A candle is colored green (or unfilled/white, depending on the chart). What does that tell you happened during that period?',
    choices: [
      'The stock closed higher than it opened',
      'The stock closed lower than it opened',
      'The stock hit a new all-time high during the period',
      "The period had unusually high volume",
    ],
    correctIndex: 0,
    explanation:
      "Color is just a fast visual read on direction: close above open is colored one way (commonly green), close below open the other way (commonly red). It says nothing on its own about volume, new highs, or anything beyond where the period started versus where it ended.",
  },
  {
    id: 'timeframe-meaning',
    prompt: "What does a chart's \"timeframe\" (like 5m or 1d) actually control?",
    choices: [
      'How far back in history the chart goes',
      "How much time each individual candle summarizes — 5 minutes of trading squeezed into one candle, versus a full trading day squeezed into one candle",
      'Whether the data shown is real or simulated',
      "The color scheme used for up versus down candles",
    ],
    correctIndex: 1,
    explanation:
      "Timeframe sets the aggregation window per candle. A 5-minute candle takes every trade in a 5-minute window and boils it down to one open, high, low, and close. A 1-day candle does the exact same thing, just over a full trading day's worth of trades instead. Same underlying trades, different-sized buckets.",
  },
  {
    id: 'same-stock-different-timeframes',
    prompt:
      'You look at the same stock on a 5-minute chart and a 1-day chart, covering the same trading day. The 1-day chart shows just one candle for that whole day; the 5-minute chart shows dozens. Why do they look so different even though they\'re built from the exact same trades?',
    choices: [
      'They aren\'t really built from the same data — each timeframe uses a separate data source',
      'The 1-day candle compresses the entire day into a single open/high/low/close, hiding the smaller ups and downs that the 5-minute candles show individually',
      'The 5-minute chart is more accurate, and the 1-day chart is a rounded approximation',
      'The 1-day chart only shows the last hour of trading, while the 5-minute chart shows the whole day',
    ],
    correctIndex: 1,
    explanation:
      "Both charts are built from the same underlying trades — they just group them differently. Zoomed into 5-minute buckets, you can see every wiggle: a dip mid-morning, a rally into the afternoon, and so on. Zoomed out to one candle per day, all of that detail gets flattened into a single open, high, low, and close for the entire session. Neither view is more \"accurate\" — they're just different resolutions of the same information, useful for different purposes.",
  },
];

/**
 * Education · Module 3. Builds on Module 1 (what a stock is) and Module 2 (reading a
 * quote) to cover how a single candle encodes open/high/low/close and how timeframe
 * controls how much trading gets aggregated into each candle. Uses CandlestickChart
 * against SimulatedMarketDataProvider — the chart's own badge already labels the data
 * as simulated, per CLAUDE.md.
 */
export function Module3ChartsAndCandlesticks() {
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');

  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 3</p>
      <h1>Charts &amp; Candlesticks</h1>
      <p className="module-intro">
        Module 2 covered the numbers in a single quote — last, bid, ask, volume. A chart is
        what you get when you take those numbers and plot them over time, one period at a
        time. The most common way to plot each period is a <strong>candlestick</strong> — a
        small shape that packs four prices into one glance. This module covers how to read
        one, and how the same stock can look completely different depending on how much time
        each candle represents.
      </p>

      <section>
        <h2>What one candle represents</h2>
        <p>
          Every candle summarizes one period of trading — it could be one minute, one hour,
          one day, anything — using four prices you already know from Module 2: the price
          when the period <strong>opened</strong>, the price when it <strong>closed</strong>,
          and the <strong>highest</strong> and <strong>lowest</strong> prices traded anywhere
          in between. Those four prices are usually called <strong>OHLC</strong> — open,
          high, low, close.
        </p>
        <p>
          A candle has two parts. The thick <strong>body</strong> spans the open and the
          close — whichever is higher sets the top of the body, whichever is lower sets the
          bottom. The thin lines above and below the body, called <strong>wicks</strong> (or
          shadows), reach up to the period's high and down to its low — showing you the full
          range the price touched, even the parts it didn't stay at.
        </p>
        <p>
          Color is a shortcut for direction. If the close is above the open, the candle is
          typically colored green (or left unfilled/white on some charts) — the price ended
          the period higher than it started. If the close is below the open, it's typically
          colored red (or filled black) — the price ended lower than it started. Nothing
          more than that: color tells you which way the period went, not how big the move
          was or how volatile the period was — for that, you look at the size of the body
          and the length of the wicks.
        </p>
      </section>

      <VideoEmbed
        youtubeId="myUKta-wicQ"
        title="How to Read Candlestick Shapes & Charts (with ZERO experience) — Ross Cameron, Warrior Trading"
        caption="Ross Cameron, Warrior Trading: How to Read Candlestick Shapes & Charts"
      />

      <section>
        <h2>What a "timeframe" means</h2>
        <p>
          Every candle covers a fixed slice of time called its <strong>timeframe</strong> —
          5 minutes, 1 hour, 1 day, and so on. The timeframe controls how much trading gets
          squeezed into a single candle. A 5-minute candle takes every trade in one 5-minute
          window and reduces it to one open, high, low, and close. A 1-day candle does the
          identical thing, just over an entire trading session's worth of trades instead of
          five minutes of them.
        </p>
        <p>
          That's why the same stock can look completely different on two different
          timeframes, even though both charts are built from the exact same underlying
          trades. Zoomed into 5-minute candles, you see every dip and rally as its own shape
          — dozens of candles across one trading day. Zoomed out to 1-day candles, that same
          day becomes a single candle: all of the morning's wiggles and the afternoon's moves
          get flattened into just one open, high, low, and close for the whole session. Zoom
          out further to weekly or monthly candles, and even multi-day swings get compressed
          into single shapes.
        </p>
        <p>
          Neither view is "more correct" than the other — they're the same trades, viewed at
          different resolutions. A short timeframe is useful for seeing what's happening
          right now; a long timeframe is useful for seeing the bigger trend a stock has been
          on.
        </p>
      </section>

      <VideoEmbed
        youtubeId="OvD0loUTL7U"
        title="Time Frames Explained in Trading (1m, 5m, 1H, 4H, Daily) — omotech360"
        caption="omotech360: Time Frames Explained in Trading (1m, 5m, 1H, 4H, Daily)"
      />

      <section>
        <h2>Try it: the same stock, different timeframes</h2>
        <p>
          Below is <strong>ACME</strong> — the same made-up stock from Module 2's quote
          example — plotted as real candles instead of a single quote snapshot. Switch the
          timeframe and watch the same underlying price history reshape into a different
          number of candles, each summarizing a different-sized window of trading.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {TIMEFRAMES.map((tf) => (
            <button key={tf} onClick={() => setTimeframe(tf)} disabled={tf === timeframe}>
              {tf}
            </button>
          ))}
        </div>
        <CandlestickChart symbol="ACME" timeframe={timeframe} />
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
