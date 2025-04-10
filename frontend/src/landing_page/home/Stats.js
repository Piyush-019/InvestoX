import React from "react";

function Stats() {
  return (
    <div className="container p-3">
      <div className="row p-5">
        <div className="col-6 p-5">
          <h1 className="fs-2 mb-5">Your gateway to investment learning</h1>
          <h2 className="fs-4">Learn by doing</h2>
          <p className="text-muted">
            Experience the world of investing in a risk-free environment. Our platform
            provides real-time market data and simulated trading to help you understand
            how investing works in practice.
          </p>
          <h2 className="fs-4">No real money required</h2>
          <p className="text-muted">
            Practice investing with virtual currency and learn from your decisions
            without any financial risk. Perfect for beginners and those looking to
            enhance their investment knowledge.
          </p>
          <h2 className="fs-4">The InvestoX experience</h2>
          <p className="text-muted">
            We're building more than just a simulation - we're creating a comprehensive
            learning environment. Our platform includes educational resources and
            real-world market scenarios to help you develop your investment skills.
          </p>
          <h2 className="fs-4">Build your investment knowledge</h2>
          <p className="text-muted">
            With features like portfolio tracking, market analysis tools, and
            educational content, we help you understand investment strategies and
            develop the confidence to make informed decisions.
          </p>
        </div>
        <div className="col-6 p-5">
          <img src="media/images/ecosystem.png" style={{ width: "90%" }} alt="Learning Ecosystem"/>
          <div className="text-center">
            <a href="/product" className="mx-5" style={{ textDecoration: "none" }}>
              Explore Learning Tools{" "}
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
            <a href="http://localhost:3001" style={{ textDecoration: "none" }}>
              Try Demo{" "}
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
