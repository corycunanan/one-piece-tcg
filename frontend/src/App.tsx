import React, { useState } from 'react';
import './App.css';
import CardInfoPanel from './components/CardInfoPanel';
import GameBoard from './components/GameBoard';
import { MockCard } from './mockCards';

function App() {
  const [hoveredCard, setHoveredCard] = useState<MockCard | null>(null);

  // Handler to pass to GameBoard for card hover
  const handleCardHover = (card: MockCard | null, e?: React.MouseEvent) => {
    setHoveredCard(card);
  };

  return (
    <div className="app-layout">
      {/* Main Game Area */}
      <main className="main-board">
        <GameBoard setHoveredCard={handleCardHover} />
        {hoveredCard && (
          <div className="card-info-panel-overlay">
            <CardInfoPanel card={hoveredCard} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
