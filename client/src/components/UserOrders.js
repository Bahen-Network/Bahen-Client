import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserOrders, getOrderDetails } from '../services/marketplaceService';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const userAddress = "0x12345..."; 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderIds = await getUserOrders(userAddress);
        const orderDetailsPromises = orderIds.map((orderId) => getOrderDetails(orderId));
        const orders = await Promise.all(orderDetailsPromises);
        setOrders(orders);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      }
    };

    fetchOrders();
  }, [userAddress]);

  return (
    <div>
      <h2>User Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Task ID</th>
            <th>Client</th>
            <th>Payment Amount</th>
            <th>Is Confirmed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td>{index}</td>
              <td>{order.taskId}</td>
              <td>{order.client}</td>
              <td>{order.paymentAmount}</td>
              <td>{order.isConfirmed ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="navigation">
        <Link to="/">
          <button>Back to Home</button>
        </Link>
      </div>
    </div>
  );
};

export default UserOrders;
