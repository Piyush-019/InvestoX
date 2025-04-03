import React from "react";

function Hero() {
  return (
    <div className="container">
      <div className="row p-5 mt-5 mb-5">
        <h1 className="fs-2 text-center">
          Empowering investors with cutting-edge technology
          <br />
          InvestoX - Your gateway to smart investing.
        </h1>
      </div>

      <div
        className="row p-5 mt-5 border-top text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-5">
          <p>
            InvestoX is a next-generation online brokerage platform founded by Piyush Jain with a vision to revolutionize investing in India. Our goal is to simplify stock trading and empower investors with advanced tools and insights.
          </p>
          <p>
            As a fresh and innovative platform, we provide real-time market analysis, intuitive dashboards, and a seamless trading experience tailored for both beginners and seasoned investors.
          </p>
          <p>
            With a mission to bridge the gap between technology and finance, InvestoX aims to redefine the investing landscape in India.
          </p>
        </div>
        <div className="col-6 p-5">
          <p>
            We believe in financial literacy and community-driven growth. That’s why we are building educational resources and discussion forums where investors can learn, share, and grow together.
          </p>
          <p>
            Our platform integrates state-of-the-art features, ensuring transparency, efficiency, and security in every transaction.
          </p>
          <p>
            Stay tuned as we continue to innovate and bring the best trading experience to investors. Follow our journey and explore the future of investing with InvestoX.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
