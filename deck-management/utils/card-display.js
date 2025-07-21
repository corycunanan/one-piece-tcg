// Display card information
function displayCard(card, index = null) {
  const prefix = index !== null ? `${index + 1}. ` : '';
  const cost = card.cost !== null ? card.cost : '-';
  const power = card.power !== null ? card.power : '-';
  const life = card.life !== null ? card.life : '-';
  const colors = card.colors.map(c => c.color).join(', ');
  const traits = card.traits.map(t => t.trait).join(', ');
  
  console.log(`${prefix}${card.name} (${card.cardId})`);
  console.log(`   Type: ${card.cardType} | Cost: ${cost} | Power: ${power} | Life: ${life}`);
  console.log(`   Colors: ${colors} | Traits: ${traits}`);
  if (card.effect_description) {
    console.log(`   Effect: ${card.effect_description.substring(0, 80)}${card.effect_description.length > 80 ? '...' : ''}`);
  }
  console.log('');
}

// Search cards by name or cardId
function searchCards(cards, query) {
  const lowerQuery = query.toLowerCase();
  return cards.filter(card => 
    card.name.toLowerCase().includes(lowerQuery) ||
    card.cardId.toLowerCase().includes(lowerQuery)
  );
}

// Filter cards by type
function filterCardsByType(cards, cardType) {
  return cards.filter(card => card.cardType === cardType);
}

module.exports = {
  displayCard,
  searchCards,
  filterCardsByType
}; 