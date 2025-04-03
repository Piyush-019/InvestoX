import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import GeneralContext from "./GeneralContext";
import { Link } from "react-router-dom";

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
      <div className="holdings">
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
      <div className="holdings">
        <div className="no-holdings">
          <p>Loading holdings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="holdings">
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
    <>
      <h3 className="title">
        Holdings ({allHoldings.length})
        <button 
          onClick={fetchHoldings} 
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

      {allHoldings.length > 0 ? (
        <>
          <div className="order-table">
            <table>
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
                  const profClass = isProfit ? "profit" : "loss";
                  const dayClass = stock.isLoss ? "loss" : "profit";

                  return (
                    <tr key={index}>
                      <td>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{stock.avg.toFixed(2)}</td>
                      <td>{stock.price.toFixed(2)}</td>
                      <td>{curValue.toFixed(2)}</td>
                      <td className={profClass}>
                        {(curValue - stock.avg * stock.qty).toFixed(2)}
                      </td>
                      <td className={profClass}>{stock.net}</td>
                      <td className={dayClass}>{stock.day}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="row">
            <div className="col">
              <h5>
                {totalInvestment.toFixed(2)}
              </h5>
              <p>Total investment</p>
            </div>
            <div className="col">
              <h5>
                {currentValue.toFixed(2)}
              </h5>
              <p>Current value</p>
            </div>
            <div className="col">
              <h5>{profitLoss.toFixed(2)} ({profitLossPercentage > 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)</h5>
              <p>P&L</p>
            </div>
          </div>
          <VerticalGraph data={data} />
        </>
      ) : (
        <div className="no-holdings">
          <p>You don't have any holdings</p>
          <Link to="/" className="btn">
            Get started
          </Link>
        </div>
      )}
    </>
  );
};

export default Holdings;
