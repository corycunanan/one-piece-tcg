import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import DONCard from './DONCard';
import { MockCard } from '../mockCards';

interface DraggableDONCardProps {
  active: boolean;
  index: number;
  donCard: MockCard;
}

const DraggableDONCard: React.FC<DraggableDONCardProps> = ({ active, index, donCard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'DON_CARD',
    item: { card: donCard, handIndex: index },
    canDrag: active,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: active ? 'grab' : 'default',
        width: 'fit-content',
        height: 'fit-content',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <DONCard active={active} scale={1.2} isHovered={isHovered} />
    </div>
  );
};

export default DraggableDONCard; 