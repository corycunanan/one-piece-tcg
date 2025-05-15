import React, { useState } from 'react';

interface DONCardProps {
  active: boolean;
  scale?: number;
  isHovered?: boolean;
}

const CARD_WIDTH = 53.55;
const CARD_HEIGHT = 74.8;

const DONCard: React.FC<DONCardProps> = ({ active, scale = 1, isHovered: isHoveredProp }) => {
  const [internalHovered, setInternalHovered] = useState(false);
  const isHovered = isHoveredProp !== undefined ? isHoveredProp : internalHovered;
  return (
    <div
      style={{
        width: CARD_WIDTH * scale,
        height: CARD_HEIGHT * scale,
        background: '#fff',
        border: '2px solid #bfc8d1',
        borderRadius: 6,
        margin: '0 2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        color: '#4a5568',
        fontSize: 12 * scale,
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.04)',
        transform: `${active ? '' : 'rotate(90deg)'}${isHovered ? ' translateZ(20px) scale(1.05)' : ''}`.trim(),
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        zIndex: isHovered ? 10 : 1,
        overflow: 'hidden',
      }}
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
    >
      <img
        src="/zoro-don.jpg"
        alt="DON"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {!active && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(128, 128, 128, 0.5)',
            zIndex: 1,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '2px 8px',
          borderRadius: 4,
          fontWeight: 700,
          color: '#4a5568',
        }}
      >
        DON
      </div>
    </div>
  );
};

export default DONCard; 