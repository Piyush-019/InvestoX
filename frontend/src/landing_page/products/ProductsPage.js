import React from "react";

import Hero from "./Hero";
import LeftSection from "./LeftSection";

function PricingPage() {
  return (
    <>
      <Hero />
      <LeftSection
        imageURL="media/images/image.png"
        productName="Tan"
        productDesription="Our ultra-fast flagship trading platform with streaming market data, advanced charts, an elegant UI, and more. Enjoy the Kite experience seamlessly on your Android and iOS devices."
        tryDemo="http://localhost:3001"
        learnMore=""
        googlePlay=""
        appStore=""
      />
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
    </>
  );
}

export default PricingPage;
