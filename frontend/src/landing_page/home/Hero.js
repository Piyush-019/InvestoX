import React from "react";

function Hero() {
  return (
    <div className="container p-5 mb-5">
      <div className="row text-center">
        <img
          src="media/images/homeHero.png"
          alt="Hero"
          className="mb-5"
        />
        <h1 className="mt-5">Invest in everything</h1>
        <p>
          Online platform to get real time experience in investing in stocks, derivatives, mutual funds, and
          more
        </p>
        <a href="http://localhost:3001/signup" style={{ width: "20%", margin: "0 auto" }}>
          <button
            className="p-2 btn btn-primary fs-5 mb-5" 
            style={{ width: "100%" }}
          >
            Signup Now
          </button>
        </a>
      </div>
    </div>
  );
}

export default Hero;
