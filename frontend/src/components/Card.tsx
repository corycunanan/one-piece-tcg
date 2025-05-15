import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { MockCard } from '../mockCards';
import { DraggedCard } from './GameBoard';

interface CardProps {
  card?: MockCard;
  faceDown?: boolean;
  onClick?: () => void;
  onHoverIn?: (e: React.MouseEvent) => void;
  onHoverOut?: () => void;
  draggableType?: string;
  dragItem?: DraggedCard;
}

const CARD_WIDTH = 75.6;
const CARD_HEIGHT = 105.6;

const Card: React.FC<CardProps> = ({ card, faceDown, onClick, onHoverIn, onHoverOut, draggableType, dragItem }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: draggableType || (card?.type === 'Don!!' ? 'DON_CARD' : ''),
    item: dragItem || (card?.type === 'Don!!' ? { card, handIndex: -1 } : undefined),
    canDrag: !!draggableType && !!dragItem || card?.type === 'Don!!',
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const baseCardStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 6,
    opacity: isDragging ? 0.5 : 1,
    transform: isHovered ? 'translateZ(20px) scale(1.05)' : 'none',
    boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    zIndex: isHovered ? 10 : 1,
    border: isHovered ? '2px solid #4a90e2' : '1px solid #bfc8d1',
    background: isHovered ? '#e3f2fd' : '#fff',
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    onHoverIn?.(e);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverOut?.();
  };

  if (faceDown) {
    return (
      <div
        className="card card-face-down"
        style={{
          ...baseCardStyle,
          background: '#fff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
        ref={draggableType ? (drag as unknown as React.Ref<HTMLDivElement>) : undefined}
      >
        <img
          src={card?.cardBack || '/card-back.jpg'}
          alt="Card Back"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }
  if (!card) return null;
  if (card.image) {
    return (
      <div
        className="card card-with-image"
        style={{
          ...baseCardStyle,
          background: '#fff',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
        onClick={() => { console.log('Clicked root div of Card component'); }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={draggableType ? (drag as unknown as React.Ref<HTMLDivElement>) : undefined}
      >
        <img
          src={card.image}
          alt={card.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
        />
      </div>
    );
  }
  return (
    <div
      className="card card-text"
      style={{
        ...baseCardStyle,
        background: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : draggableType ? 'grab' : 'default',
        boxSizing: 'border-box',
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={draggableType ? (drag as unknown as React.Ref<HTMLDivElement>) : undefined}
    >
      <div style={{ fontWeight: 700, fontSize: 12 }}>{card.name}</div>
      <div style={{ fontSize: 10 }}>{card.type}</div>
      {card.cost !== undefined && <div style={{ fontSize: 10 }}>Cost: {card.cost}</div>}
      {card.power !== undefined && <div style={{ fontSize: 10 }}>Power: {card.power}</div>}
    </div>
  );
};

export default Card; 