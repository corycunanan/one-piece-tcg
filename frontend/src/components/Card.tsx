import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { MockCard } from '../mockCards';
import { DraggedCard } from './GameBoard';
import { 
  animateCardHover, 
  animateCardUnhover, 
  animateDragStart, 
  animateDragEnd,
  animateCardHoverDynamic
} from '../utils/cardAnimations';

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
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging: dragState }, drag] = useDrag({
    type: draggableType || (card?.type === 'Don!!' ? 'DON_CARD' : ''),
    item: dragItem || (card?.type === 'Don!!' ? { card, handIndex: -1 } : undefined),
    canDrag: !!draggableType && !!dragItem || card?.type === 'Don!!',
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Handle drag state changes
  useEffect(() => {
    if (dragState && !isDragging && cardRef.current) {
      setIsDragging(true);
      animateDragStart(cardRef.current);
    } else if (!dragState && isDragging && cardRef.current) {
      setIsDragging(false);
      animateDragEnd(cardRef.current);
    }
  }, [dragState, isDragging]);

  const baseCardStyle = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 6,
    opacity: dragState ? 0.8 : 1,
    position: 'relative' as const,
    zIndex: isHovered || isDragging ? 10 : 1,
    border: isHovered ? '2px solid #4a90e2' : '1px solid #bfc8d1',
    background: isHovered ? '#e3f2fd' : '#fff',
    transformStyle: 'preserve-3d' as const,
    backfaceVisibility: 'hidden' as const,
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (!isDragging) {
      setIsHovered(true);
      onHoverIn?.(e as any);
      if (cardRef.current) {
        animateCardHoverDynamic(cardRef.current, e.clientX, e.clientY);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging && isHovered && cardRef.current) {
      animateCardHoverDynamic(cardRef.current, e.clientX, e.clientY);
    }
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setIsHovered(false);
      onHoverOut?.();
      if (cardRef.current) {
        animateCardUnhover(cardRef.current);
      }
    }
  };

  // Combine refs for drag and animation
  const setRefs = (element: HTMLDivElement) => {
    drag(element);
    cardRef.current = element;
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
        ref={draggableType ? setRefs : undefined}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <img
          src={card?.cardBack || '/card-back.jpg'}
          alt="Card Back"
          style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
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
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        ref={draggableType ? setRefs : undefined}
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
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      ref={draggableType ? setRefs : undefined}
    >
      <div style={{ fontWeight: 700, fontSize: 12, pointerEvents: 'none' }}>{card.name}</div>
      <div style={{ fontSize: 10, pointerEvents: 'none' }}>{card.type}</div>
      {card.cost !== undefined && <div style={{ fontSize: 10, pointerEvents: 'none' }}>Cost: {card.cost}</div>}
      {card.power !== undefined && <div style={{ fontSize: 10, pointerEvents: 'none' }}>Power: {card.power}</div>}
    </div>
  );
};

export default Card; 