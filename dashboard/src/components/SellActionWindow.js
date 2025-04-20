import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { watchlist, holdings } from "../data/data";
import "./BuyActionWindow.css"; // Reuse the same CSS

const SellActionWindow = ({ stockUID, onClose }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [productType, setProductType] = useState('CNC');
  const [stockData, setStockData] = useState(null);
  const [executeImmediately, setExecuteImmediately] = useState(true);
  const { closeSellWindow, user } = useContext(GeneralContext);

  // Fetch current stock price when component mounts or when stock price is updated
  useEffect(() => {
    if (stockUID) {
      fetchStockPrice();
      
      // Setup listener for stock price updates
      const handleStockPriceUpdate = () => {
        fetchStockPrice();
      };
      
      // Add event listener for stock price updates
      window.addEventListener('stockPriceUpdated', handleStockPriceUpdate);
      
      // Cleanup listener on unmount
      return () => {
        window.removeEventListener('stockPriceUpdated', handleStockPriceUpdate);
      };
    }
  }, [stockUID]);

  // Function to fetch stock price from backend or local data
  const fetchStockPrice = async () => {
    try {
      // First try fetching from backend
      const response = await axios.get(`http://localhost:5000/stock/${stockUID}`);
      if (response.data) {
        setStockData(response.data);
        setStockPrice(response.data.price);
        return;
      }
    } catch (error) {
      console.log("Could not fetch from API, using local data");
    }

    // If backend fails, try local watchlist data
    const watchItem = watchlist.find(item => item.name === stockUID);
    if (watchItem) {
      setStockData(watchItem);
      setStockPrice(watchItem.price);
      return;
    }

    // If not in watchlist, try holdings
    const holdingItem = holdings.find(item => item.name === stockUID);
    if (holdingItem) {
      setStockData(holdingItem);
      setStockPrice(holdingItem.price);
      return;
    }

    // If all else fails, keep the default value
    setError("Could not fetch current stock price. Please enter manually.");
  };

  const handleSellClick = async (e) => {
    e.preventDefault();
    if (stockPrice <= 0 || stockQuantity <= 0) {
      setError("Please enter valid price and quantity");
      return;
    }

    try {
      // If execute immediately is checked, use the exact current price from stockData
      const priceToUse = executeImmediately && stockData ? stockData.price : stockPrice;
      
      const response = await axios.post("http://localhost:5000/placeOrder", {
        userId: user?.id,
        name: stockUID,
        qty: stockQuantity,
        price: priceToUse,
        mode: "SELL",
        product: productType,
        executeImmediately
      });
      
      // Check if the order was executed or just placed
      const orderStatus = response.data.status;
      const successMessage = orderStatus === 'executed' 
        ? "Order executed successfully!" 
        : "Order placed successfully!";
      
      setMessage(successMessage);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('orderPlaced', { detail: response.data }));
      
      // Close window after delay
      setTimeout(() => {
        closeSellWindow();
      }, 1500);
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.response?.data?.message || "Failed to place sell order. Please try again.");
    }
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    closeSellWindow();
  };

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="stock-info">
        <h3>{stockUID}</h3>
        {stockData && (
          <div className="current-price">
            Current Price: <span className={stockData.isDown ? "price-down" : "price-up"}>
              ₹{stockData.price.toFixed(2)}
            </span>
          </div>
        )}
      </div>
      
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 1)}
              value={stockQuantity}
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              min="0"
              step="0.05"
              onChange={(e) => {
                setStockPrice(parseFloat(e.target.value) || 0);
                // If user manually changes price, they might want a specific price
                setExecuteImmediately(false);
              }}
              value={executeImmediately && stockData ? stockData.price : stockPrice}
              disabled={executeImmediately}
            />
          </fieldset>
          <fieldset>
            <legend>Product</legend>
            <select 
              name="product" 
              id="product"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
            >
              <option value="CNC">CNC</option>
              <option value="NRML">NRML</option>
              <option value="MIS">MIS</option>
            </select>
          </fieldset>
          
          <div className="execution-option">
            <label>
              <input
                type="checkbox"
                checked={executeImmediately}
                onChange={() => setExecuteImmediately(!executeImmediately)}
              />
              Execute at market price
            </label>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
      </div>

      <div className="buttons">
        <span>Margin required ₹{(stockPrice * stockQuantity).toFixed(2)}</span>
        <div>
          <Link to="#" className="btn btn-blue" onClick={handleSellClick}>
            Sell
          </Link>
          <Link to="#" className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow; 