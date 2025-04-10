import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext";
import { Link } from "react-router-dom";
import "./Holdings.css"; // Import the CSS file

// import { holdings } from "../data/data";

const Holdings = () => {
  const { user } = useContext(GeneralContext);
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchHoldings = useCallback(() => {
    if (user && user.id) {
      setLoading(true);
      axios.get(`http://localhost:5000/user/${user.id}/holdings`)
        .then((res) => {
          setAllHoldings(res.data);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching holdings:", err);
          setError("Failed to load holdings. Please try again.");
        })
        .finally(() => {
          setLoading(false);
          setLastUpdated(Date.now());
        });
    }
  }, [user]);

  useEffect(() => {
    fetchHoldings();
    
    // Listen for order placement events
    const handleOrderPlaced = () => {
      setTimeout(() => {
        fetchHoldings();
      }, 1000); // Small delay to ensure backend has processed the order
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchHoldings();
    }, 30000);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      clearInterval(refreshInterval);
    };
  }, [fetchHoldings]);

  if (!user) {
    return (
      <div className="holdings-container">
        <div className="no-holdings">
          <p>Please log in to view your holdings</p>
          <Link to="/login" className="btn">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading && allHoldings.length === 0) {
    return (
      <div className="holdings-container">
        <div className="no-holdings">
          <p>Loading holdings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holdings-container">
        <div className="no-holdings">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const labels = allHoldings.map((subArray) => subArray["name"]);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  // Calculate totals
  const totalInvestment = allHoldings.reduce((total, stock) => total + (stock.avg * stock.qty), 0);
  const currentValue = allHoldings.reduce((total, stock) => total + (stock.price * stock.qty), 0);
  const profitLoss = currentValue - totalInvestment;
  const profitLossPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

  // export const data = {
  //   labels,
  //   datasets: [
  // {
  //   label: 'Dataset 1',
  //   data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
  //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
  // },
  //     {
  //       label: 'Dataset 2',
  //       data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
  //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
  //     },
  //   ],
  // };

  return (
    <div className="holdings-container">
      <h2>Holdings ({allHoldings.length})</h2>

      {allHoldings.length > 0 ? (
        <div className="holdings-content">
          <div className="holdings-list">
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty.</th>
                  <th>Avg. cost</th>
                  <th>LTP</th>
                  <th>Cur. val</th>
                  <th>P&L</th>
                  <th>Net chg.</th>
                  <th>Day chg.</th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((stock, index) => {
                  const curValue = stock.price * stock.qty;
                  const isProfit = curValue - stock.avg * stock.qty >= 0.0;
                  const dayProfit = !stock.isLoss;
                  const rowClass = isProfit ? "profit-row" : "loss-row";

                  return (
                    <tr key={index} className={rowClass}>
                      <td>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{stock.avg.toFixed(2)}</td>
                      <td>{stock.price.toFixed(2)}</td>
                      <td>{curValue.toFixed(2)}</td>
                      <td className={isProfit ? "profit" : "loss"}>
                        {(curValue - stock.avg * stock.qty).toFixed(2)}
                      </td>
                      <td className={isProfit ? "profit" : "loss"}>{stock.net}</td>
                      <td className={dayProfit ? "profit" : "loss"}>{stock.day}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="refresh-section">
              <button onClick={fetchHoldings} className="btn">
                ↻ Refresh
              </button>
              <span className="last-updated">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-item">
              <h5>₹ {totalInvestment.toFixed(2)}</h5>
              <p>Total investment</p>
            </div>
            <div className="summary-item">
              <h5>₹ {currentValue.toFixed(2)}</h5>
              <p>Current value</p>
            </div>
            <div className="summary-item">
              <h5 className={profitLoss >= 0 ? "profit" : "loss"}>
                ₹ {profitLoss.toFixed(2)} ({profitLossPercentage > 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
              </h5>
              <p>P&L</p>
            </div>
          </div>
          
          <div className="graph-section">
            <VerticalGraph data={data} />
          </div>
        </div>
      ) : (
        <div className="no-holdings">
          <p>You don't have any holdings</p>
          <Link to="/" className="btn">
            Get started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Holdings;
