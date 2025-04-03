import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import GeneralContext from "./GeneralContext";
import axios from "axios";

const Funds = () => {
  const { user } = useContext(GeneralContext);
  const [fundsData, setFundsData] = useState({
    availableFunds: 0,
    usedFunds: 0,
    totalFunds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFundsData = async () => {
      if (user && user.id) {
        try {
          console.log("Fetching funds for user ID:", user.id);
          const response = await axios.get(`http://localhost:5000/user/${user.id}/funds`);
          console.log("Funds data received:", response.data);
          setFundsData(response.data);
        } catch (error) {
          console.error("Error fetching funds:", error);
          if (error.response) {
            console.error("Error response:", error.response.data);
            console.error("Status:", error.response.status);
          }
        } finally {
          setLoading(false);
        }
      } else {
        console.log("No user ID available:", user);
        setLoading(false);
      }
    };

    fetchFundsData();
  }, [user]);

  // Format number with commas
  const formatNumber = (num) => {
    return num ? num.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : "0.00";
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <Link className="btn btn-green">Add funds</Link>
        <Link className="btn btn-blue">Withdraw</Link>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{formatNumber(fundsData.availableFunds)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{formatNumber(fundsData.usedFunds)}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">{formatNumber(fundsData.availableFunds)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{formatNumber(fundsData.totalFunds)}</p>
            </div>
            <div className="data">
              <p>Closing Balance</p>
              <p>{formatNumber(fundsData.availableFunds)}</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
