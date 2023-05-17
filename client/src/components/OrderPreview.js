import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { confirmOrder, getOrderInfo } from '../services/marketplaceService';

const OrderPreview = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const requiredPower = location.state?.requiredPower || 0;

  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    
    const fetchOrderDetails = async () => {
      const order = await getOrderInfo(orderId);
      setOrderDetails({
        trainTaskId: order.trainTaskId,
        validateTaskId: order.validateTaskId,
        client: order.client,
        paymentAmount: order.paymentAmount,
        orderStatus: order.orderStatus,
      });
    };
    

    fetchOrderDetails();
  }, [orderId]);

  const handleConfirmOrder = async (paymentAmount) => {
    console.log(`Order Confirmed start!!: ${orderId}`);
    await confirmOrder(orderId, paymentAmount);
    console.log(`Order Confirmed success!!: ${orderId}`);
    navigate('/');
  };

  return (
    <div>
      <h2>Order Preview</h2>
      {orderDetails && (
        <>
          <p>Order ID: {orderId}</p>
          <p>TrainTask ID: {orderDetails.trainTaskId}</p>
          <p>ValidateTask Id: {orderDetails.validateTaskId}</p>
          <p>Payment Amount: {orderDetails.paymentAmount}</p>
          <p>orderStatus: {orderDetails.orderStatus}</p>
          <p>Your Client Adress: {orderDetails.client}</p>
        </>
      )}
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
