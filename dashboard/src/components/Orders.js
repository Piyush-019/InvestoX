import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";

const Orders = () => {
  const { user } = useContext(GeneralContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading && orders.length === 0) {
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

  return (
    <div className="orders">
      {orders.length > 0 ? (
        <div className="orders-list">
          <h3>Your Orders</h3>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className={order.mode === "BUY" ? "buy-order" : "sell-order"}>
                  <td>{order.name}</td>
                  <td>{order.qty}</td>
                  <td>₹{order.price}</td>
                  <td>{order.mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      )}
    </div>
  );
};

export default Orders;
