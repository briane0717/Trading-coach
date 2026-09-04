import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'last-vs-bid-vs-ask',
    prompt:
      "A quote shows: last 84.10, bid 84.05, ask 84.15. If you place a market order to buy right now, what price will you most likely pay, and why?",
    choices: [
      '84.10, because that was the last traded price',
      '84.05, because that is the highest price a buyer is offering',
      '84.15, because that is the lowest price a seller is currently willing to accept, and buying pays the ask',
      'Some price above 84.15, because buying always costs more than the ask',
    ],
    correctIndex: 2,
    explanation:
      "Buying pays the ask — the lowest price a seller will currently accept. The last price is just what the most recent trade happened to be; it isn't necessarily what you'll pay next, since the bid and ask can have moved since then.",
  },
  {
    id: 'spread-calc',
    prompt: 'A stock is quoted with a bid of $12.85 and an ask of $12.98. What is the spread?',
    choices: ['$0.13', '$25.83', '$12.85', '$0.07'],
    correctIndex: 0,
    explanation: 'Spread = ask − bid = $12.98 − $12.85 = $0.13.',
  },
  {
    id: 'spread-as-cost',
    prompt:
      "You buy a stock at the ask and immediately sell it back at the bid, with no price movement at all in between. What happens to your money, and why?",
    choices: [
      'You break even, since you bought and sold the same stock',
      'You lose money equal to the spread, because you bought at the higher ask and sold at the lower bid',
      'You make money equal to the spread, because you completed a full round trip',
      "Nothing happens until the next day's closing price is set",
    ],
    correctIndex: 1,
    explanation:
      "You paid the ask going in and received the bid going out — those are two different prices, and the ask is always the higher of the two. That gap is the spread, and it comes straight out of your pocket even though no one sent you a bill for it. It's a real cost of trading, not just a number on a screen.",
  },
  {
    id: 'volume-signal',
    prompt:
      "A stock jumps 4% in a single day. Which scenario should make you take that move more seriously as reflecting genuine, broad conviction rather than a fluke?",
    choices: [
      'The move happens on volume far above the stock’s normal daily volume',
      'The move happens on volume far below the stock’s normal daily volume',
      'Volume has no bearing on how seriously to take a price move',
      'The move happens right at the market open, regardless of volume',
    ],
    correctIndex: 0,
    explanation:
      "A move on unusually heavy volume means a lot of shares changed hands to get there — a broad group of participants agreed enough to trade. The same move on unusually light volume could just be a handful of trades nudging the price around, which is much easier to dismiss or reverse.",
  },
  {
    id: 'why-low-volume-wider-spread',
    prompt: 'Why do low-volume stocks tend to have wider bid-ask spreads than high-volume stocks?',
    choices: [
      'Regulators set wider spreads for smaller companies by rule',
      "Whoever takes the other side of a trade in a low-volume stock is taking on more risk, since they may have to hold the position longer before another trade comes along to offset it — they widen the spread to be paid for that risk",
      'Low-volume stocks are always priced higher in dollar terms, which mechanically produces a bigger spread',
      'Spreads are random and unrelated to how frequently a stock trades',
    ],
    correctIndex: 1,
    explanation:
      "The spread compensates whoever is on the other side of your trade for the risk of holding a position that might sit for a while before the next buyer or seller shows up. In a high-volume stock, the next trade is usually seconds away, so that risk is small and the spread can stay tight. In a low-volume stock, it might take much longer to find the next trade, so the spread widens to compensate for that added risk.",
  },
];

