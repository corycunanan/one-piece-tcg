import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CardSlot from './CardSlot';
import Card from './Card';
import DONCard from './DONCard';
import { mockCards, MockCard } from '../mockCards';
import { Deck } from '../game/Deck';

const luffyLeader = mockCards.find(card => card.name === 'Monkey D. Luffy')!;
const zoroCard = mockCards.find(card => card.name === 'Roronoa Zoro')!;
const donCard = mockCards.find(card => card.name === 'Don!!')!;

interface GameBoardProps {
  setHoveredCard: (card: MockCard | null, e?: React.MouseEvent) => void;
}

export interface DraggedCard {
  card: MockCard;
  handIndex: number;
}

const NUM_DON = 10;

const GameBoard: React.FC<GameBoardProps> = ({ setHoveredCard }) => {
  // Initialize decks and hands ONCE
  const [playerDeck] = useState(() => new Deck(
    luffyLeader,
    Array(40).fill(zoroCard),
    Array(10).fill(donCard)
  ));
  const [opponentDeck] = useState(() => new Deck(
    luffyLeader,
    Array(40).fill(zoroCard),
    Array(10).fill(donCard)
  ));
  const [playerHand, setPlayerHand] = useState<MockCard[]>(() => playerDeck.draw(5));
  const [opponentHand] = useState<MockCard[]>(() => opponentDeck.draw(5));
  const [playerBoard, setPlayerBoard] = useState<(MockCard | null)[]>([null, null, null, null, null]);
  const [opponentBoard] = useState<(MockCard | null)[]>([null, null, null, null, null]);
  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null);
  // DON state: true = active, false = rested
  const [playerDON, setPlayerDON] = useState<boolean[]>(Array(NUM_DON).fill(true));

  const handleCardHoverIn = (card: MockCard) => (e: React.MouseEvent) => {
    setHoveredCard(card, e);
  };
  const handleCardHoverOut = () => {
    setHoveredCard(null);
  };

  // Handle dropping a card from hand to a character slot
  const handleDropToSlot = (slotIdx: number, dragged: DraggedCard) => {
    if (playerBoard[slotIdx] || dragged.card.type !== 'Character') return;
    // Remove from hand
    const newHand = [...playerHand];
    newHand.splice(dragged.handIndex, 1);
    setPlayerHand(newHand);
    // Place in board
    const newBoard = [...playerBoard];
    newBoard[slotIdx] = dragged.card;
    setPlayerBoard(newBoard);
    // Rest DON equal to card cost
    if (typeof dragged.card.cost === 'number' && dragged.card.cost > 0) {
      let donToRest = dragged.card.cost;
      const newDON = [...playerDON];
      for (let i = 0; i < newDON.length && donToRest > 0; i++) {
        if (newDON[i]) {
          newDON[i] = false;
          donToRest--;
        }
      }
      setPlayerDON(newDON);
    }
  };

  // Helper to show deck back and count
  const renderDeckZone = (deck: Deck) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {deck.mainDeck.length > 0 ? (
        <Card faceDown />
      ) : null}
      <div style={{ fontSize: 12, marginTop: 4 }}>{deck.mainDeck.length} cards</div>
    </div>
  );

  // Render DON area
  const renderDONArea = (don: boolean[]) => {
    const overlap = 24;
    const cardWidth = 63 * 1.2;
    const cardHeight = 88 * 1.2;
    const totalWidth = cardWidth + overlap * (don.length - 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div style={{ position: 'relative', height: cardHeight, width: totalWidth }}>
          {don.map((active, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: idx * overlap,
                zIndex: idx,
                pointerEvents: 'none',
              }}
            >
              <DONCard active={active} scale={1.2} />
            </div>
          ))}
          {/* Spacer to force container height */}
          <div style={{ width: 1, height: cardHeight, pointerEvents: 'none', opacity: 0 }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#222b3a', marginTop: 0 }}>
          {don.filter(Boolean).length} DON
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
              <CardSlot
                key={idx}
                canDrop={playerBoard[idx] === null}
                onDrop={dragged => handleDropToSlot(idx, dragged)}
              >
                {card && <Card card={card} onHoverIn={handleCardHoverIn(card)} onHoverOut={handleCardHoverOut} />}
              </CardSlot>
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
        {/* Deck zones */}
        <div className="zone opponent-deck">{renderDeckZone(opponentDeck)}</div>
        <div className="zone player-deck">{renderDeckZone(playerDeck)}</div>
        {/* DON areas */}
        <div className="zone player-don">{renderDONArea(playerDON)}</div>
        {/* Other zones remain as before */}
        <div className="zone opponent-trash">Trash area</div>
        <div className="zone opponent-don">DON area</div>
        <div className="zone opponent-life">Life area</div>
        <div className="zone player-life">Life area</div>
        <div className="zone player-trash">Trash area</div>
      </div>

      {/* Player hand (face up, below board) */}
      <div className="hands-row bottom">
        {playerHand.map((card, idx) => (
          <div key={card.id} style={{ margin: '0 6px', border: selectedHandIdx === idx ? '2px solid #4a90e2' : 'none', borderRadius: 6 }}>
            <Card
              card={card}
              onClick={() => setSelectedHandIdx(idx)}
              onHoverIn={handleCardHoverIn(card)}
              onHoverOut={handleCardHoverOut}
              draggableType="HAND_CARD"
              dragItem={{ card, handIndex: idx }}
            />
          </div>
        ))}
      </div>
    </DndProvider>
  );
};

export default GameBoard; 