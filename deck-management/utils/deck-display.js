const { loadDeckFromFile } = require('./deck-loader');
const { displayCard } = require('./card-display');

// Display deck list with numbers
function displayDeckList(decks) {
  console.log('\n📚 Available Decks:');
  console.log('===================\n');
  
  if (decks.length === 0) {
    console.log('❌ No deck files found in the current directory.');
    return;
  }

  decks.forEach((deck, index) => {
    try {
      const deckData = loadDeckFromFile(deck.filepath);
      if (deckData) {
        console.log(`${index + 1}. ${deckData.name}`);
        console.log(`   Leader: ${deckData.leader?.name || 'Unknown'} (${deckData.leader?.cardId || 'N/A'})`);
        console.log(`   Cards: ${deckData.mainDeck?.reduce((sum, card) => sum + card.quantity, 0) || 0}/50`);
        console.log(`   Valid: ${deckData.isValid ? '✅' : '❌'}`);
        console.log(`   File: ${deck.filename}\n`);
      }
    } catch (error) {
      console.log(`${index + 1}. ${deck.filename} (Error loading)\n`);
    }
  });
}

// Display cards in a category with frequency
function displayCategory(categoryName, cards, title) {
  if (cards.length === 0) {
    console.log(`\n📋 ${title}: None`);
    return;
  }

  console.log(`\n📋 ${title} (${cards.length} unique cards):`);
  console.log('='.repeat(title.length + 20));
  
  // Sort by quantity (descending) then by name
  const sortedCards = cards.sort((a, b) => {
    if (b.quantity !== a.quantity) {
      return b.quantity - a.quantity;
    }
    return a.name.localeCompare(b.name);
  });

  sortedCards.forEach(card => {
    const quantityText = card.quantity > 1 ? ` (${card.quantity}x)` : '';
    console.log(`\n${card.name}${quantityText} (${card.cardId})`);
    console.log(`   Type: ${card.cardType} | Cost: ${card.cost !== null ? card.cost : '-'} | Power: ${card.power !== null ? card.power : '-'}`);
    console.log(`   Colors: ${card.colors.map(c => c.color).join(', ')} | Traits: ${card.traits.map(t => t.trait).join(', ')}`);
    if (card.effect_description) {
      console.log(`   Effect: ${card.effect_description.substring(0, 80)}${card.effect_description.length > 80 ? '...' : ''}`);
    }
  });
}

// Display deck statistics
function displayDeckStats(deck) {
  const totalCards = deck.mainDeck?.reduce((sum, card) => sum + card.quantity, 0) || 0;
  const uniqueCards = deck.mainDeck?.length || 0;
  
  console.log('\n📊 Deck Statistics:');
  console.log('===================');
  console.log(`Total cards: ${totalCards}/50`);
  console.log(`Unique cards: ${uniqueCards}`);
  console.log(`Valid: ${deck.isValid ? '✅' : '❌'}`);
  
  if (deck.validationErrors && deck.validationErrors.length > 0) {
    console.log('\n❌ Validation Errors:');
    deck.validationErrors.forEach(error => console.log(`   - ${error}`));
  }

  // Cost distribution
  const costDistribution = {};
  deck.mainDeck?.forEach(card => {
    const cost = card.cost || 0;
    costDistribution[cost] = (costDistribution[cost] || 0) + card.quantity;
  });

  console.log('\n💰 Cost Distribution:');
  Object.entries(costDistribution)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([cost, count]) => {
      console.log(`   Cost ${cost}: ${count} cards`);
    });

  // Color distribution
  const colorDistribution = {};
  deck.mainDeck?.forEach(card => {
    card.colors.forEach(color => {
      colorDistribution[color.color] = (colorDistribution[color.color] || 0) + card.quantity;
    });
  });

  console.log('\n🎨 Color Distribution:');
  Object.entries(colorDistribution)
    .sort(([,a], [,b]) => b - a)
    .forEach(([color, count]) => {
      console.log(`   ${color}: ${count} cards`);
    });
}

module.exports = {
  displayDeckList,
  displayCategory,
  displayDeckStats
}; 