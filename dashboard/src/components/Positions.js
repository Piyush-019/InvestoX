import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import GeneralContext from "./GeneralContext";

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
      <div className="positions">
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
      <div className="positions">
        <div className="no-positions">
          <p>Loading positions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="positions">
        <div className="no-positions">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h3 className="title">
        Positions ({positions.length})
        <button 
          onClick={fetchPositions} 
          className="refresh-btn"
          style={{ 
            border: "none", 
            background: "transparent", 
            cursor: "pointer", 
            marginLeft: "10px",
            fontSize: "14px",
            color: "#666" 
          }}
        >
          ↻ Refresh
        </button>
      </h3>

      {positions.length > 0 ? (
        <div className="order-table">
          <table>
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
                const isProfit = curValue - stock.avg * stock.qty >= 0.0;
                const profClass = isProfit ? "profit" : "loss";
                const dayClass = stock.isLoss ? "loss" : "profit";

                return (
                  <tr key={index}>
                    <td>{stock.product}</td>
                    <td>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>{stock.avg.toFixed(2)}</td>
                    <td>{stock.price.toFixed(2)}</td>
                    <td className={profClass}>
                      {(curValue - stock.avg * stock.qty).toFixed(2)}
                    </td>
                    <td className={dayClass}>{stock.day}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-positions">
          <p>You don't have any positions</p>
          <Link to="/" className="btn">
            Get started
          </Link>
        </div>
      )}
    </>
  );
};

export default Positions;
