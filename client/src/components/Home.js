import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import {configureMoonbaseAlpha} from '../services/marketplaceService';

const Home = () => {
  return (
    <div className="home-container">
      <h2>Welcome to the Marketplace</h2>
      <button className="moonbase-button" onClick={configureMoonbaseAlpha}>Connect to Moonbase Alpha</button>
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
