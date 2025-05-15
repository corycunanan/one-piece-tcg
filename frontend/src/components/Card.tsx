import React from 'react';
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
  const [{ isDragging }, drag] = useDrag({
    type: draggableType || '',
    item: dragItem,
    canDrag: !!draggableType && !!dragItem,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  if (faceDown) {
    return (
      <div
        className="card"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: '#bfc8d1',
          borderRadius: 6,
          opacity: isDragging ? 0.5 : 1,
        }}
        ref={draggableType ? (drag as unknown as React.Ref<HTMLDivElement>) : undefined}
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
        cursor: onClick ? 'pointer' : draggableType ? 'grab' : 'default',
        boxSizing: 'border-box',
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={onClick}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
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