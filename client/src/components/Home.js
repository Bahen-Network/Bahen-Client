import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h2>Welcome to the Marketplace</h2>
      <Link to="/create-order">Create Order</Link>
      <br />
      <Link to="/user-orders">My Orders</Link> 
    </div>
  );
};

export default Home;
