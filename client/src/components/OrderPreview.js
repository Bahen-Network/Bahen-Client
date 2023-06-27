import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { confirmOrder, getOrderInfo } from '../services/marketplaceService';
import '../styles/OrderPreview.css'; // Import a CSS file
import {Button, Tabs, Typography, ConfigProvider } from 'antd';
import Section from './Section';
const { TabPane } = Tabs;
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
      console.log(`---------------------fdsafdsagsdagdfs-----${orderId}`)
      setOrderDetails(order);
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleConfirmOrder = async () => {
    if (orderDetails?.paymentAmount && orderDetails?.orderLevel) {
      console.log(`Order Confirmed start!!: ${orderId}`);
      await confirmOrder(
        orderId,
        requiredPower * 10000, // Temporary value for requiredComputingPower, change according to your needs
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
          width: '852px',
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
        {orderDetails ? (
          <>
            <Section title="Training Files">
              <InfoItem title="Order ID" content={orderId} />
              <InfoItem title="TrainTask ID" content={orderDetails.trainTaskId} />
              <InfoItem title="ValidateTask Id" content={orderDetails.validateTaskId} />
            </Section>
            <Section title="Order Information">
              <ConfigProvider theme={{ token: { colorText: '#fff' } }}>
                <Tabs
                  defaultActiveKey="1"
                  onChange={(value) => {
                    console.log('value: ', value);
                  }}
                >
                  <TabPane key="1" tab="Train Task">
                    <div>
                      <InfoItem title="Order ID" content={orderId} />
                      <InfoItem title="TrainTask ID" content={orderDetails.trainTaskId} />
                      <InfoItem title="Payment Amount" content={requiredPower * 10000} />
                      <InfoItem title="Order Level" content={orderDetails.orderLevel} />
                      <InfoItem title="Order Status" content={orderDetails.orderStatus} />
                      <InfoItem title="Your Client Adress" content={orderDetails.client} />
                    </div>
                  </TabPane>
                  <TabPane key="2" tab="Validate Task">
                    <div>
                      <InfoItem title="Order ID" content={orderId} />
                    </div>
                  </TabPane>
                </Tabs>
              </ConfigProvider>
            </Section>
            <Section title="Order Confirmation">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}
                >
                  <div>
                    <Button type="primary" onClick={handleConfirmOrder}>Confirm Order ({requiredPower*10000} wei)
                    </Button>
                  </div>
                  <div className="navigation">
                      <Link
                        to="/"
                        className="home-link"
                        disabled={loading}
                      >
                        Back to Home
                      </Link>
                    </div>
                </div>
              </Section>
          </>
        ) : (
          <div>Loading order details...</div>
        )}
      </div>
      <div style={{ width: 380, paddingTop: 36, paddingLeft: 64 }}></div>
    </div>
  );
};

export default OrderPreview;
