import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import WatchList from "./WatchList";
import MarginCalculator from "./MarginCalculator";
import Signup from "./Signup";
import Login from "./Login";
import GeneralContext from "./GeneralContext";

const Dashboard = () => {
  const { 
    showMarginCalculator,
    toggleMarginCalculator
  } = useContext(GeneralContext);

  return (
    <div className="dashboard-container">
      <WatchList />
      <div className="content">
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
