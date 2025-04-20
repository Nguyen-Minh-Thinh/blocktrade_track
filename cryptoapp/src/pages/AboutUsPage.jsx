import React from "react";

const AboutUsPage = () => {
  return (
    <section className="max-w-4xl mx-auto p-6 pt-10 text-gray-500">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-400">About Us</h1>

      <p className=" mb-4">
        <strong>BlockTrade_Track</strong> is more than just a crypto tracking tool — we're your
        trusted companion on the journey through the exciting world of digital currencies.
        Whether you're a seasoned trader or just starting out, we're here to simplify crypto
        for everyone.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-400">What We Offer</h2>
      <ul className="list-disc list-inside mb-4 space-y-2">
        <li>
          🔍 <strong>Real-time price updates</strong> for hundreds of cryptocurrencies like
          Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), and more.
        </li>
        <li>
          📈 <strong>Interactive charts and in-depth analytics</strong> that help you make
          informed decisions, not guesses.
        </li>
        <li>
          📰 <strong>Up-to-date crypto news</strong> from reliable sources around the world.
        </li>
        <li>
          📊 <strong>Portfolio tracking tools</strong> to keep you on top of your assets at all times.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-400">Our Mission</h2>
      <p className=" mb-4">
        At BlockTrade_Track, our mission is to make the crypto space more accessible,
        transparent, and less intimidating. We believe that everyone deserves the tools and
        information they need to take part in the digital finance revolution — with confidence.
      </p>

      <p className=" font-medium mt-6 text-gray-400">
        Join us, stay informed, and trade smarter. The future of finance is just getting started —
        and we're excited to walk with you every step of the way.
      </p>
    </section>
  );
};

export default AboutUsPage;
