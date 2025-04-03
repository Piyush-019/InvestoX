import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css"; // Reuse the same CSS

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [productType, setProductType] = useState('CNC');
  const { closeSellWindow, user } = useContext(GeneralContext);

  const handleSellClick = async (e) => {
    e.preventDefault();
    if (stockPrice <= 0 || stockQuantity <= 0) {
      setError("Please enter valid price and quantity");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/placeOrder", {
        userId: user?.id,
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: "SELL",
        product: productType
      });
      
      setMessage("Order placed successfully!");
      
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
              onChange={(e) => setStockPrice(parseFloat(e.target.value) || 0)}
              value={stockPrice}
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