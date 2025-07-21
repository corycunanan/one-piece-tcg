const { question } = require('./data-loader');
const { displayCard } = require('./card-display');
const { getAvailableDecks, loadDeckFromFile } = require('./deck-loader');
const { categorizeCards } = require('./deck-categorizer');
const { displayDeckList, displayCategory, displayDeckStats } = require('./deck-display');

// Main function to view a deck
async function viewDeck() {
  console.log('🔍 One Piece TCG Deck Viewer');
  console.log('==============================\n');

  const decks = getAvailableDecks();
  
  if (decks.length === 0) {
    console.log('❌ No deck files found. Please create a deck first using the deck creator.');
    return;
  }

  displayDeckList(decks);

  while (true) {
    const selection = await question('\nEnter the number of the deck to view (or "q" to quit): ');
    
    if (selection.toLowerCase() === 'q') {
      console.log('👋 Goodbye!');
      return;
    }

    const deckIndex = parseInt(selection) - 1;
    
    if (isNaN(deckIndex) || deckIndex < 0 || deckIndex >= decks.length) {
      console.log('❌ Invalid selection. Please try again.');
      continue;
    }

    const selectedDeck = decks[deckIndex];
    const deckData = loadDeckFromFile(selectedDeck.filepath);
    
    if (!deckData) {
      console.log('❌ Error loading deck data. Please try again.');
      continue;
    }

    // Display deck details
    console.log(`\n🎴 ${deckData.name}`);
    console.log('='.repeat(deckData.name.length + 10));
    console.log(`Created: ${deckData.createdAt || 'Unknown'}`);
    console.log(`Updated: ${deckData.updatedAt || 'Unknown'}`);
    
    // Display leader
    if (deckData.leader) {
      console.log('\n👑 Leader:');
      console.log('==========');
      displayCard(deckData.leader);
    }

    // Categorize and display cards
    const categories = categorizeCards(deckData);
    
    displayCategory('characters', categories.characters, 'Characters');
    displayCategory('events', categories.events, 'Events');
    displayCategory('stages', categories.stages, 'Stages');

    // Display statistics
    displayDeckStats(deckData);

    console.log('\n' + '='.repeat(50));
    console.log('Press Enter to view another deck or "q" to quit...');
    
    const continueChoice = await question('');
    if (continueChoice.toLowerCase() === 'q') {
      console.log('👋 Goodbye!');
      return;
    }
    
    // Clear screen and show deck list again
    console.clear();
    displayDeckList(decks);
  }
}

module.exports = {
  viewDeck
}; 