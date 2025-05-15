import React, { ReactNode } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { DraggedCard } from './GameBoard';

interface CardSlotProps {
  children?: ReactNode;
  canDrop?: boolean;
  onDrop?: (item: DraggedCard) => void;
}

const CardSlot: React.FC<CardSlotProps> = ({ children, canDrop, onDrop }) => {
  const [{ isOver, canDropHere }, drop] = useDrop<DraggedCard, void, { isOver: boolean; canDropHere: boolean }>({
    accept: 'HAND_CARD',
    canDrop: () => !!canDrop,
    drop: (item: DraggedCard) => {
      if (onDrop) onDrop(item);
    },
    collect: (monitor: DropTargetMonitor<DraggedCard, void>) => ({
      isOver: monitor.isOver(),
      canDropHere: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className="card-slot"
      style={{
        minWidth: 63,
        minHeight: 88,
        width: '100%',
        height: '100%',
        border: isOver && canDropHere ? '2px solid #4a90e2' : '1.5px dashed #bfc8d1',
        background: canDropHere && isOver ? '#e3f2fd' : undefined,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 3,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

export default CardSlot; 