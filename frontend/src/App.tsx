import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import GameBoard from './components/GameBoard';
import DeckBuilderPage from './pages/DeckBuilderPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: 'white'
        }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>
            Game
          </Link>
          <Link to="/deck-builder" style={{ color: 'white', textDecoration: 'none' }}>
            Deck Builder
          </Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<GameBoard setHoveredCard={() => {}} />} />
          <Route path="/deck-builder" element={<DeckBuilderPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
