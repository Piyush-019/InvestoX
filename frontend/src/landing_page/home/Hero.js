import React from "react";

function Hero() {
  return (
    <div className="container-fluid p-0">
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, #ffffff, #e6f0ff, #007bff)',
        padding: '6rem 0',
        color: '#2c3e50'
      }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-8 mx-auto">
              <h1 className="display-4 fw-bold mb-4" style={{ color: '#007bff' }}>Invest in Everything</h1>
              <p className="lead mb-5" style={{ fontSize: '1.25rem', color: '#2c3e50' }}>
                Online platform to get real-time experience in investing in stocks, derivatives, mutual funds, and more
              </p>
              <a href="http://localhost:3001/signup" className="text-decoration-none">
                <button
                  className="btn btn-lg px-5 py-3 rounded-pill fw-bold"
                  style={{
                    background: '#007bff',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.background = '#0056b3';
                    e.target.style.boxShadow = '0 6px 20px rgba(0,123,255,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = '#007bff';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,123,255,0.3)';
                  }}
                >
                  Get Started Now
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
