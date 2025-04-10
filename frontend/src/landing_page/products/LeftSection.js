import React from "react";

function LeftSection({
  imageURL,
  productName,
  productDesription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6 d-flex justify-content-center align-items-center">
          <img src={imageURL}  width="40%" height="70%" alt="Product"/>
        </div>
        <div className="col-6 p-5 mt-5">
          <h1><a href="http://localhost:3001" style={{ textDecoration: "none", color: "inherit" }}>{productName}</a></h1>
          <p>{productDesription}</p>
          {/* <div>
            <a href={tryDemo}>Try Demo</a>
            <a href={learnMore} style={{ marginLeft: "50px" }}>
              Learn More
            </a>
          </div> */}
          {/* <div className="mt-3">
            <a href={googlePlay}>
              <img src="media/images/googlePlayBadge.svg" alt="Google Play" />
            </a>
            <a href={appStore}>
              <img
                src="media/images/appstoreBadge.svg" alt="App Store"
                style={{ marginLeft: "50px" }}
              />
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
