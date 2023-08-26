import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Table, Button } from 'antd';
import {
  getUserOrders,
  getOrderInfo,
  getUserAddress,
} from '../services/marketplaceService';
import styles from '../styles/UserOrders.module.css';
import { downloadFromGreenField } from '../services/filesUploadAndDownload';

const { Title, Paragraph } = Typography;
const handleDownload = async (bucketName, progress, setProgress) => {
  try {
      await downloadFromGreenField(bucketName, progress, setProgress);
  } catch (error) {
      console.error('Download failed:', error);
  }
}
const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [userAddress, setUserAddress] = useState('');
  const [progress, setProgress] = useState({});
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
          const orderDetailsPromises = orderIds.map((orderId) =>
            getOrderInfo(orderId)
          );
          const orders = await Promise.all(orderDetailsPromises);
          setOrders(orders);
        } catch (error) {
          console.error('Error fetching user orders:', error);
        }
      };
      fetchOrders();
    }
  }, [userAddress]);

  return (
    <div className={styles.container}>
      <div style={{ marginLeft: 20, marginBottom: 30 }}>
        <Title style={{ marginBottom: 10, color: '#fff' }} level={2}>
          Orders
        </Title>
        <Paragraph style={{ color: '#fff' }}>
          You can view all your train orders here
        </Paragraph>
      </div>

      {/* TODO mock records */}
      <Table
        dataSource={orders}
        columns={[
          {
            title: 'Order ID',
            dataIndex: 'orderId',
          },
          {
            title: 'Train Task ID',
            dataIndex: 'trainTaskId',
          },
          {
            title: 'Client',
            dataIndex: 'client',
          },
          {
            title: 'Payment Amount',
            dataIndex: 'paymentAmount',
          },
          {
            title: 'Order Status',
            dataIndex: 'orderStatus',
          },
          {
            title: 'Order Level',
            dataIndex: 'orderLevel',
          },
          {
            title: 'Operation',
            render: (text, record, index) => {
              const pg = (record.folderUrl !== '' && record.folderUrl !== null && record.folderUrl !== undefined
                && progress.hasOwnProperty(record.folderUrl)) ? progress[record.folderUrl] : 0;
              return (
                  <div>
                    <Button onClick={() => handleDownload(record.folderUrl, progress, setProgress)}> Download Model</Button>
                     <div className="progress-bar">
                       <div className="progress" style={{ width: `${pg}%` }}>{pg}%</div>
                     </div>
                  </div>
              )
            },
          },
        ]}
      />
    </div>
  );
};

export default UserOrders;
