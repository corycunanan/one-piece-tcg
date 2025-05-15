import React, { useState } from 'react';
import './App.css';
import CardInfoPanel from './components/CardInfoPanel';
import GameBoard from './components/GameBoard';
import { MockCard } from './mockCards';

function App() {
  const [hoveredCard, setHoveredCard] = useState<MockCard | null>(null);

  return (
    <div className="app-layout">
      {/* Left Sidebar: Card Info Panel */}
      <aside className="sidebar card-info-panel">
        <CardInfoPanel card={hoveredCard} />
      </aside>
      {/* Main Game Area */}
      <main className="main-board">
        <GameBoard setHoveredCard={setHoveredCard} />
      </main>
    </div>
  );
}

export default App;
