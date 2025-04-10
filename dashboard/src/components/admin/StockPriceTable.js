import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminStyles.css';

const StockPriceTable = ({ stocks, onEditClick }) => {
  const [holdingsImpact, setHoldingsImpact] = useState({});
  const [totalUsers, setTotalUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [uniqueStocks, setUniqueStocks] = useState([]);

  // Deduplicate stocks
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      // Create a map to track unique stocks by symbol/name
      const stockMap = new Map();
      
      // Process stocks to keep only unique ones (by symbol or name)
      stocks.forEach(stock => {
        const key = stock.symbol || stock.name;
        if (!stockMap.has(key)) {
          stockMap.set(key, stock);
        }
      });
      
      // Convert map back to array
      setUniqueStocks(Array.from(stockMap.values()));
    } else {
      setUniqueStocks([]);
    }
  }, [stocks]);

  // Fetch holdings data to calculate impact
  useEffect(() => {
    const fetchHoldingsData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/allHoldings');
        const holdings = response.data;
        
        // Calculate impact for each stock
        const impactData = {};
        const userCounts = {};
        
        holdings.forEach(holding => {
          if (!impactData[holding.name]) {
            impactData[holding.name] = {
              totalQty: 0,
              totalValue: 0,
              users: new Set()
            };
          }
          
          impactData[holding.name].totalQty += holding.qty;
          impactData[holding.name].totalValue += (holding.price * holding.qty);
          
          if (holding.userId) {
            impactData[holding.name].users.add(holding.userId);
          }
        });
        
        // Convert to final format
        const formattedImpact = {};
        const userCountsFormatted = {};
        
        Object.keys(impactData).forEach(stockName => {
          formattedImpact[stockName] = {
            totalQty: impactData[stockName].totalQty,
            totalValue: impactData[stockName].totalValue,
          };
          userCountsFormatted[stockName] = impactData[stockName].users.size;
        });
        
        setHoldingsImpact(formattedImpact);
        setTotalUsers(userCountsFormatted);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching holdings impact data:', error);
        setLoading(false);
      }
    };

    fetchHoldingsData();
  }, [stocks]);

  // Check if we need to add missing stocks from the required list
  useEffect(() => {
    const addMissingStocks = async () => {
      // List of required stocks
      const requiredStocks = [
        "INFY", "ONGC", "TCS", "KPITTECH", "QUICKHEAL", 
        "WIPRO", "M&M", "RELIANCE", "HUL"
      ];
      
      // Get current stock symbols
      const currentSymbols = new Set(uniqueStocks.map(stock => stock.symbol || stock.name));
      
      // Find missing stocks
      const missingStocks = requiredStocks.filter(symbol => !currentSymbols.has(symbol));
      
      if (missingStocks.length > 0) {
        console.log("Missing stocks that will be automatically added:", missingStocks);
        
        // For now, just log the missing stocks
        // In a real implementation, you might want to add these to the database
      }
    };
    
    if (uniqueStocks.length > 0) {
      addMissingStocks();
    }
  }, [uniqueStocks]);

  if (!uniqueStocks || uniqueStocks.length === 0) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon">📊</div>
        <h3>No Stocks Found</h3>
        <p>Add a new stock to get started with price management.</p>
      </div>
    );
  }

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Format date to local date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Day Change</th>
            <th>Total Holdings</th>
            <th>Users Affected</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {uniqueStocks.map((stock) => {
            const stockSymbol = stock.symbol || stock.name;
            const impact = holdingsImpact[stockSymbol] || { totalQty: 0, totalValue: 0 };
            
            return (
              <tr key={stock._id || stockSymbol}>
                <td className="admin-table-symbol">{stockSymbol}</td>
                <td>{stock.name}</td>
                <td className="admin-table-price">{formatCurrency(stock.price)}</td>
                <td>
                  <span 
                    className={`admin-badge ${stock.dayChange?.startsWith('+') || parseFloat(stock.dayChange) > 0 
                      ? 'admin-badge-success' 
                      : 'admin-badge-danger'}`}
                  >
                    {stock.dayChange || '+0.00%'}
                  </span>
                </td>
                <td>
                  {loading ? (
                    <span className="admin-loading-small">Loading...</span>
                  ) : (
                    <div className="holdings-data">
                      <div>{formatNumber(impact.totalQty || 0)} shares</div>
                      <div className="admin-value-small">{formatCurrency(impact.totalValue || 0)}</div>
                    </div>
                  )}
                </td>
                <td>
                  {loading ? (
                    <span className="admin-loading-small">Loading...</span>
                  ) : (
                    <span className="admin-badge admin-badge-info">
                      {totalUsers[stockSymbol] || 0} users
                    </span>
                  )}
                </td>
                <td>{formatDate(stock.updatedAt || new Date())}</td>
                <td>
                  <button
                    onClick={() => onEditClick(stock)}
                    className="admin-button admin-button-secondary"
                  >
                    Edit Price
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockPriceTable; 