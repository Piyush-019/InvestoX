import React from "react";

function Stats() {
  return (
    <div className="container p-3">
      <div className="row p-5">
        <div className="col-6 p-5">
          <h1 className="fs-2 mb-5">Building the future of investing</h1>
          <h2 className="fs-4">Customer-first always</h2>
          <p className="text-muted">
            As a newly launched platform, we're committed to putting your needs first.
            Our mission is to make investing accessible, transparent, and rewarding.
          </p>
          <h2 className="fs-4">No spam or gimmicks</h2>
          <p className="text-muted">
            No gimmicks, spam, "gamification", or annoying push notifications.
            High quality apps that you use at your pace, the way you like.
          </p>
          <h2 className="fs-4">The InvestoX vision</h2>
          <p className="text-muted">
            We're building more than just an app - we're creating an ecosystem.
            Our roadmap includes partnerships with fintech innovators to offer
            you tailored services specific to your needs.
          </p>
          <h2 className="fs-4">Do better with money</h2>
          <p className="text-muted">
            With planned features like smart notifications and risk management tools,
            we aim to not just facilitate transactions, but actively help you
            make better financial decisions.
          </p>
        </div>
        <div className="col-6 p-5">
          <img src="media/images/ecosystem.png" style={{ width: "90%" }} alt="Ecosystem"/>
          <div className="text-center">
            <a href="/product" className="mx-5" style={{ textDecoration: "none" }}>
              Explore our Products{" "}
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
            <a href="http://localhost:3001" style={{ textDecoration: "none" }}>
              Try Tan demo{" "}
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
