import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserOrders, getOrderInfo, getUserAddress } from '../services/marketplaceService';
import styles from '../styles/UserOrders.module.css'; 

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAddress = async () => {
      const address = await getUserAddress();
      setUserAddress(address);
    };
    fetchUserAddress();
  }, []);

  useEffect(() => {
    if (userAddress) {
      const fetchOrders = async () => {
        try {
          const orderIds = await getUserOrders(userAddress);
          const orderDetailsPromises = orderIds.map((orderId) => getOrderInfo(orderId));
          const orders = await Promise.all(orderDetailsPromises);
          setOrders(orders);
        } catch (error) {
          console.error("Error fetching user orders:", error);
        }
      };
      fetchOrders();
    }
  }, [userAddress]);

  return (
    <div className={styles.container}>
      <h2>User Orders</h2>
      <table className={styles.table}>
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
      <div className={styles.navigation}>
        <Link to="/">
          <button>Back to Home</button>
    </Link>
  </div>
</div>
);
};

export default UserOrders;
