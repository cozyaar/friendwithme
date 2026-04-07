import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Discover from './pages/Discover';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main style={{ flex: 1, paddingTop: '70px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
