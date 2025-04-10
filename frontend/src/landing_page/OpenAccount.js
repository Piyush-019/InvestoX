import React from "react";

function OpenAccount() {
  return (
    <div className="container p-5 mb-5">
      <div className="row text-center">
        <h1 className="mt-5">Open a InvestoX account</h1>
        <p>
        Online platform to get real time experience in investing in stocks, derivatives, mutual funds, and more
        </p>
        <a href="http://localhost:3001/signup">
          <button
            className="p-2 btn btn-primary fs-5 mb-5"
            style={{ width: "20%", margin: "0 auto" }}
          >
            Sign up Now
          </button>
        </a>
      </div>
    </div>
  );
}

export default OpenAccount;
