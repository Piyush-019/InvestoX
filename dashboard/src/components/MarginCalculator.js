import React, { useState, useEffect } from 'react';
import './MarginCalculator.css';

const MarginCalculator = () => {
  const [calculatorType, setCalculatorType] = useState('equity');
  const [equity, setEquity] = useState({
    symbol: '',
    quantity: 1,
    price: 0,
    mis: false
  });
  const [futures, setFutures] = useState({
    symbol: '',
    quantity: 1,
    price: 0,
    mis: false
  });
  const [options, setOptions] = useState({
    symbol: '',
    optionType: 'CE',
    strikePrice: 0,
    quantity: 1,
    price: 0,
    mis: false
  });
  const [currency, setCurrency] = useState({
    symbol: 'USDINR',
    quantity: 1,
    price: 0,
    mis: false
  });
  const [marginRequired, setMarginRequired] = useState(0);
  const [leverageObtained, setLeverageObtained] = useState(1);
  
  // Sample stock list for dropdown
  const stockList = [
    { symbol: 'RELIANCE', price: 2112.4, segment: 'NSE' },
    { symbol: 'INFY', price: 1555.45, segment: 'NSE' },
    { symbol: 'TCS', price: 3194.8, segment: 'NSE' },
    { symbol: 'HDFCBANK', price: 1522.35, segment: 'NSE' },
    { symbol: 'ONGC', price: 116.8, segment: 'NSE' },
    { symbol: 'SBIN', price: 430.2, segment: 'NSE' },
    { symbol: 'WIPRO', price: 577.75, segment: 'NSE' },
    { symbol: 'ITC', price: 207.9, segment: 'NSE' },
    { symbol: 'USDINR', price: 83.25, segment: 'CDS' },
    { symbol: 'EURINR', price: 91.05, segment: 'CDS' },
  ];
  
  const futuresList = [
    { symbol: 'RELIANCE JUL FUT', price: 2115.5, lot: 250 },
    { symbol: 'NIFTY JUL FUT', price: 22450, lot: 50 },
    { symbol: 'BANKNIFTY JUL FUT', price: 47850, lot: 25 },
    { symbol: 'INFY JUL FUT', price: 1558.0, lot: 300 },
  ];
  
  const optionsList = [
    { symbol: 'NIFTY 22400 CE', price: 150.25, strikePrice: 22400, type: 'CE', lot: 50 },
    { symbol: 'NIFTY 22400 PE', price: 120.75, strikePrice: 22400, type: 'PE', lot: 50 },
    { symbol: 'NIFTY 22500 CE', price: 110.50, strikePrice: 22500, type: 'CE', lot: 50 },
    { symbol: 'BANKNIFTY 48000 CE', price: 250.35, strikePrice: 48000, type: 'CE', lot: 25 },
  ];

  useEffect(() => {
    calculateMargin();
  }, [equity, futures, options, currency, calculatorType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEquityChange = (field, value) => {
    let updatedEquity = { ...equity, [field]: value };
    
    // Auto-populate price if symbol is selected
    if (field === 'symbol' && value) {
      const stock = stockList.find(s => s.symbol === value);
      if (stock) {
        updatedEquity.price = stock.price;
      }
    }
    
    setEquity(updatedEquity);
  };

  const handleFuturesChange = (field, value) => {
    let updatedFutures = { ...futures, [field]: value };
    
    // Auto-populate price if symbol is selected
    if (field === 'symbol' && value) {
      const future = futuresList.find(f => f.symbol === value);
      if (future) {
        updatedFutures.price = future.price;
      }
    }
    
    setFutures(updatedFutures);
  };

  const handleOptionsChange = (field, value) => {
    let updatedOptions = { ...options, [field]: value };
    
    // Auto-populate price if symbol is selected
    if (field === 'symbol' && value) {
      const option = optionsList.find(o => o.symbol === value);
      if (option) {
        updatedOptions.price = option.price;
        updatedOptions.strikePrice = option.strikePrice;
        updatedOptions.optionType = option.type;
      }
    }
    
    setOptions(updatedOptions);
  };

  const handleCurrencyChange = (field, value) => {
    setCurrency({ ...currency, [field]: value });
  };

  const calculateMargin = () => {
    let margin = 0;
    let exposure = 0;
    
    switch(calculatorType) {
      case 'equity':
        exposure = equity.price * equity.quantity;
        // Simplified margin calculation logic
        // In a real app, this would use SPAN margins and VaR
        margin = equity.mis ? exposure * 0.2 : exposure * 0.8;
        break;
        
      case 'futures':
        exposure = futures.price * futures.quantity;
        // Futures typically require 10-15% margin, less for MIS
        margin = futures.mis ? exposure * 0.1 : exposure * 0.15;
        break;
        
      case 'options':
        exposure = options.price * options.quantity;
        if (options.optionType === 'CE' || options.optionType === 'PE') {
          // For buying options, full premium is required
          margin = exposure;
        } else {
          // For selling options, higher margin is required
          margin = options.mis ? exposure * 0.25 : exposure * 0.4;
        }
        break;
        
      case 'currency':
        exposure = currency.price * currency.quantity * 1000; // Lot size 1000
        margin = currency.mis ? exposure * 0.05 : exposure * 0.08;
        break;
        
      default:
        margin = 0;
    }
    
    setMarginRequired(margin.toFixed(2));
    setLeverageObtained(exposure > 0 ? (exposure / margin).toFixed(2) : 1);
  };

  const renderCalculator = () => {
    switch(calculatorType) {
      case 'equity':
        return (
          <div className="calculator-form">
            <div className="form-group">
              <label>Symbol</label>
              <select 
                value={equity.symbol} 
                onChange={(e) => handleEquityChange('symbol', e.target.value)}
              >
                <option value="">Select Symbol</option>
                {stockList.filter(s => s.segment === 'NSE').map(stock => (
                  <option key={stock.symbol} value={stock.symbol}>{stock.symbol}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Quantity</label>
              <input 
                type="number" 
                value={equity.quantity} 
                onChange={(e) => handleEquityChange('quantity', Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                value={equity.price} 
                onChange={(e) => handleEquityChange('price', parseFloat(e.target.value) || 0)}
                step="0.05"
              />
            </div>
            
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={equity.mis} 
                  onChange={(e) => handleEquityChange('mis', e.target.checked)}
                />
                MIS (Intraday)
              </label>
            </div>
          </div>
        );
        
      case 'futures':
        return (
          <div className="calculator-form">
            <div className="form-group">
              <label>Futures Contract</label>
              <select 
                value={futures.symbol} 
                onChange={(e) => handleFuturesChange('symbol', e.target.value)}
              >
                <option value="">Select Futures</option>
                {futuresList.map(future => (
                  <option key={future.symbol} value={future.symbol}>{future.symbol}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Lots</label>
              <input 
                type="number" 
                value={futures.quantity} 
                onChange={(e) => handleFuturesChange('quantity', Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                value={futures.price} 
                onChange={(e) => handleFuturesChange('price', parseFloat(e.target.value) || 0)}
                step="0.05"
              />
            </div>
            
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={futures.mis} 
                  onChange={(e) => handleFuturesChange('mis', e.target.checked)}
                />
                MIS (Intraday)
              </label>
            </div>
          </div>
        );
        
      case 'options':
        return (
          <div className="calculator-form">
            <div className="form-group">
              <label>Options Contract</label>
              <select 
                value={options.symbol} 
                onChange={(e) => handleOptionsChange('symbol', e.target.value)}
              >
                <option value="">Select Options</option>
                {optionsList.map(option => (
                  <option key={option.symbol} value={option.symbol}>{option.symbol}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Option Type</label>
              <select 
                value={options.optionType} 
                onChange={(e) => handleOptionsChange('optionType', e.target.value)}
              >
                <option value="CE">Call (CE)</option>
                <option value="PE">Put (PE)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Strike Price</label>
              <input 
                type="number" 
                value={options.strikePrice} 
                onChange={(e) => handleOptionsChange('strikePrice', parseFloat(e.target.value) || 0)}
                step="0.05"
              />
            </div>
            
            <div className="form-group">
              <label>Lots</label>
              <input 
                type="number" 
                value={options.quantity} 
                onChange={(e) => handleOptionsChange('quantity', Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                value={options.price} 
                onChange={(e) => handleOptionsChange('price', parseFloat(e.target.value) || 0)}
                step="0.05"
              />
            </div>
            
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={options.mis} 
                  onChange={(e) => handleOptionsChange('mis', e.target.checked)}
                />
                MIS (Intraday)
              </label>
            </div>
          </div>
        );
        
      case 'currency':
        return (
          <div className="calculator-form">
            <div className="form-group">
              <label>Currency Pair</label>
              <select 
                value={currency.symbol} 
                onChange={(e) => handleCurrencyChange('symbol', e.target.value)}
              >
                <option value="USDINR">USD-INR</option>
                <option value="EURINR">EUR-INR</option>
                <option value="GBPINR">GBP-INR</option>
                <option value="JPYINR">JPY-INR</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Lots</label>
              <input 
                type="number" 
                value={currency.quantity} 
                onChange={(e) => handleCurrencyChange('quantity', Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>Price</label>
              <input 
                type="number" 
                value={currency.price} 
                onChange={(e) => handleCurrencyChange('price', parseFloat(e.target.value) || 0)}
                step="0.0001"
              />
            </div>
            
            <div className="form-group checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={currency.mis} 
                  onChange={(e) => handleCurrencyChange('mis', e.target.checked)}
                />
                MIS (Intraday)
              </label>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="margin-calculator">
      <h2>Margin Calculator</h2>
      
      <div className="calculator-tabs">
        <button 
          className={calculatorType === 'equity' ? 'active' : ''} 
          onClick={() => setCalculatorType('equity')}
        >
          Equity
        </button>
        <button 
          className={calculatorType === 'futures' ? 'active' : ''} 
          onClick={() => setCalculatorType('futures')}
        >
          Futures
        </button>
        <button 
          className={calculatorType === 'options' ? 'active' : ''} 
          onClick={() => setCalculatorType('options')}
        >
          Options
        </button>
        <button 
          className={calculatorType === 'currency' ? 'active' : ''} 
          onClick={() => setCalculatorType('currency')}
        >
          Currency
        </button>
      </div>
      
      {renderCalculator()}
      
      <div className="margin-results">
        <div className="result-item">
          <span>Margin Required:</span>
          <span className="result-value">₹ {marginRequired}</span>
        </div>
        <div className="result-item">
          <span>Leverage:</span>
          <span className="result-value">{leverageObtained}x</span>
        </div>
      </div>
    </div>
  );
};

export default MarginCalculator; 