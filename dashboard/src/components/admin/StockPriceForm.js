import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminStyles.css';

const StockPriceForm = ({ stock, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    price: '',
    dayChange: '+0.00%'
  });
  const [error, setError] = useState('');
  const [holdingsData, setHoldingsData] = useState(null);
  const [priceImpact, setPriceImpact] = useState({
    priceChange: 0,
    percentChange: 0,
    totalImpact: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stock) {
      setFormData({
        symbol: stock.symbol || '',
        name: stock.name || '',
        price: stock.price || 0,
        dayChange: stock.dayChange || '+0.00%'
      });
      
      // Fetch holdings data for this stock
      fetchHoldingsData(stock.symbol || stock.name);
    }
  }, [stock]);

  const fetchHoldingsData = async (stockSymbol) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/allHoldings');
      const holdings = response.data.filter(holding => 
        holding.name === stockSymbol
      );
      
      const totalShares = holdings.reduce((sum, holding) => sum + holding.qty, 0);
      const totalValue = holdings.reduce((sum, holding) => sum + (holding.price * holding.qty), 0);
      const uniqueUsers = new Set(holdings.map(holding => holding.userId)).size;
      
      setHoldingsData({
        totalShares,
        totalValue,
        uniqueUsers,
        holdings
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching holdings data:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // For price, ensure it's a valid number
      if (value === '' || !isNaN(value)) {
        const newPrice = value === '' ? '' : parseFloat(value);
        setFormData({
          ...formData,
          [name]: newPrice
        });
        
        // Calculate price impact
        if (stock && newPrice && holdingsData) {
          const oldPrice = stock.price;
          const priceDiff = newPrice - oldPrice;
          const percentDiff = (priceDiff / oldPrice) * 100;
          const totalImpact = priceDiff * holdingsData.totalShares;
          
          setPriceImpact({
            priceChange: priceDiff,
            percentChange: percentDiff,
            totalImpact
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.symbol) {
      setError('Stock symbol is required');
      return;
    }
    
    if (!formData.name) {
      setError('Stock name is required');
      return;
    }
    
    // Validate price is a number and greater than 0
    const numericPrice = parseFloat(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Price must be a valid number greater than 0');
      return;
    }
    
    // Clear any errors
    setError('');
    
    // Ensure price is formatted as a number not a string
    const processedData = {
      ...formData,
      price: numericPrice
    };
    
    console.log('Submitting stock data:', processedData);
    
    // Save the stock with properly formatted price
    onSave(processedData);
  };

  // Format currency for Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-header">
        <h3>{stock ? 'Edit Stock Price' : 'Add New Stock'}</h3>
        <button 
          onClick={onCancel}
          className="admin-form-close"
        >
          ×
        </button>
      </div>
      
      {error && (
        <div className="admin-form-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-group">
          <label htmlFor="symbol">Stock Symbol</label>
          <input
            type="text"
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="e.g. RELIANCE"
            readOnly={!!stock} // Make symbol read-only if editing
            required
          />
          {stock && (
            <small className="admin-form-hint">Symbol cannot be changed once created.</small>
          )}
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="name">Stock Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Reliance Industries Ltd."
            required
          />
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="price">Current Price (₹)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 2500.75"
            step="0.01"
            min="0.01"
            required
          />
          
          {stock && holdingsData && (
            <div className="admin-price-impact-container">
              <div className="admin-price-impact-title">Impact Analysis:</div>
              
              <div className="admin-price-impact">
                <div className="admin-price-impact-item">
                  <span className="admin-price-impact-label">Current Price:</span>
                  <span className="admin-price-impact-value">{formatCurrency(stock.price)}</span>
                </div>
                
                <div className="admin-price-impact-item">
                  <span className="admin-price-impact-label">New Price:</span>
                  <span className="admin-price-impact-value">{formatCurrency(formData.price)}</span>
                </div>
                
                <div className="admin-price-impact-item">
                  <span className="admin-price-impact-label">Change:</span>
                  <span className={`admin-price-impact-value ${priceImpact.priceChange >= 0 ? 'positive' : 'negative'}`}>
                    {priceImpact.priceChange >= 0 ? '+' : ''}{formatCurrency(priceImpact.priceChange)} 
                    ({priceImpact.percentChange >= 0 ? '+' : ''}{priceImpact.percentChange.toFixed(2)}%)
                  </span>
                </div>
                
                <div className="admin-price-impact-item">
                  <span className="admin-price-impact-label">Total Shares:</span>
                  <span className="admin-price-impact-value">{formatNumber(holdingsData.totalShares)}</span>
                </div>
                
                <div className="admin-price-impact-item">
                  <span className="admin-price-impact-label">Users Affected:</span>
                  <span className="admin-price-impact-value">{holdingsData.uniqueUsers}</span>
                </div>
                
                <div className="admin-price-impact-item total">
                  <span className="admin-price-impact-label">Total P&L Impact:</span>
                  <span className={`admin-price-impact-value ${priceImpact.totalImpact >= 0 ? 'positive' : 'negative'}`}>
                    {priceImpact.totalImpact >= 0 ? '+' : ''}{formatCurrency(priceImpact.totalImpact)}
                  </span>
                </div>
              </div>
              
              <div className="admin-price-impact-warning">
                This price change will affect {holdingsData.uniqueUsers} user(s) with a total of {formatNumber(holdingsData.totalShares)} shares.
              </div>
            </div>
          )}
          
          <small className="admin-form-hint">
            This will update the price for all users who hold this stock.
          </small>
        </div>
        
        <div className="admin-form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="admin-button admin-button-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-button admin-button-primary"
          >
            {stock ? 'Update Price' : 'Add Stock'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockPriceForm; 