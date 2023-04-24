import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { confirmOrder } from '../services/marketplaceService';

const OrderPreview = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const requiredPower = location.state?.requiredPower || 0;

  const handleConfirmOrder = async (paymentAmount) => {
    console.log(`Order Confirmed start!!: ${orderId}`);
    await confirmOrder(orderId, paymentAmount);
    console.log(`Order Confirmed success!!: ${orderId}`);
    navigate('/');
  };

  return (
    <div>
      <h2>Order Preview</h2>
      <p>Order ID: {orderId}</p>
      <button onClick={() => handleConfirmOrder(requiredPower)}>Confirm Order ({requiredPower} wei)</button>
      <div className="navigation">
        <Link to="/">
          <button>Back to Home</button>
        </Link>
      </div>
    </div>
  );
};

export default OrderPreview;
