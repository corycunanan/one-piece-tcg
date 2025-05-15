import React from 'react';
import { MockCard } from '../mockCards';

interface CardProps {
  card?: MockCard;
  faceDown?: boolean;
  onClick?: () => void;
  onHoverIn?: (e: React.MouseEvent) => void;
  onHoverOut?: () => void;
}

const CARD_WIDTH = 63;
const CARD_HEIGHT = 88;

const Card: React.FC<CardProps> = ({ card, faceDown, onClick, onHoverIn, onHoverOut }) => {
  if (faceDown) {
    return (
      <div
        className="card"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: '#bfc8d1',
          borderRadius: 6,
        }}
      />
    );
  }
  if (!card) return null;
  return (
    <div
      className="card"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        background: '#fff',
        border: '1px solid #bfc8d1',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
      }}
      onClick={onClick}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
    >
      <div style={{ fontWeight: 700, fontSize: 12 }}>{card.name}</div>
      <div style={{ fontSize: 10 }}>{card.type}</div>
      {card.cost !== undefined && <div style={{ fontSize: 10 }}>Cost: {card.cost}</div>}
      {card.power !== undefined && <div style={{ fontSize: 10 }}>Power: {card.power}</div>}
    </div>
  );
};

export default Card; 