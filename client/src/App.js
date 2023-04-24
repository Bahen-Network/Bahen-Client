import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateOrder from './components/CreateOrder';
import OrderPreview from './components/OrderPreview';
import Home from './components/Home';
import UserOrders from './components/UserOrders';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/order-preview/:orderId" element={<OrderPreview />} />
          <Route path="/user-orders" element={<UserOrders />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
