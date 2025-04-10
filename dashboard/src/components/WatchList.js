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
  
  // Handle refreshing of watchlist data
  useEffect(() => {
    // Initial fetch of watchlist data
    fetchWatchlistData();
    
    // Setup listener for stock price updates
    const handleStockPriceUpdate = () => {
      fetchWatchlistData();
    };
    
    // Add event listener for stock price updates
    window.addEventListener('stockPriceUpdated', handleStockPriceUpdate);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('stockPriceUpdated', handleStockPriceUpdate);
    };
  }, []);
  
  // Function to fetch current watchlist data
  const fetchWatchlistData = async () => {
    try {
      // Try to fetch from backend first
      const response = await axios.get('http://localhost:5000/stock/watchlist');
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setWatchlist(response.data);
      } else {
        // Fallback to static data
        setWatchlist(staticWatchlist);
      }
    } catch (error) {
      console.log('Failed to fetch watchlist data, using static data');
      setWatchlist(staticWatchlist);
    }
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
        {/* <span className="counts"> {watchlist.length} / 50</span> */}
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => {
          return <WatchListItem stock={stock} key={index} />;
        })}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price.toFixed(2)}</span>
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
