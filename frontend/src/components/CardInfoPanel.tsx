import React from 'react';
import { MockCard } from '../mockCards';

interface CardInfoPanelProps {
  card?: MockCard | null;
}

const CardInfoPanel: React.FC<CardInfoPanelProps> = ({ card }) => {
  if (!card) return null;
  return (
    <div className="card-info-panel-inner">
      <h2>{card.name}</h2>
      <div>Type: {card.type}</div>
      {card.cost !== undefined && <div>Cost: {card.cost}</div>}
      {card.power !== undefined && <div>Power: {card.power}</div>}
      {card.life !== undefined && <div>Life: {card.life}</div>}
      {/* Add more card details as needed */}
    </div>
  );
};

export default CardInfoPanel; 