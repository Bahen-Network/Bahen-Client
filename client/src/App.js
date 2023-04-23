import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateOrder from './components/CreateOrder';
import OrderPreview from './components/OrderPreview';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CreateOrder />} />
          <Route path="/order-preview/:orderId" element={<OrderPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
