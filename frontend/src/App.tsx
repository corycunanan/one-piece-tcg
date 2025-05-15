import React from 'react';
import './App.css';
import CardInfoPanel from './components/CardInfoPanel';
import GameBoard from './components/GameBoard';

function App() {
  return (
    <div className="app-layout">
      {/* Left Sidebar: Card Info Panel */}
      <aside className="sidebar card-info-panel">
        <CardInfoPanel />
      </aside>
      {/* Main Game Area */}
      <main className="main-board">
        <GameBoard />
      </main>
    </div>
  );
}

export default App;
