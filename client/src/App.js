import React from 'react';
import './App.css';
import CreateOrder from './components/CreateOrder';

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>Translation Marketplace</h1>
      </header>
      <main>
        <CreateOrder />
      </main>
    </div>
  );
}

export default App;
  