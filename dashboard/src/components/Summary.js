import React, { useContext, useState, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import axios from "axios";

const Summary = () => {
  const { user } = useContext(GeneralContext);
  const [fundsData, setFundsData] = useState({
    availableFunds: 0,
    usedFunds: 0,
    totalFunds: 0
  });
  const [holdingsData, setHoldingsData] = useState([]);
  const [holdingsStats, setHoldingsStats] = useState({
    count: 0,
    totalInvestment: 0,
    currentValue: 0,
    profitLoss: 0,
    profitLossPercentage: 0
  });

  useEffect(() => {
    const fetchFundsData = async () => {
      if (user && user.id) {
        try {
          console.log("Summary: Fetching funds for user ID:", user.id);
          const response = await axios.get(`http://localhost:5000/user/${user.id}/funds`);
          console.log("Summary: Funds data received:", response.data);
          setFundsData(response.data);
        } catch (error) {
          console.error("Summary: Error fetching funds:", error);
          if (error.response) {
            console.error("Summary: Error response:", error.response.data);
            console.error("Summary: Status:", error.response.status);
          }
        }
      } else {
        console.log("Summary: No user ID available:", user);
      }
    };

    const fetchHoldingsData = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`http://localhost:5000/user/${user.id}/holdings`);
          setHoldingsData(response.data);
          
          // Calculate holdings statistics
          const totalInvestment = response.data.reduce((total, stock) => total + (stock.avg * stock.qty), 0);
          const currentValue = response.data.reduce((total, stock) => total + (stock.price * stock.qty), 0);
          const profitLoss = currentValue - totalInvestment;
          const profitLossPercentage = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;
          
          setHoldingsStats({
            count: response.data.length,
            totalInvestment,
            currentValue,
            profitLoss,
            profitLossPercentage
          });
        } catch (error) {
          console.error("Summary: Error fetching holdings:", error);
        }
      }
    };

    fetchFundsData();
    fetchHoldingsData();
    
    // Listen for order placement events to refresh data
    const handleOrderPlaced = () => {
      setTimeout(() => {
        fetchFundsData();
        fetchHoldingsData();
      }, 1000); // Small delay to ensure backend has processed the order
    };
    
    window.addEventListener('orderPlaced', handleOrderPlaced);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
    };
  }, [user]);

  // Format number with commas
  const formatNumber = (num) => {
    return num ? (num / 1000).toFixed(2) + 'k' : "0k";
  };

  return (
    <>
      <div className="username">
        <h6>Hi, {user ? user.username : 'User'}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{formatNumber(fundsData.availableFunds)}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>{formatNumber(fundsData.usedFunds)}</span>{" "}
            </p>
            <p>
              Opening balance <span>{formatNumber(fundsData.totalFunds)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdingsStats.count})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={holdingsStats.profitLoss >= 0 ? "profit" : "loss"}>
              {formatNumber(holdingsStats.profitLoss)} <small>{holdingsStats.profitLossPercentage > 0 ? '+' : ''}{holdingsStats.profitLossPercentage.toFixed(2)}%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{formatNumber(holdingsStats.currentValue)}</span>{" "}
            </p>
            <p>
              Investment <span>{formatNumber(holdingsStats.totalInvestment)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;
