import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateOrder from './components/CreateOrder';
import OrderPreview from './components/OrderPreview';
import Home from './components/Home';
import UserOrders from './components/UserOrders';
import { uploadToAzure } from './azureUpload';

function App() {

  const handleUpload = async (files, orderID) => {
    try {
      const path = await uploadToAzure(files, orderID);
      alert('Files uploaded successfully');
      return path;
    } catch (error) {
      console.error(error);
      alert('Failed to upload files');
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-order" element={<CreateOrder onUpload={handleUpload}/>} />
          <Route path="/order-preview/:orderId" element={<OrderPreview />} />
          <Route path="/user-orders" element={<UserOrders />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
