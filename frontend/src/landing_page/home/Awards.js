import React from "react";

function Awards() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6 p-5">
          <img src="media/images/largestBroker.svg" alt="Innovation award" />
        </div>
        <div className="col-6 p-5 mt-5">
          <h1>Introducing the next generation investment platform</h1>
          <p className="mb-5">
            InvestoX is launching with a mission to revolutionize how you invest. Our innovative platform offers everything you need to start your investment journey:
          </p>
          <div className="row">
            <div className="col-6">
              <ul>
                <li>
                  <p>Easy stock and ETF trading</p>
                </li>
                <li>
                  <p>Simplified futures and options</p>
                </li>
                <li>
                  <p>Secure cryptocurrency access</p>
                </li>
              </ul>
            </div>
            <div className="col-6">
              <ul>
                <li>
                  <p>Exclusive IPO opportunities</p>
                </li>
                <li>
                  <p>Zero-commission mutual funds</p>
                </li>
                <li>
                  <p>Diverse fixed income options</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Awards;
