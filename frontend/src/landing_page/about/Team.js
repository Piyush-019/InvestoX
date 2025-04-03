import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5 border-top">
        <h1 className="text-center">People</h1>
      </div>

      <div
        className="row p-3 text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-3 text-center">
          <img
            src="media/images/piyushJain.jpg"
            style={{ borderRadius: "100%", width: "40%" }}
          />
          <h4 className="mt-5">Piyush Jain</h4>
          <h6>Founder, CEO</h6>
        </div>
        <div className="col-6 p-3">
          <p>
            Piyush Jain founded InvestoX to revolutionize online trading with 
            a seamless and data-driven platform. His expertise in technology 
            and markets drives innovation at InvestoX.
          </p>
          <p>
            Previously, he built <a href="https://yatri-review.onrender.com/listings">Yatri Review</a>, a platform for 
            user-driven accommodation reviews and host management.
          </p>
          <p>
            Connect on <a href="/">Homepage</a> / <a href="https://github.com/Piyush-019">GitHub</a> / <a href="https://www.linkedin.com/in/piyushjain00">LinkedIn</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
