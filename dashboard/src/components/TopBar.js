import React, { useState, useEffect } from "react";
import axios from "axios";
import Menu from "./Menu";

const TopBar = () => {
  const [indices, setIndices] = useState({
    nifty: { price: 0, change: "0.00%" },
    sensex: { price: 0, change: "0.00%" }
  });
  const [loading, setLoading] = useState(true);
  const [updatedIndices, setUpdatedIndices] = useState({
    nifty: false,
    sensex: false
  });

  useEffect(() => {
    fetchIndicesData();
    
    // Listen for stock price updates
    const handleStockPriceUpdate = (event) => {
      // If we have detail data and it's for one of our indices
      if (event.detail) {
        const { symbol, price, dayChange } = event.detail;
        
        if (symbol === 'NIFTY50' || symbol === 'SENSEX') {
          const indexKey = symbol === 'NIFTY50' ? 'nifty' : 'sensex';
          
          setIndices(prev => ({
            ...prev,
            [indexKey]: {
              price: price,
              change: dayChange
            }
          }));
          
          // Set the updated flag to trigger the animation
          setUpdatedIndices(prev => ({
            ...prev,
            [indexKey]: true
          }));
          
          // Reset the updated flag after animation completes
          setTimeout(() => {
            setUpdatedIndices(prev => ({
              ...prev,
              [indexKey]: false
            }));
          }, 2000);
        }
      } else {
        // Refresh all data if no specific details
        fetchIndicesData();
      }
    };
    
    // Add event listener for stock price updates
    window.addEventListener('stockPriceUpdated', handleStockPriceUpdate);
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchIndicesData, 30000);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('stockPriceUpdated', handleStockPriceUpdate);
    };
  }, []);

  const fetchIndicesData = async () => {
    try {
      // First try to fetch from backend
      try {
        const niftyResponse = await axios.get('http://localhost:5000/stock/NIFTY50');
        const sensexResponse = await axios.get('http://localhost:5000/stock/SENSEX');
        
        if (niftyResponse.data && sensexResponse.data) {
          const newIndices = {
            nifty: {
              price: niftyResponse.data.price,
              change: niftyResponse.data.dayChange || "+0.00%" // Changed from 'change' to 'dayChange'
            },
            sensex: {
              price: sensexResponse.data.price, 
              change: sensexResponse.data.dayChange || "+0.00%" // Changed from 'change' to 'dayChange'
            }
          };
          
          // Check if prices have changed and set updated flags
          if (newIndices.nifty.price !== indices.nifty.price) {
            setUpdatedIndices(prev => ({ ...prev, nifty: true }));
            setTimeout(() => setUpdatedIndices(prev => ({ ...prev, nifty: false })), 2000);
          }
          
          if (newIndices.sensex.price !== indices.sensex.price) {
            setUpdatedIndices(prev => ({ ...prev, sensex: true }));
            setTimeout(() => setUpdatedIndices(prev => ({ ...prev, sensex: false })), 2000);
          }
          
          setIndices(newIndices);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log("Could not fetch indices from backend:", error);
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
          <p className={`index-points ${updatedIndices.nifty ? 'stock-updated' : ''}`}>
            {loading ? "..." : indices.nifty.price.toLocaleString('en-IN')}
          </p>
          <p className={`percent ${getChangeClass(indices.nifty.change)} ${updatedIndices.nifty ? 'stock-updated' : ''}`}>
            {loading ? "" : indices.nifty.change}
          </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className={`index-points ${updatedIndices.sensex ? 'stock-updated' : ''}`}>
            {loading ? "..." : indices.sensex.price.toLocaleString('en-IN')}
          </p>
          <p className={`percent ${getChangeClass(indices.sensex.change)} ${updatedIndices.sensex ? 'stock-updated' : ''}`}>
            {loading ? "" : indices.sensex.change}
          </p>
        </div>
      </div>

      <Menu />
    </div>
  );
};

export default TopBar;
