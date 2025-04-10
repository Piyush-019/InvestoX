import React, { useState, useEffect } from "react";
import axios from "axios";
import Menu from "./Menu";

const TopBar = () => {
  const [indices, setIndices] = useState({
    nifty: { price: 0, change: "0.00%" },
    sensex: { price: 0, change: "0.00%" }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndicesData();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchIndicesData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchIndicesData = async () => {
    try {
      // First try to fetch from backend
      try {
        const niftyResponse = await axios.get('http://localhost:5000/stock/NIFTY50');
        const sensexResponse = await axios.get('http://localhost:5000/stock/SENSEX');
        
        if (niftyResponse.data && sensexResponse.data) {
          setIndices({
            nifty: {
              price: niftyResponse.data.price,
              change: niftyResponse.data.change
            },
            sensex: {
              price: sensexResponse.data.price, 
              change: sensexResponse.data.change
            }
          });
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log("Could not fetch indices from backend");
      }
      
      // If backend fails, use placeholder data
      setIndices({
        nifty: { 
          price: 22567.75,
          change: "+0.53%"
        },
        sensex: { 
          price: 74339.44,
          change: "+0.48%"
        }
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching indices data:", error);
      setLoading(false);
    }
  };

  // Determine CSS class based on whether value is positive or negative
  const getChangeClass = (change) => {
    if (!change) return "";
    return change.includes("-") ? "negative-change" : "positive-change";
  };

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">{loading ? "..." : indices.nifty.price.toLocaleString('en-IN')}</p>
          <p className={`percent ${getChangeClass(indices.nifty.change)}`}>
            {loading ? "" : indices.nifty.change}
          </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">{loading ? "..." : indices.sensex.price.toLocaleString('en-IN')}</p>
          <p className={`percent ${getChangeClass(indices.sensex.change)}`}>
            {loading ? "" : indices.sensex.change}
          </p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
