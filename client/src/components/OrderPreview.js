import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { confirmOrder, getOrderInfo } from '../services/marketplaceService';
import '../styles/OrderPreview.css'; // Import a CSS file

const OrderPreview = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const requiredPower = location.state?.requiredPower || 0;

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      const order = await getOrderInfo(orderId);
      setOrderDetails(order);
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleConfirmOrder = async () => {
    // Ensure `paymentAmount` and `orderLevel` are defined
    if (orderDetails.paymentAmount && orderDetails.orderLevel) {
      console.log(`Order Confirmed start!!: ${orderId}`);
      await confirmOrder(orderId, orderDetails.paymentAmount, orderDetails.orderLevel);
      console.log(`Order Confirmed success!!: ${orderId}`);
      navigate('/');
    } else {
      console.error('Missing required order details.');
    }
};

  return (
    <div className="order-preview-container">
      <h2 className="order-preview-title">Order Preview</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="order-preview-card">
          {orderDetails && (
            <>
              <p className="order-details">Order ID: {orderId}</p>
              <p className="order-details">TrainTask ID: {orderDetails.trainTaskId}</p>
              <p className="order-details">ValidateTask Id: {orderDetails.validateTaskId}</p>
              <p className="order-details">Payment Amount: {orderDetails.paymentAmount}</p>
              <p className="order-details">Order Level: {orderDetails.orderLevel}</p>
              <p className="order-details">Order Status: {orderDetails.orderStatus}</p>
              <p className="order-details">Your Client Adress: {orderDetails.client}</p>
            </>
          )}
          <button className="confirm-button" onClick={handleConfirmOrder}>
            Confirm Order ({requiredPower} wei)
          </button>
          <div className="navigation">
            <Link to="/" className="home-link">
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPreview;
