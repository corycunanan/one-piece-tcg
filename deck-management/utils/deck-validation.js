// Validate deck according to One Piece TCG rules
function validateDeck(deck) {
  const errors = [];
  const warnings = [];

  // Check if leader exists
  if (!deck.leader) {
    errors.push('Deck must have exactly one leader card');
  } else if (deck.leader.cardType !== 'LEADER') {
    errors.push('Leader card must be of type LEADER');
  }

  // Check main deck size
  const totalCards = deck.mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  if (totalCards !== 50) {
    errors.push(`Main deck must have exactly 50 cards, found ${totalCards}`);
  }

  // Check card type restrictions
  const invalidCards = deck.mainDeck.filter(card => 
    !['CHARACTER', 'EVENT', 'STAGE'].includes(card.cardType)
  );
  if (invalidCards.length > 0) {
    errors.push('Main deck can only contain CHARACTER, EVENT, or STAGE cards');
  }

  // Check copy limits (with exception for OP01-075)
  const cardCounts = {};
  deck.mainDeck.forEach(card => {
    cardCounts[card.cardId] = (cardCounts[card.cardId] || 0) + card.quantity;
  });

  for (const [cardId, count] of Object.entries(cardCounts)) {
    // Special exception for OP01-075 - unlimited copies allowed
    if (cardId === 'OP01-075') {
      continue; // Skip validation for this card
    }
    
    if (count > 4) {
      const card = deck.mainDeck.find(c => c.cardId === cardId);
      errors.push(`${card?.name || cardId} has ${count} copies (maximum 4 allowed)`);
    }
  }

  // Check color matching with leader
  if (deck.leader && deck.mainDeck.length > 0) {
    const leaderColors = deck.leader.colors.map(c => c.color);
    const unmatchedCards = deck.mainDeck.filter(card => {
      const cardColors = card.colors.map(c => c.color);
      return !cardColors.some(color => leaderColors.includes(color));
    });

    if (unmatchedCards.length > 0) {
      errors.push('All cards in the deck must match at least one color of the leader card');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Get deck statistics
function getDeckStats(deck) {
  const totalCards = deck.mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  
  const cardTypeCounts = deck.mainDeck.reduce((counts, card) => {
    counts[card.cardType] = (counts[card.cardType] || 0) + card.quantity;
    return counts;
  }, {});
  
  const colorCounts = deck.mainDeck.reduce((counts, card) => {
    card.colors.forEach(color => {
      counts[color.color] = (counts[color.color] || 0) + card.quantity;
    });
    return counts;
  }, {});
  
  const costDistribution = deck.mainDeck.reduce((distribution, card) => {
    const cost = card.cost || 0;
    distribution[cost] = (distribution[cost] || 0) + card.quantity;
    return distribution;
  }, {});

  return {
    totalCards,
    cardTypeCounts,
    colorCounts,
    costDistribution
  };
}

module.exports = {
  validateDeck,
  getDeckStats
}; 