import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import GeneralContext from './GeneralContext';
import './BuyActionWindow.css';

const AdvancedOrderWindow = ({ uid, type = 'buy' }) => {
  const { closeBuyWindow, closeSellWindow, handleCloseAdvancedOrderWindow, user } = useContext(GeneralContext);
  
  const [stockInfo, setStockInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [triggerPrice, setTriggerPrice] = useState(0);
  const [orderType, setOrderType] = useState('MARKET');
  const [productType, setProductType] = useState('CNC');
  const [validity, setValidity] = useState('DAY');
  const [disclosedQty, setDisclosedQty] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [target, setTarget] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch stock info from watchlist or API
    const stockData = {
      name: uid,
      price: uid === 'RELIANCE' ? 2112.4 : 
             uid === 'INFY' ? 1555.45 :
             uid === 'TCS' ? 3194.8 : 1000,
      // Other data like LTP, bid/ask can be added here
    };
    
    setStockInfo(stockData);
    setPrice(stockData.price);
    
    // Set appropriate trigger price based on order type and buy/sell
    if (type === 'buy') {
      setTriggerPrice(Math.floor(stockData.price * 0.98));
    } else {
      setTriggerPrice(Math.ceil(stockData.price * 1.02));
    }
  }, [uid, type]);

  const handleClose = () => {
    if (type === 'buy') {
      closeBuyWindow();
    } else {
      closeSellWindow();
    }
  };

  const handleOrderTypeChange = (newType) => {
    setOrderType(newType);
    
    // Reset price for market orders
    if (newType === 'MARKET') {
      setPrice(0);
    } else if (stockInfo) {
      setPrice(stockInfo.price);
    }
  };

  const calculateTotal = () => {
    if (!price || !quantity) return 0;
    return (price * quantity).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    try {
      if (!stockInfo) {
        setError("Stock data not available");
        return;
      }
      
      const orderPrice = orderType === 'MARKET' ? stockInfo.price : price;
      
      // Validate price
      if (orderType !== 'MARKET' && (!orderPrice || orderPrice <= 0)) {
        setError("Please enter a valid price");
        return;
      }
      
      // Validate trigger price for SL and SL-M orders
      if (['SL', 'SL-M'].includes(orderType) && (!triggerPrice || triggerPrice <= 0)) {
        setError("Please enter a valid trigger price");
        return;
      }
      
      // Place order with the new endpoint
      const response = await axios.post('http://localhost:5000/placeOrder', {
        userId: user?.id,
        name: stockInfo.name,
        qty: quantity,
        price: orderPrice,
        mode: type.toUpperCase()
      });
      
      setMessage('Order placed successfully!');
      
      // Close the window after a delay
      setTimeout(() => {
        handleCloseAdvancedOrderWindow();
      }, 1500);
    } catch (error) {
      console.error('Order placement error:', error);
      setError(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (!stockInfo) return null;

  return (
    <div className="action-window-container">
      <div className="action-window">
        <div className="action-header">
          <h3>{type === 'buy' ? 'Buy' : 'Sell'} {uid}</h3>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="action-body">
          <div className="order-types">
            <div 
              className={`order-type ${orderType === 'MARKET' ? 'active' : ''}`}
              onClick={() => handleOrderTypeChange('MARKET')}
            >
              MARKET
            </div>
            <div 
              className={`order-type ${orderType === 'LIMIT' ? 'active' : ''}`}
              onClick={() => handleOrderTypeChange('LIMIT')}
            >
              LIMIT
            </div>
            <div 
              className={`order-type ${orderType === 'SL' ? 'active' : ''}`}
              onClick={() => handleOrderTypeChange('SL')}
            >
              SL
            </div>
            <div 
              className={`order-type ${orderType === 'SL-M' ? 'active' : ''}`}
              onClick={() => handleOrderTypeChange('SL-M')}
            >
              SL-M
            </div>
          </div>
          
          <div className="product-types">
            <div 
              className={`product-type ${productType === 'CNC' ? 'active' : ''}`}
              onClick={() => setProductType('CNC')}
            >
              CNC
            </div>
            <div 
              className={`product-type ${productType === 'NRML' ? 'active' : ''}`}
              onClick={() => setProductType('NRML')}
            >
              NRML
            </div>
            <div 
              className={`product-type ${productType === 'MIS' ? 'active' : ''}`}
              onClick={() => setProductType('MIS')}
            >
              MIS
            </div>
          </div>
          
          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
            />
          </div>
          
          {orderType !== 'MARKET' && (
            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                step="0.05"
                min="0"
              />
            </div>
          )}
          
          {['SL', 'SL-M'].includes(orderType) && (
            <div className="form-group">
              <label>Trigger Price</label>
              <input 
                type="number" 
                value={triggerPrice} 
                onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                step="0.05"
                min="0"
              />
            </div>
          )}
          
          <div className="advanced-options">
            <button 
              className="advanced-toggle" 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
            
            {showAdvanced && (
              <>
                <div className="form-group">
                  <label>Validity</label>
                  <select 
                    value={validity} 
                    onChange={(e) => setValidity(e.target.value)}
                  >
                    <option value="DAY">Day</option>
                    <option value="IOC">Immediate or Cancel</option>
                    <option value="TTL">Till Triggered</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Disclosed Qty</label>
                  <input 
                    type="number" 
                    value={disclosedQty} 
                    onChange={(e) => setDisclosedQty(parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div className="target-stoploss">
                  <div className="form-group">
                    <label>Target</label>
                    <input 
                      type="number" 
                      value={target} 
                      onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                      step="0.05"
                      min="0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Stop Loss</label>
                    <input 
                      type="number" 
                      value={stopLoss} 
                      onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                      step="0.05"
                      min="0"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="order-summary">
            <div className="summary-item">
              <span>Est. Value:</span>
              <span>₹ {calculateTotal()}</span>
            </div>
            <div className="summary-item">
              <span>Type:</span>
              <span>{productType} {orderType}</span>
            </div>
          </div>
          
          <button
            className={`action-btn ${type === 'buy' ? 'buy-btn' : 'sell-btn'}`}
            onClick={handlePlaceOrder}
          >
            {type === 'buy' ? 'Buy' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOrderWindow; 