import React from 'react';
import { useParams } from 'react-router-dom';
import { confirmOrder } from '../services/marketplaceService';

const OrderPreview = () => {
  const { orderId } = useParams();

  const handleConfirmOrder = async (paymentAmount) => {
    await confirmOrder(orderId, paymentAmount);
    console.log(`Order Confirmed: ${orderId}`);
  };

  return (
    <div>
      <h2>Order Preview</h2>
      <p>Order ID: {orderId}</p>
      <button onClick={() => handleConfirmOrder(100)}>Confirm Order (100 wei)</button>
    </div>
  );
};

export default OrderPreview;
