import React, { ReactNode } from 'react';

interface CardSlotProps {
  children?: ReactNode;
}

const CardSlot: React.FC<CardSlotProps> = ({ children }) => {
  return (
    <div className="card-slot" style={{ minWidth: 60, minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: children ? 'none' : '1.5px dashed #bfc8d1', borderRadius: 6 }}>
      {children}
    </div>
  );
};

export default CardSlot; 