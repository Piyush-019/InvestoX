import React from "react";

function Investments() {
  return (
    <div className="container-fluid py-5">
      {/* Hero Section */}
      <div className="container text-center mb-5">
        <h1 className="text-center mt-5 p-3">Investments Learning</h1>
        <h5 className="text-muted mb-4">
          From stocks and ETFs to mutual funds - everything you need to build your wealth
        </h5>
        <button className="btn btn-outline-primary" onClick={() => window.location.href = '/product'}>
          Explore our products →
        </button>
      </div>

      {/* Investment Products */}
      <div className="container">
        {/* Stocks Section */}
        <div className="row mb-5 align-items-center">
          <div className="col-lg-8">
            <h2 className="mb-3">Stocks</h2>
            <p className="text-muted">
            Stocks represent ownership in a company. When you buy a stock, you become a shareholder and own a small part of that company.
            </p>
          </div>
          <div className="col-lg-4">
            <img
              src="/media/images/investments/stocks.svg"
              alt="Stock Trading"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>

        {/* Mutual Funds Section */}
        <div className="row mb-5 align-items-center flex-row-reverse">
          <div className="col-lg-8">
            <h2 className="mb-3">Direct Mutual Funds</h2>
            <p className="text-muted">
            Direct mutual funds are investment plans you buy directly from the mutual fund company, without any intermediaries or brokers. They have lower fees and higher returns compared to regular mutual funds.
            </p>
          </div>
          <div className="col-lg-4">
            <img
              src="/media/images/investments/mutual-funds.svg"
              alt="Mutual Funds"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>

        {/* F&O Section */}
        <div className="row mb-5 align-items-center">
          <div className="col-lg-8">
            <h2 className="mb-3">Futures & Options</h2>
            <p className="text-muted">
            Futures and options are types of derivatives used in trading. Futures are contracts to buy or sell an asset at a fixed price on a future date, while options give the right (but not the obligation) to buy or sell an asset at a set price before a certain date.
            </p>
          </div>
          <div className="col-lg-4">
            <img
              src="/media/images/investments/options.svg"
              alt="Futures and Options"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>

        {/* IPO Section */}
        <div className="row mb-5 align-items-center flex-row-reverse">
          <div className="col-lg-8">
            <h2 className="mb-3">IPO</h2>
            <p className="text-muted">
            IPO (Initial Public Offering) is when a private company offers its shares to the public for the first time to raise capital. After an IPO, the company gets listed on the stock exchange.
            </p>
          </div>
          <div className="col-lg-4">
            <img
              src="/media/images/investments/ipo.svg"
              alt="IPO Investments"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-5">
          <h2 className="mb-4">Open an InvestoX Account</h2>
          <p className="text-muted mb-4">
            Modern trading platform, zero account opening charges, and competitive
            brokerage rates.
          </p>
          <button className="btn btn-primary btn-lg">
            Sign up now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Investments; 