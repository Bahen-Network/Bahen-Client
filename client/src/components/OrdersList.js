import React, { useState, useEffect } from 'react';
import { getOrderList } from '../services/marketplaceService';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const fetchedOrders = await getOrderList();
      setOrders(fetchedOrders);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Orders List</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>Order ID: {order.id}</li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;
