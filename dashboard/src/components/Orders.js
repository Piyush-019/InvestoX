import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import "./Orders.css"; // We'll create this file for styling

const Orders = () => {
  const { user } = useContext(GeneralContext);
  const [orders, setOrders] = useState({ open: [], executed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('open');

  const fetchOrders = async () => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/user/${user.id}/orders`);
      setOrders(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchOrders();
      
      // Set up interval to refresh data every 5 seconds
      const intervalId = setInterval(fetchOrders, 5000);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>Please log in to view your orders</p>
          <Link to="/login" className="btn">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading && orders.open.length === 0 && orders.executed.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderOrdersTable = (ordersList) => {
    if (ordersList.length === 0) {
      return (
        <div className="no-orders-in-tab">
          <p>No {activeTab} orders found</p>
        </div>
      );
    }

    return (
      <table className="orders-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Type</th>
            {activeTab === 'executed' && <th>Executed At</th>}
          </tr>
        </thead>
        <tbody>
          {ordersList.map((order, index) => (
            <tr key={index} className={order.mode === "BUY" ? "buy-order" : "sell-order"}>
              <td>{order.name}</td>
              <td>{order.qty}</td>
              <td>₹{order.price}</td>
              <td>{order.mode}</td>
              {activeTab === 'executed' && (
                <td>{new Date(order.executedAt).toLocaleString()}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const hasOrders = orders.open.length > 0 || orders.executed.length > 0;

  return (
    <div className="orders-container">
      <h2>Your Orders</h2>
      
      {hasOrders ? (
        <div className="orders-content">
          <div className="orders-tabs">
            <button 
              className={`tab-button ${activeTab === 'open' ? 'active' : ''}`}
              onClick={() => setActiveTab('open')}
            >
              Open Orders
              {orders.open.length > 0 && <span className="order-count">{orders.open.length}</span>}
            </button>
            <button 
              className={`tab-button ${activeTab === 'executed' ? 'active' : ''}`}
              onClick={() => setActiveTab('executed')}
            >
              Executed Orders
              {orders.executed.length > 0 && <span className="order-count">{orders.executed.length}</span>}
            </button>
          </div>
          
          <div className="orders-list">
            {activeTab === 'open' && renderOrdersTable(orders.open)}
            {activeTab === 'executed' && renderOrdersTable(orders.executed)}
          </div>
        </div>
      ) : (
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
