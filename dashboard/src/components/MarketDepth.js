import React, { useState, useEffect } from 'react';
import './MarketDepth.css';

const MarketDepth = ({ symbol = 'RELIANCE' }) => {
  const [marketDepth, setMarketDepth] = useState({
    buy: [],
    sell: []
  });
  const [ohlc, setOhlc] = useState({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
    change: 0,
    changePercent: 0
  });
  const [symbolInfo] = useState({
    name: symbol,
    exchange: 'NSE',
    tickSize: 0.05,
    lotSize: 1
  });
  
  const generateMarketDepthData = () => {
    // Sample data generation for demonstration
    const basePrice = symbol === 'RELIANCE' ? 2112.4 : 
                     symbol === 'INFY' ? 1555.45 : 
                     symbol === 'TCS' ? 3194.8 : 1000;
    
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.005);
    const close = basePrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.003);
    const low = Math.min(open, close) * (1 - Math.random() * 0.003);
    const volume = Math.round(Math.random() * 100000);
    const change = close - open;
    const changePercent = (change / open) * 100;
    
    setOhlc({
      open: open.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      close: close.toFixed(2),
      volume,
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2)
    });
    
    // Generate buy side (bids)
    const buyLevels = [];
    let buyPrice = basePrice * 0.998;
    
    for (let i = 0; i < 5; i++) {
      buyPrice = parseFloat((buyPrice - symbolInfo.tickSize).toFixed(2));
      const quantity = Math.round(Math.random() * 500) + 100;
      const orders = Math.round(Math.random() * 10) + 1;
      
      buyLevels.push({
        price: buyPrice,
        quantity,
        orders
      });
    }
    
    // Generate sell side (asks)
    const sellLevels = [];
    let sellPrice = basePrice * 1.002;
    
    for (let i = 0; i < 5; i++) {
      sellPrice = parseFloat((sellPrice + symbolInfo.tickSize).toFixed(2));
      const quantity = Math.round(Math.random() * 500) + 100;
      const orders = Math.round(Math.random() * 10) + 1;
      
      sellLevels.push({
        price: sellPrice,
        quantity,
        orders
      });
    }
    
    setMarketDepth({
      buy: buyLevels,
      sell: sellLevels
    });
  };
  
  useEffect(() => {
    // Fetch market depth data - in a real app, this would come from a WebSocket
    generateMarketDepthData();
    
    // Set up interval to simulate real-time updates
    const interval = setInterval(() => {
      generateMarketDepthData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate total volumes
  const totalBuyVolume = marketDepth.buy.reduce((sum, level) => sum + level.quantity, 0);
  const totalSellVolume = marketDepth.sell.reduce((sum, level) => sum + level.quantity, 0);
  
  // Find max quantity for visual sizing
  const maxQuantity = Math.max(
    ...marketDepth.buy.map(level => level.quantity),
    ...marketDepth.sell.map(level => level.quantity)
  );

  return (
    <div className="market-depth-container">
      <div className="market-depth-header">
        <h2>{symbol} Market Depth</h2>
        <div className="symbol-info">
          <span>{symbolInfo.exchange}</span>
          <span className={ohlc.change >= 0 ? 'positive' : 'negative'}>
            {ohlc.close} <span>{ohlc.change > 0 ? '+' : ''}{ohlc.change} ({ohlc.changePercent}%)
            </span>
          </span>
        </div>
      </div>
      
      <div className="ohlc-info">
        <div className="ohlc-item">
          <span className="label">Open</span>
          <span className="value">{ohlc.open}</span>
        </div>
        <div className="ohlc-item">
          <span className="label">High</span>
          <span className="value">{ohlc.high}</span>
        </div>
        <div className="ohlc-item">
          <span className="label">Low</span>
          <span className="value">{ohlc.low}</span>
        </div>
        <div className="ohlc-item">
          <span className="label">Vol</span>
          <span className="value">{ohlc.volume.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="depth-table">
        <div className="depth-table-header">
          <div className="buy-header">Bid</div>
          <div className="sell-header">Offer</div>
        </div>
        
        <div className="depth-table-columns">
          <div className="column-headers buy-side">
            <div>Orders</div>
            <div>Qty</div>
            <div>Price</div>
          </div>
          
          <div className="column-headers sell-side">
            <div>Price</div>
            <div>Qty</div>
            <div>Orders</div>
          </div>
        </div>
        
        <div className="depth-table-body">
          <div className="buy-side">
            {marketDepth.buy.map((level, index) => (
              <div className="depth-row" key={`buy-${index}`}>
                <div className="orders">{level.orders}</div>
                <div className="quantity">{level.quantity}</div>
                <div className="price">{level.price}</div>
                <div 
                  className="volume-bar buy" 
                  style={{width: `${(level.quantity / maxQuantity) * 100}%`}}
                ></div>
              </div>
            ))}
            <div className="depth-total">
              <div></div>
              <div>{totalBuyVolume}</div>
              <div>Total</div>
            </div>
          </div>
          
          <div className="sell-side">
            {marketDepth.sell.map((level, index) => (
              <div className="depth-row" key={`sell-${index}`}>
                <div className="price">{level.price}</div>
                <div className="quantity">{level.quantity}</div>
                <div className="orders">{level.orders}</div>
                <div 
                  className="volume-bar sell" 
                  style={{width: `${(level.quantity / maxQuantity) * 100}%`}}
                ></div>
              </div>
            ))}
            <div className="depth-total">
              <div>Total</div>
              <div>{totalSellVolume}</div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDepth; 