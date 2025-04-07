module.exports = function evaluateCondition(condition, gameState, player) {
    if (!condition) return true; // No condition = always true

    const p = gameState[player];
  
    switch (condition.type) {
      case 'hasTrait':
        return gameState[player].field?.some(card =>
          card.traits?.includes(condition.trait)
        );
  
    case 'donThreshold':
        return gameState[player].don >= condition.min;
  
    case 'opponentHasCard':
        return gameState.opponent?.hand?.length >= (condition.min || 1);
        
    case 'trashCard':
        const handSize = p.hand.length;
        const amount = condition.amount || 1;
        return handSize >= amount;
      
      default:
        console.warn(`⚠️ Unknown condition type: ${condition.type}`);
        return false;
    }
  };
  