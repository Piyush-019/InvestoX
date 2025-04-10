import React from "react";

function Footer() {
  return (
    <footer style={{ backgroundColor: "rgb(250, 250, 250)" }}>
      <div className="container border-top mt-5">
        <div className="row mt-5">
          <div className="col">
            <img src="media/images/logo.png" style={{ width: "50%" }} alt="InvestoX Logo"/>
            <p>
              &copy;2024, InvestoX Broking Ltd. All rights reserved.
            </p>
          </div>
          <div className="col">
            <p>Company</p>
            <a href="/about">About</a>
            <br />
            <a href="/product">Products</a>
            <br />
            {/* <a href="/pricing">Pricing</a> */}
            {/* <br /> */}
            <a href="/investments">Investments</a>
            <br />
            {/* <a href="/careers">Careers</a>
            <br /> */}
          </div>
          {/* <div className="col">
            <p>Support</p>
            <a href="/support">Contact</a>
            <br />
            <a href="/resources">Resources</a>
            <br />
            <a href="/charges">List of charges</a>
            <br />
          </div> */}
          <div className="col">
            <p>Account</p>
            <a href="/signup">Open an account</a>
            <br />
            {/* <a href="/fund-transfer">Fund transfer</a>
            <br /> */}
          </div>
        </div>
        <div className="mt-5 text-muted" style={{ fontSize: "14px" }}>
          <p>
            InvestoX Broking Ltd.: Member of NSE​ &​ BSE – SEBI Registration no.:
            INZ000031633. Registered Address: InvestoX Broking Ltd.,
            #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School,
            J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India. For any
            complaints or queries, please write to support@InvestoX.com
          </p>

          <p>
            Investments in securities market are subject to market risks; read
            all the related documents carefully before investing.
          </p>

          <p>
            "Prevent unauthorised transactions in your account. Update your
            mobile numbers/email IDs with your stock brokers. Receive
            information of your transactions directly from Exchange on your
            mobile/email at the end of the day. KYC is one time exercise while dealing in securities
            markets - once KYC is done through a SEBI registered intermediary
            (broker, DP, Mutual Fund etc.), you need not undergo the same
            process again when you approach another intermediary."
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
