import React from 'react';
import { Link } from 'react-router-dom';

const downloadResult = async (orderId) => {
  return 'https://example.com/result-file-url';
};

const DownloadResult = ({ orderId }) => {
  const handleDownloadResult = async () => {
    const resultUrl = await downloadResult(orderId);
    console.log(`Result URL: ${resultUrl}`);
    window.open(resultUrl, '_blank');
  };

  return (
    <div>
      <h2>Download Result</h2>
      <p>Order ID: {orderId}</p>
      <button onClick={handleDownloadResult}>Download Result</button>
    </div>
  );
};

export default DownloadResult;
