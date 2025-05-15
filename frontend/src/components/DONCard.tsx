import React from 'react';

interface DONCardProps {
  active: boolean;
  scale?: number;
}

const CARD_WIDTH = 53.55;
const CARD_HEIGHT = 74.8;

const DONCard: React.FC<DONCardProps> = ({ active, scale = 1 }) => {
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transform: active ? 'none' : 'rotate(90deg)',
        opacity: active ? 1 : 0.6,
        transition: 'transform 0.2s, opacity 0.2s',
      }}
    >
      DON
    </div>
  );
};

export default DONCard; 