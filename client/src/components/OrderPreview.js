import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { confirmOrder, getOrderInfo } from '../services/marketplaceService';
import '../styles/OrderPreview.css'; // Import a CSS file
import { Tabs, Typography, ConfigProvider } from 'antd';
import Section from './Section';

const { Title, Paragraph } = Typography;

function InfoItem({ title, content }) {
  return (
    <div style={{ display: 'flex', marginBottom: 16 }}>
      <div style={{ width: '50%' }}>{title}</div>
      <div style={{ width: '50%' }}>{content}</div>
    </div>
  );
}

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
      await confirmOrder(
        orderId,
        orderDetails.paymentAmount,
        orderDetails.orderLevel
      );
      console.log(`Order Confirmed success!!: ${orderId}`);
      navigate('/');
    } else {
      console.error('Missing required order details.');
    }
  };

  return (
    <div className="order-preview-container">
      <div
        style={{
          width: '652px',
          paddingTop: 36,
          paddingBottom: 36,
          paddingRight: 64,
          borderRight: '2px solid #1F1F1F',
        }}
      >
        <div style={{ marginLeft: 20, marginBottom: 30 }}>
          <Title style={{ marginBottom: 10, color: '#fff' }} level={2}>
            Order Preview
          </Title>
          <Paragraph style={{ color: '#fff' }}>
            Monitor your order here
          </Paragraph>
        </div>
        <Section title="Training Files">
          <InfoItem title="Order ID" content="123" />
          <InfoItem title="TrainTask ID" content="dsfsaf" />
          <InfoItem title="ValidateTask Id" content="123" />
        </Section>
        <Section title="Order Information">
          <ConfigProvider theme={{ token: { colorText: '#fff' } }}>
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Train Task',
                  children: (
                    <div>
                      <InfoItem title="Order ID" content="123" />
                      <InfoItem title="TrainTask ID" content="dsfsaf" />
                      <InfoItem title="ValidateTask Id" content="123" />
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: 'Validate Task',
                  children: (
                    <div>
                      <InfoItem title="Order ID" content="123" />
                    </div>
                  ),
                },
              ]}
              onChange={(value) => {
                console.log('value: ', value);
              }}
            />
          </ConfigProvider>
        </Section>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="order-preview-card">
            {orderDetails && (
              <>
                <p className="order-details">Order ID: {orderId}</p>
                <p className="order-details">
                  TrainTask ID: {orderDetails.trainTaskId}
                </p>
                <p className="order-details">
                  ValidateTask Id: {orderDetails.validateTaskId}
                </p>
                <p className="order-details">
                  Payment Amount: {orderDetails.paymentAmount}
                </p>
                <p className="order-details">
                  Order Level: {orderDetails.orderLevel}
                </p>
                <p className="order-details">
                  Order Status: {orderDetails.orderStatus}
                </p>
                <p className="order-details">
                  Your Client Adress: {orderDetails.client}
                </p>
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
      <div style={{ width: 380, paddingTop: 36, paddingLeft: 64 }}></div>
    </div>
  );
};

export default OrderPreview;