export function Module2ReadingAQuote() {
  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 2</p>
      <h1>Reading a Quote</h1>
      <p className="module-intro">
        Pull up any stock and you'll see a handful of numbers next to its name. It's tempting to
        think of "the price" as a single number, but a real quote is actually a small snapshot
        made of several numbers, each telling you something different. This module walks through
        that snapshot, field by field.
      </p>

      <section>
        <h2>A quote is more than one number</h2>
        <p>
          When people say "the price" of a stock, they usually mean one specific number, but a
          live quote is really a bundle of related figures shown together. The four you'll see on
          almost every quote are the <strong>last price</strong>, the <strong>bid</strong>, the{' '}
          <strong>ask</strong>, and the <strong>volume</strong>.
        </p>
        <p>
          Each of these answers a different question: what did this stock just trade at, what
          could you sell it for right now, what would it cost you to buy it right now, and how
          much of it has actually changed hands. Treating all four as interchangeable — or
          collapsing them into one vague idea of "the price" — is how quotes end up feeling more
          confusing than they need to be. Taken one at a time, each is simple.
        </p>
      </section>

      <section>
        <h2>Last price vs. bid vs. ask</h2>
        <p>
          The <strong>last price</strong> is exactly what it sounds like: the price at which the
          most recent completed trade happened. It's already history by the time you see it —
          maybe by a fraction of a second, maybe by longer if the stock trades infrequently. It
          tells you where the stock has been, not necessarily where your next trade will happen.
        </p>
        <p>
          The <strong>bid</strong> is the highest price a buyer is currently willing to pay for
          the stock. The <strong>ask</strong> (sometimes called the "offer") is the lowest price a
          seller is currently willing to accept. These two numbers exist at the same time, sitting
          on opposite sides of the last price, and they're what actually determine what happens
          next if you try to trade immediately.
        </p>
        <p>
          If you want to sell right now, you sell into the bid — you get the price a buyer is
          already offering. If you want to buy right now, you pay the ask — you meet the price a
          seller is already asking for. This is why the price you actually get, buying or selling,
          can differ slightly from whatever the last price happened to show.
        </p>
      </section>

      <VideoEmbed
        youtubeId="1LNgRcjY_lo"
        title="What Is the Bid-Ask Spread? | Order Book & Trading Impact — Ryan O'Connell, CFA, FRM"
        caption="Ryan O'Connell, CFA, FRM: What Is the Bid-Ask Spread?"
      />

      <section>
        <h2>The spread</h2>
        <p>
          The gap between the ask and the bid has a name: the <strong>spread</strong>.
        </p>
        <p className="module-formula">spread = ask − bid</p>
        <p>
          Say a stock is quoted with a bid of $50.00 and an ask of $50.10. The spread is
          $50.10 − $50.00 = $0.10. If you bought right now at the ask and, with no price
          movement at all, immediately sold back at the bid, you'd hand back $0.10 per share —
          not because the stock moved, but purely because buying and selling cross the spread in
          opposite directions.
        </p>
        <p>
          Nobody sends you an invoice for this. There's no line item called "spread cost" on your
          trade confirmation. But it's a real cost of trading all the same — it's built into the
          two prices themselves, quietly there every time you cross from one side to the other.
          The wider the spread, the more it costs just to get in and back out of a position, even
          if the stock hasn't moved at all in between.
        </p>
      </section>

      <section>
        <h2>Volume</h2>
        <p>
          <strong>Volume</strong> is the number of shares that have actually traded over a given
          period — usually shown as the running total for the current trading day so far. Where
          the bid and ask tell you about right now, volume tells you how much activity has
          actually happened.
        </p>
        <p>
          Volume gives you a way to judge how much to trust a price move. If a stock jumps on
          volume that's well above its normal daily amount, that suggests a lot of participants
          are involved and broadly agree the move is justified — real conviction behind it. The
          exact same-sized jump on unusually low volume is easier to dismiss: it might just be a
          small number of trades nudging the price around, without much broader agreement behind
          it.
        </p>
        <p>
          Volume also shapes what it's like to trade a stock day to day. Stocks with consistently
          high volume tend to be easier to buy or sell without moving the price much yourself,
          and they tend to have tighter spreads — there's almost always another buyer or seller
          nearby, so whoever takes the other side of your trade isn't taking on much risk holding
          it. Low-volume stocks tend to have wider spreads for the opposite reason: whoever takes
          the other side of your trade might be stuck holding that position for a while before the
          next trade comes along to offset it, and the wider spread is how they get compensated
          for taking on that risk.
        </p>
      </section>

      <section>
        <h2>Putting it together</h2>
        <p>Here's a sample quote for a made-up stock, "ACME":</p>
        <p className="module-formula">
          last 41.22 · bid 41.18 · ask 41.24 · volume 2,340,000
        </p>
        <p>
          The <strong>last price</strong> of 41.22 tells you where the most recent trade happened
          — that trade is already done and doesn't guarantee anything about your next one. The{' '}
          <strong>bid</strong> of 41.18 is what you'd get right now if you sold, and the{' '}
          <strong>ask</strong> of 41.24 is what you'd pay right now if you bought.
        </p>
        <p>
          The <strong>spread</strong> here is 41.24 − 41.18 = $0.06 — a fairly tight spread as a
          fraction of a $41 stock, which is a mild signal on its own that this is a fairly liquid,
          actively traded name.
        </p>
        <p>
          The <strong>volume</strong> of 2,340,000 shares only means something in context: is that
          high or low for ACME specifically, compared to its normal day? If 2,340,000 is well
          above ACME's typical volume, and the stock has moved meaningfully today, that combination
          — a real price move, on unusually heavy volume, with a tight spread — points toward a
          liquid stock where a lot of participants are actively involved right now, not a quiet
          name drifting on a handful of trades.
        </p>
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
