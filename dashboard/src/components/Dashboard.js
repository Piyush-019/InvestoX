import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import ChartComponent from "./ChartComponent";
import MarketDepth from "./MarketDepth";
import MarginCalculator from "./MarginCalculator";
import Signup from "./Signup";
import Login from "./Login";
import GeneralContext from "./GeneralContext";
import "./ChartComponent.css";
import "./MarketDepth.css";

const Dashboard = () => {
  const { 
    showChart, 
    closeStockChart, 
    activeSymbol, 
    showMarketDepth, 
    closeMarketDepth,
    showMarginCalculator,
    toggleMarginCalculator
  } = useContext(GeneralContext);

  return (
    <div className="dashboard-container">
      <WatchList />
      <div className="content">
        {showChart && (
          <div className="chart-overlay">
            <div className="chart-overlay-header">
              <h3>Advanced Charts</h3>
              <button className="close-btn" onClick={closeStockChart}>×</button>
            </div>
            <ChartComponent symbol={activeSymbol} />
          </div>
        )}
        
        {showMarketDepth && (
          <div className="depth-overlay">
            <div className="depth-overlay-header">
              <h3>Market Depth</h3>
              <button className="close-btn" onClick={closeMarketDepth}>×</button>
            </div>
            <MarketDepth symbol={activeSymbol} />
          </div>
        )}
        
        {showMarginCalculator && (
          <div className="calculator-overlay">
            <div className="calculator-overlay-header">
              <h3>Margin Calculator</h3>
              <button className="close-btn" onClick={toggleMarginCalculator}>×</button>
            </div>
            <MarginCalculator />
          </div>
        )}
        
        <Routes>
          <Route exact path="/" element={<Summary />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/calculator" element={<MarginCalculator />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
