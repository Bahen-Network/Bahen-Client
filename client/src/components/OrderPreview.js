import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { confirmOrder } from '../services/marketplaceService';

const OrderPreview = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const requiredPower = location.state?.requiredPower || 0;

  const handleConfirmOrder = async (paymentAmount) => {
    console.log(`Order Confirmed start!!: ${orderId}`);
    await confirmOrder(orderId, paymentAmount);
    console.log(`Order Confirmed success!!: ${orderId}`);
  };

  return (
    <div>
      <h2>Order Preview</h2>
      <p>Order ID: {orderId}</p>
      <button onClick={() => handleConfirmOrder(requiredPower)}>Confirm Order ({requiredPower} wei)</button>
    </div>
  );
};

export default OrderPreview;
