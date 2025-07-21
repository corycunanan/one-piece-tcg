// Categorize cards by type
function categorizeCards(deck) {
  const categories = {
    leader: deck.leader ? [deck.leader] : [],
    characters: [],
    events: [],
    stages: []
  };

  if (deck.mainDeck) {
    deck.mainDeck.forEach(card => {
      switch (card.cardType) {
        case 'CHARACTER':
          categories.characters.push(card);
          break;
        case 'EVENT':
          categories.events.push(card);
          break;
        case 'STAGE':
          categories.stages.push(card);
          break;
      }
    });
  }

  return categories;
}

module.exports = {
  categorizeCards
}; 