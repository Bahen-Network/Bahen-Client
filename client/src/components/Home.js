import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h2>Welcome to the Marketplace</h2>
      <div className="buttons-container">
        <Link to="/create-order" className="home-button">
          Create Order
        </Link>
        <Link to="/user-orders" className="home-button">
          My Orders
        </Link>
        <Link to="/worker-list" className="home-button">
          Worker list
        </Link>
      </div>
    </div>
  );
};

export default Home;
