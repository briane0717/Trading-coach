import { Quiz, type QuizQuestion } from '../Quiz';
import { VideoEmbed } from '../VideoEmbed';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'ownership',
    prompt: "What does owning one share of a company's stock actually represent?",
    choices: [
      'A loan you gave the company that it has to pay back with interest',
      'A small ownership stake in the company',
      "A coupon for discounts on the company's products",
      'A guarantee of a job at the company',
    ],
    correctIndex: 1,
    explanation:
      "A share is a unit of ownership. Owning one makes you a partial owner of the company — not a lender, and not a customer with a discount card.",
  },
  {
    id: 'why-issue',
    prompt: 'Why do companies sell shares to the public in the first place?',
    choices: [
      "To raise money for the business without taking on debt it has to repay",
      "Because it's legally required, for tax purposes",
      "To lower how much tax the company pays",
      'To give away free products to shareholders',
    ],
    correctIndex: 0,
    explanation:
      "Selling shares raises money (capital) the company can use to grow — hire people, build products, expand — without borrowing it and owing interest on it.",
  },
  {
    id: 'market-cap-calc',
    prompt:
      'A company has 10 million shares outstanding, and each share trades at $20. What is its market cap?',
    choices: ['$20', '$10 million', '$200 million', '$2 billion'],
    correctIndex: 2,
    explanation: 'Market cap = share price × total shares outstanding. 10,000,000 × $20 = $200,000,000.',
  },
  {
    id: 'market-cap-meaning',
    prompt: 'What does "market cap" actually measure?',
    choices: [
      'How much profit the company made last year',
      "The market's current estimate of what the whole company is worth",
      'How many employees the company has',
      "The company's total cash in the bank",
    ],
    correctIndex: 1,
    explanation:
      "Market cap is what all outstanding shares are worth at the current price — the market's live estimate of the whole company's value. It isn't profit, headcount, or cash on hand directly, though those things can influence it.",
  },
  {
    id: 'why-prices-move',
    prompt: "What's the main reason a stock's price moves up or down day to day?",
    choices: [
      'The government resets it every morning',
      "It only changes once a year, when the company reports earnings",
      'Buyers and sellers trading at whatever price they currently agree on, which shifts as expectations about the company change',
      'The stock exchange picks a new random price each day',
    ],
    correctIndex: 2,
    explanation:
      "Prices move from ordinary supply and demand: buyers and sellers agreeing on a price. As new information changes what people expect the company to be worth, that agreed-on price shifts.",
  },
];

export function Module1WhatIsAStock() {
  return (
    <article className="module">
      <p className="module-eyebrow">Education · Module 1</p>
      <h1>What a Stock Is</h1>
      <p className="module-intro">
        Before charts, tickers, or any of the trading jargon, there's one idea everything else in
        investing sits on top of: what you're actually buying when you buy "a stock." This module
        covers that — plainly, with no assumed background.
      </p>

      <section>
        <h2>What a share of stock represents</h2>
        <p>
          A company can be split into many equal pieces. Each piece is called a{' '}
          <strong>share</strong>. If you own one share, you own a tiny slice of that company —
          the same way owning one slice of a pizza makes you a part-owner of the pizza, just on a
          much bigger scale, and with a company instead of a pizza.
        </p>
        <p>
          "Stock" is just the general word for this kind of ownership — <em>a share of stock</em>{' '}
          is one unit of it. Own enough shares and, in principle, you'd own the whole company.
          Most people own a very small slice, but it's real ownership either way: as a
          shareholder, you technically have a claim on the company's future profits and, in
          theory, a vote on some major company decisions.
        </p>
        <p>
          This is different from lending a company money. A lender expects the money back, plus
          interest, on a schedule, regardless of how well the company does. A shareholder has no
          such guarantee — there's no schedule and no promise of repayment. What a share is worth
          depends entirely on how the company performs and how much other people are willing to
          pay for that ownership stake, which is also why owning stock is riskier than lending
          money to a company.
        </p>
      </section>

      <section>
        <h2>Why companies issue shares</h2>
        <p>
          Running and growing a company costs money — building products, hiring people, opening
          new locations, and so on. A company has a few ways to get that money, and one of the
          biggest is to sell ownership stakes: create shares and sell them to investors.
        </p>
        <p>
          The appeal for the company is that this isn't a loan. It doesn't have to be paid back,
          and there's no interest owed on it. In exchange, the company is giving up a slice of
          itself — new shareholders now share in its future profits (and its future problems)
          alongside everyone who already owned a piece.
        </p>
        <p>
          The first time a company sells shares to the public, it's called an{' '}
          <strong>IPO</strong> (initial public offering). After that, those shares can be bought
          and sold between investors on a stock exchange — a marketplace built for exactly this —
          without the company itself being directly involved in each trade.
        </p>
      </section>

      <VideoEmbed
        youtubeId="98qfFzqDKR8"
        title="What it means to buy a company's stock — Khan Academy"
        caption="Khan Academy: What it means to buy a company's stock"
      />

      <section>
        <h2>What market cap means</h2>
        <p>
          Once a company's shares are trading, you can ask: what is the whole company worth,
          according to the market? That number is called <strong>market capitalization</strong>,
          usually shortened to <strong>market cap</strong>.
        </p>
        <p>
          The math is simple — multiply the price of one share by the total number of shares that
          exist:
        </p>
        <p className="module-formula">market cap = share price × total shares outstanding</p>
        <p>
          For example: if a company has 10 million shares outstanding and each one trades at $20,
          its market cap is 10,000,000 × $20 = $200,000,000 — two hundred million dollars.
        </p>
        <p>
          Market cap is why a $20 stock and a $400 stock can represent companies of similar
          size, or wildly different ones — the share price alone doesn't tell you how big a
          company is, because it depends just as much on how many shares that company has split
          itself into. Market cap is what actually measures the market's current estimate of the
          company's total worth.
        </p>
      </section>

      <VideoEmbed
        youtubeId="fa-VZ-SDxgY"
        title="Price and market capitalization — Khan Academy"
        caption="Khan Academy: Price and market capitalization"
      />

      <section>
        <h2>Why prices move</h2>
        <p>
          A share's price isn't set by the company, and it doesn't update on a fixed schedule.
          It's set continuously by ordinary supply and demand: buyers and sellers trading shares
          on an exchange, agreeing on a price in real time.
        </p>
        <p>
          If more people want to buy a stock at its current price than want to sell it there, the
          price gets bid up — buyers offer a little more to convince a seller to part with their
          shares. If more people want to sell than want to buy, the price drops as sellers accept
          a little less to find a buyer.
        </p>
        <p>
          What drives people to want to buy or sell more or less at a given moment comes down to
          changing expectations about the company's future — a strong or weak earnings report,
          news about a new product, a change in the broader economy, even a shift in how investors
          feel about the company's industry. None of those things mechanically set the price; they
          just shift what buyers and sellers are willing to agree to, and the price follows.
        </p>
      </section>

      <Quiz title="Check your understanding" questions={quizQuestions} />
    </article>
  );
}
