import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import GeneralContext from "./GeneralContext";
import "./Positions.css"; // Import the CSS file

const Positions = () => {
  const { user } = useContext(GeneralContext);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchPositions = useCallback(() => {
    if (user && user.id) {
      setLoading(true);
      axios.get(`http://localhost:5000/user/${user.id}/positions`)
        .then((res) => {
          setPositions(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching positions:", err);
          setError("Failed to load positions. Please try again.");
        })
        .finally(() => {
          setLoading(false);
          setLastUpdated(Date.now());
        });
    }
  }, [user]);

  useEffect(() => {
    fetchPositions();
    
    // Listen for order placement events
    const handleOrderPlaced = () => {
      setTimeout(() => {
        fetchPositions();
      }, 1000); // Small delay to ensure backend has processed the order
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchPositions();
    }, 30000);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      clearInterval(refreshInterval);
    };
  }, [fetchPositions]);

  if (!user) {
    return (
      <div className="positions-container">
        <div className="no-positions">
          <p>Please log in to view your positions</p>
          <Link to="/login" className="btn">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading && positions.length === 0) {
    return (
      <div className="positions-container">
        <div className="no-positions">
          <p>Loading positions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="positions-container">
        <div className="no-positions">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="positions-container">
      <h2>Positions ({positions.length})</h2>

      {positions.length > 0 ? (
        <div className="positions-content">
          <div className="positions-list">
            <table className="positions-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Instrument</th>
                  <th>Qty.</th>
                  <th>Avg.</th>
                  <th>LTP</th>
                  <th>P&L</th>
                  <th>Chg.</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((stock, index) => {
                  const curValue = stock.price * stock.qty;
                  const avgValue = stock.avg * stock.qty;
                  const absProfitLoss = curValue - avgValue;
                  
                  // Use the backend flags when available, fallback to calculated values if not
                  const isProfit = stock.hasOwnProperty('isLoss') ? !stock.isLoss : absProfitLoss >= 0;
                  const isDayProfit = stock.hasOwnProperty('isDayLoss') ? !stock.isDayLoss : !stock.day.startsWith('-');
                  
                  const rowClass = isProfit ? "profit-row" : "loss-row";

                  return (
                    <tr key={index} className={rowClass}>
                      <td>{stock.product}</td>
                      <td>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{stock.avg.toFixed(2)}</td>
                      <td>{stock.price.toFixed(2)}</td>
                      <td className={isProfit ? "profit" : "loss"}>
                        {absProfitLoss.toFixed(2)}
                      </td>
                      <td className={isDayProfit ? "profit" : "loss"}>{stock.day}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="refresh-section">
              <button onClick={fetchPositions} className="btn">
                ↻ Refresh
              </button>
              <span className="last-updated">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-positions">
          <p>You don't have any positions</p>
          <Link to="/" className="btn">
            Get started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Positions;
