import React, { useState } from 'react';
import CardSlot from './CardSlot';
import Card from './Card';
import { mockCards, MockCard } from '../mockCards';

const luffyLeader = mockCards.find(card => card.name === 'Monkey D. Luffy');

interface GameBoardProps {
  setHoveredCard: (card: MockCard | null) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ setHoveredCard }) => {
  // Mock state for board and hands
  const [playerHand] = useState<MockCard[]>(mockCards.slice(0, 5));
  const [opponentHand] = useState<MockCard[]>(Array(5).fill({ ...mockCards[4], id: 'back' }));
  const [playerBoard] = useState<(MockCard | null)[]>([mockCards[1], null, null, null, null]);
  const [opponentBoard] = useState<(MockCard | null)[]>([null, mockCards[1], null, null, null]);
  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null);

  const handleCardHoverIn = (card: MockCard) => () => {
    setHoveredCard(card);
  };
  const handleCardHoverOut = () => {
    setHoveredCard(null);
  };

  return (
    <>
      {/* Opponent hand (face down, above board) */}
      <div className="hands-row top">
        {opponentHand.map((_, idx) => (
          <div key={idx} style={{ margin: '0 6px' }}>
            <Card faceDown />
          </div>
        ))}
      </div>

      {/* Main board */}
      <div className="game-board-abstracted">
        {/* Opponent character area */}
        <div className="zone opponent-character">
          <div className="character-area-grid">
            {opponentBoard.map((card, idx) => (
              <CardSlot key={idx}>{card && <Card card={card} onHoverIn={handleCardHoverIn(card)} onHoverOut={handleCardHoverOut} />}</CardSlot>
            ))}
          </div>
        </div>
        {/* Player character area */}
        <div className="zone player-character">
          <div className="character-area-grid">
            {playerBoard.map((card, idx) => (
              <CardSlot key={idx}>{card && <Card card={card} onHoverIn={handleCardHoverIn(card)} onHoverOut={handleCardHoverOut} />}</CardSlot>
            ))}
          </div>
        </div>
        {/* Leader and Event areas as squares */}
        <div className="zone opponent-leader">
          <div className="leader-area-grid">
            <CardSlot>{luffyLeader && <Card card={luffyLeader} onHoverIn={handleCardHoverIn(luffyLeader)} onHoverOut={handleCardHoverOut} />}</CardSlot>
          </div>
        </div>
        <div className="zone player-leader">
          <div className="leader-area-grid">
            <CardSlot>{luffyLeader && <Card card={luffyLeader} onHoverIn={handleCardHoverIn(luffyLeader)} onHoverOut={handleCardHoverOut} />}</CardSlot>
          </div>
        </div>
        <div className="zone opponent-event">
          <div className="event-area-grid">
            <CardSlot />
          </div>
        </div>
        <div className="zone player-event">
          <div className="event-area-grid">
            <CardSlot />
          </div>
        </div>
        {/* Other zones remain as before */}
        <div className="zone opponent-trash">Trash area</div>
        <div className="zone opponent-deck">Deck area</div>
        <div className="zone opponent-don">DON area</div>
        <div className="zone opponent-life">Life area</div>
        <div className="zone player-life">Life area</div>
        <div className="zone player-don">DON area</div>
        <div className="zone player-deck">Deck area</div>
        <div className="zone player-trash">Trash area</div>
      </div>

      {/* Player hand (face up, below board) */}
      <div className="hands-row bottom">
        {playerHand.map((card, idx) => (
          <div key={card.id} style={{ margin: '0 6px', border: selectedHandIdx === idx ? '2px solid #4a90e2' : 'none', borderRadius: 6 }}>
            <Card card={card} onClick={() => setSelectedHandIdx(idx)} onHoverIn={handleCardHoverIn(card)} onHoverOut={handleCardHoverOut} />
          </div>
        ))}
      </div>
    </>
  );
};

export default GameBoard; 