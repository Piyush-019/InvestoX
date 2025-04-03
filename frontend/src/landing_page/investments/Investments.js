import React from "react";

function Investments() {
  return (
    <div className="container-fluid py-5">
      {/* Hero Section */}
      <div className="container text-center mb-5">
        <h1 className="text-center mt-5 p-3">Investments</h1>
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
              Trade stocks for delivery or intraday on over 5000 stocks listed on National
              Stock Exchange (NSE) and Bombay Stock Exchange (BSE). Experience seamless
              trading with our cutting-edge platform.
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
              Invest in direct mutual funds without any commission. Save up to 1.5% in
              commissions annually. Choose from a wide range of funds and start your
              investment journey.
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
              Trade derivatives including stock futures, index futures, stock options,
              and index options. Access advanced tools for options analysis and strategy
              building.
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
              Apply for IPOs online using your UPI ID. Stay updated with upcoming IPOs
              and track your applications easily. Get instant notifications about
              allotment status.
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