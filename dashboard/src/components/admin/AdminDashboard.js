import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GeneralContext from '../GeneralContext';
import StockPriceTable from './StockPriceTable';
import StockPriceForm from './StockPriceForm';
import './AdminStyles.css';

// List of required stocks
const REQUIRED_STOCKS = [
  {
    symbol: "NIFTY50",
    name: "Nifty 50 Index",
    price: 22567.75,
    dayChange: "+0.53%"
  },
  {
    symbol: "SENSEX",
    name: "BSE Sensex",
    price: 74339.44,
    dayChange: "+0.48%"
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd.",
    price: 1555.45,
    dayChange: "-1.60%"
  },
  {
    symbol: "ONGC",
    name: "Oil and Natural Gas Corporation Ltd.",
    price: 116.8,
    dayChange: "-0.09%"
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services Ltd.",
    price: 3194.8,
    dayChange: "-0.25%"
  },
  {
    symbol: "KPITTECH",
    name: "KPIT Technologies Ltd.",
    price: 266.45,
    dayChange: "+3.54%"
  },
  {
    symbol: "QUICKHEAL",
    name: "Quick Heal Technologies Ltd.",
    price: 308.55,
    dayChange: "-0.15%"
  },
  {
    symbol: "WIPRO",
    name: "Wipro Ltd.",
    price: 577.75,
    dayChange: "+0.32%"
  },
  {
    symbol: "M&M",
    name: "Mahindra & Mahindra Ltd.",
    price: 779.8,
    dayChange: "-0.01%"
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd.",
    price: 2112.4,
    dayChange: "+1.44%"
  },
  {
    symbol: "HUL",
    name: "Hindustan Unilever Ltd.",
    price: 512.4,
    dayChange: "+1.04%"
  }
];

const AdminDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useContext(GeneralContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminInfo = localStorage.getItem('adminInfo');
    if (!adminInfo && !user?.isAdmin) {
      navigate('/admin/login');
      return;
    }

    // Fetch stocks
    fetchStocks();

    // Clean up on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [navigate, user]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      // Fetch both from backend and from holdings for demo purposes
      let stockData = [];
      
      try {
        const stocksResponse = await axios.get('http://localhost:5000/api/stocks');
        stockData = stocksResponse.data;
      } catch (err) {
        console.log('No stocks in backend, fetching from holdings');
      }
      
      // If no stocks in backend, fetch holdings as stocks for demo
      if (stockData.length === 0) {
        const holdingsResponse = await axios.get('http://localhost:5000/allHoldings');
        stockData = holdingsResponse.data.map(holding => ({
          _id: holding._id,
          symbol: holding.name,
          name: holding.name,
          price: holding.price,
          dayChange: holding.day || '+0.00%',
          updatedAt: holding.updatedAt || new Date()
        }));
      }
      
      // Check if we have all required stocks
      await ensureRequiredStocksExist(stockData);
      
      setStocks(stockData);
      setError('');
    } catch (error) {
      setError('Failed to fetch stocks. Please try again.');
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ensure all required stocks exist
  const ensureRequiredStocksExist = async (existingStocks) => {
    try {
      // Create a set of existing stock symbols
      const existingSymbols = new Set(existingStocks.map(stock => stock.symbol || stock.name));
      
      // Filter required stocks that don't exist yet
      const missingStocks = REQUIRED_STOCKS.filter(
        reqStock => !existingSymbols.has(reqStock.symbol)
      );
      
      if (missingStocks.length > 0) {
        console.log('Adding missing stocks:', missingStocks);
        
        // For each missing stock, create a holding
        for (const stock of missingStocks) {
          try {
            // Create a mock holding for this stock
            const newHolding = {
              name: stock.symbol,
              qty: 0,
              avg: stock.price,
              price: stock.price,
              day: stock.dayChange,
              net: "0.00%",
              isDemo: true,
              updatedAt: new Date()
            };
            
            // Add to existing stocks immediately for UI display
            existingStocks.push({
              _id: `temp-${stock.symbol}`,
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              dayChange: stock.dayChange,
              updatedAt: new Date()
            });
            
            // Create the holding in backend if possible
            try {
              await axios.post('http://localhost:5000/createStockHolding', newHolding);
            } catch (err) {
              console.log('Could not create holding in backend, using local only', err);
            }
          } catch (err) {
            console.error(`Error adding stock ${stock.symbol}:`, err);
          }
        }
        
        // Show success message
        setSuccessMessage(`Added ${missingStocks.length} required stocks that were missing`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error ensuring required stocks exist:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const handleAddClick = () => {
    setCurrentStock(null);
    setShowForm(true);
  };

  const handleEditClick = (stock) => {
    setCurrentStock(stock);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setCurrentStock(null);
  };

  const handleUpdatePrice = async (stockData) => {
    try {
      const { symbol, name, price } = stockData;
      
      // Show loading message
      setError('');
      setSuccessMessage(`Updating ${symbol} price...`);
      
      console.log("Attempting to update stock price", { symbol, name, price });
      
      // Use our new centralized endpoint to update the stock price
      try {
        const updateResponse = await axios.post('http://localhost:5000/updateStockPrice', {
          symbol,
          name: name || symbol,
          price
        });
        console.log("Stock price update response:", updateResponse.data);
      } catch (err) {
        console.error("Error calling updateStockPrice:", err.response?.data || err.message);
        throw new Error(`Error updating stock price: ${err.response?.data?.message || err.message}`);
      }
      
      // Also update the local watchlist data in memory
      try {
        const localDataResponse = await axios.post('http://localhost:5000/updateLocalData', {
          symbol,
          price
        });
        console.log("Local data update response:", localDataResponse.data);
      } catch (err) {
        console.error("Error calling updateLocalData:", err.response?.data || err.message);
        // Don't throw here, as it's less critical
      }
      
      // Refresh stock list
      await fetchStocks();
      setShowForm(false);
      setCurrentStock(null);
      
      // Dispatch a global event for other components to refresh
      window.dispatchEvent(new CustomEvent('stockPriceUpdated'));
      
      // Show success message
      setError('');
      setSuccessMessage(`Successfully updated ${symbol} price to ₹${price}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating stock price:', error);
      setError(`Failed to update stock price: ${error.message || 'Unknown error'}`);
    }
  };

  const toggleLiveUpdates = () => {
    if (liveUpdatesEnabled) {
      // Disable live updates
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      setLiveUpdatesEnabled(false);
    } else {
      // Enable live updates
      const interval = setInterval(() => {
        fetchStocks();
      }, 10000); // Refresh every 10 seconds
      setRefreshInterval(interval);
      setLiveUpdatesEnabled(true);
    }
  };

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}');

  // Format current date and time
  const formatCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <img src="/media/images/logo.png" alt="InvestoX Logo" className="admin-logo" />
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-header-right">
            <div className="admin-user-info">
              <span className="admin-username">{adminInfo.username || user?.username || 'Admin'}</span>
              <span className="admin-email">{adminInfo.email || user?.email || 'admin@investox.com'}</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <div className="admin-sidebar">
          <ul className="admin-nav">
            <li className="admin-nav-item active">
              <a href="#stocks">Stock Prices</a>
            </li>
            <li className="admin-nav-item">
              <a href="#dashboard" onClick={() => navigate('/')}>Main Dashboard</a>
            </li>
          </ul>

          <div className="admin-sidebar-info">
            <div className="admin-sidebar-info-item">
              <span className="admin-sidebar-info-label">Last updated:</span>
              <span className="admin-sidebar-info-value">{formatCurrentDateTime()}</span>
            </div>
            <div className="admin-sidebar-info-item">
              <span className="admin-sidebar-info-label">Market status:</span>
              <span className="admin-sidebar-info-value">
                <span className="admin-live-price">Open</span>
              </span>
            </div>
            <div className="admin-sidebar-info-item">
              <span className="admin-sidebar-info-label">Total stocks:</span>
              <span className="admin-sidebar-info-value">{stocks.length}</span>
            </div>
          </div>
        </div>

        <main className="admin-main">
          {error && (
            <div className="admin-alert admin-alert-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="admin-alert admin-alert-success">
              {successMessage}
            </div>
          )}

          <div className="admin-page-header">
            <h2>Stock Price Management</h2>
            <div className="admin-header-actions">
              <button
                onClick={toggleLiveUpdates}
                className={`admin-button ${liveUpdatesEnabled ? 'admin-button-danger' : 'admin-button-secondary'}`}
              >
                {liveUpdatesEnabled ? 'Disable Live Updates' : 'Enable Live Updates'}
              </button>
              <button
                onClick={handleAddClick}
                className="admin-button admin-button-primary"
              >
                Add New Stock
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Stock Price Management</h3>
              <div className="admin-card-tools">
                <button
                  onClick={fetchStocks}
                  className="admin-button admin-button-sm admin-button-secondary"
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="admin-card-body">
              {liveUpdatesEnabled && (
                <div className="admin-notice admin-notice-info">
                  <span className="admin-live-price">Live updates enabled</span> - Stock prices are being refreshed automatically every 10 seconds. 
                  Any changes you make will be immediately visible to all users.
                </div>
              )}
              
              {loading ? (
                <div className="admin-loading">
                  <div className="admin-spinner"></div>
                  <p>Loading stocks...</p>
                </div>
              ) : (
                <StockPriceTable
                  stocks={stocks}
                  onEditClick={handleEditClick}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {showForm && (
        <div className="admin-modal-overlay">
          <StockPriceForm
            stock={currentStock}
            onSave={handleUpdatePrice}
            onCancel={handleFormClose}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 