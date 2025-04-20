import React, { useState, useContext, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import axios from "axios";

import { Tooltip, Grow, Menu, MenuItem } from "@mui/material";

import {
  ShowChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
  TrendingUpOutlined,
  LayersOutlined,
  CalculateOutlined
} from "@mui/icons-material";

import { watchlist as staticWatchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

const WatchList = () => {
  const [watchlist, setWatchlist] = useState(staticWatchlist);
  const [previousPrices, setPreviousPrices] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Handle refreshing of watchlist data
  useEffect(() => {
    // Initial fetch of watchlist data
    fetchWatchlistData();
    
    // Setup listener for stock price updates
    const handleStockPriceUpdate = (event) => {
      console.log('Stock price update detected, refreshing watchlist...');
      
      // Check if event has detail data for immediate update
      if (event.detail) {
        const { symbol, name, price, dayChange } = event.detail;
        console.log(`Immediate update for ${symbol}: ${price} (${dayChange})`);
        
        // Update specific stock immediately instead of full refresh
        setWatchlist(currentWatchlist => {
          return currentWatchlist.map(stock => {
            if (stock.name === symbol || stock.name === name) {
              // Save the previous price before updating
              setPreviousPrices(prev => ({
                ...prev,
                [stock.name]: stock.price
              }));
              
              // Return updated stock
              return {
                ...stock,
                price: price,
                percent: dayChange,
                isDown: dayChange && dayChange.startsWith('-')
              };
            }
            return stock;
          });
        });
      } else {
        // Full refresh if no detail provided
        fetchWatchlistData();
      }
      
      setLastUpdated(new Date());
    };
    
    // Add event listener for stock price updates
    window.addEventListener('stockPriceUpdated', handleStockPriceUpdate);
    
    // Setup automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchWatchlistData();
      setLastUpdated(new Date());
    }, 30000);
    
    // Cleanup listener and interval on unmount
    return () => {
      window.removeEventListener('stockPriceUpdated', handleStockPriceUpdate);
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Function to fetch current watchlist data
  const fetchWatchlistData = async () => {
    try {
      // Try to fetch from real-time endpoint first
      const response = await axios.get('http://localhost:5000/api/watchlist/realtime');
      if (response.data && response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        // Update previous prices before setting new watchlist
        const newPreviousPrices = { ...previousPrices };
        response.data.data.forEach(stock => {
          if (!newPreviousPrices[stock.name]) {
            newPreviousPrices[stock.name] = stock.price;
          }
        });
        setPreviousPrices(newPreviousPrices);
        setWatchlist(response.data.data);
        return;
      }
      
      // Fallback to regular watchlist endpoint
      const fallbackResponse = await axios.get('http://localhost:5000/stock/watchlist');
      if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
        // Update previous prices before setting new watchlist
        const newPreviousPrices = { ...previousPrices };
        fallbackResponse.data.forEach(stock => {
          if (!newPreviousPrices[stock.name]) {
            newPreviousPrices[stock.name] = stock.price;
          }
        });
        setPreviousPrices(newPreviousPrices);
        setWatchlist(fallbackResponse.data);
      } else {
        // Fallback to static data if both endpoints fail
        setWatchlist(staticWatchlist);
      }
    } catch (error) {
      console.log('Failed to fetch watchlist data, using static data:', error);
      
      try {
        // Try the normal endpoint as a fallback
        const fallbackResponse = await axios.get('http://localhost:5000/stock/watchlist');
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
          setPreviousPrices(prevPrices => {
            const newPrices = { ...prevPrices };
            fallbackResponse.data.forEach(stock => {
              if (!newPrices[stock.name]) {
                newPrices[stock.name] = stock.price;
              }
            });
            return newPrices;
          });
          setWatchlist(fallbackResponse.data);
          return;
        }
      } catch (fallbackError) {
        console.log('All endpoints failed, using static data');
      }
      
      setWatchlist(staticWatchlist);
    }
  };
  
  // Function to manually refresh watchlist data
  const handleRefresh = () => {
    fetchWatchlistData();
    setLastUpdated(new Date());
  };
  
  // Prepare data for chart
  const labels = watchlist.map((stock) => stock.name);
  
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          // placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="update-info" onClick={handleRefresh} title="Click to refresh">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => {
          return (
            <WatchListItem 
              stock={stock} 
              key={index}
              previousPrice={previousPrices[stock.name] || stock.price}
            />
          );
        })}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, previousPrice }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  // When stock price changes, trigger the highlight animation
  useEffect(() => {
    // Only highlight when it's not the initial render
    if (previousPrice && stock.price !== previousPrice) {
      setIsUpdated(true);
      // Remove the highlight class after animation completes
      const timer = setTimeout(() => {
        setIsUpdated(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [stock.price, previousPrice]);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  // Calculate price change using previous price
  const priceChange = stock.price - previousPrice;
  const priceChangeFormatted = priceChange.toFixed(2);

  return (
    <li 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className={isUpdated ? 'stock-updated' : ''}
    >
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className={`percent ${stock.isDown ? "down" : "up"}`}>
            {stock.percent}
          </span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className={`price ${stock.isDown ? "down" : "up"}`}>
            {stock.price.toFixed(2)}
            <span className="price-change">
              ({priceChangeFormatted >= 0 ? '+' : ''}{priceChangeFormatted})
            </span>
          </span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };
  
  const handleAdvancedBuyClick = () => {
    generalContext.openAdvancedOrderWindow(uid, 'buy');
    handleMenuClose();
  };
  
  const handleAdvancedSellClick = () => {
    generalContext.openAdvancedOrderWindow(uid, 'sell');
    handleMenuClose();
  };
  
  const handleMarginCalcClick = () => {
    generalContext.toggleMarginCalculator();
    handleMenuClose();
  };
  
  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleSellClick}
        >
          <button className="sell">Sell</button>
        </Tooltip>
      </span>
    </span>
  );
};