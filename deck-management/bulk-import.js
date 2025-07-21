#!/usr/bin/env node

const { loadCardData, question } = require('./utils/data-loader');
const { getAvailableDecks, loadDeckFromFile } = require('./utils/deck-loader');
const { displayDeckList } = require('./utils/deck-display');
const { interactiveBulkImport } = require('./utils/bulk-importer');
const { saveDeck } = require('./utils/file-operations');

// Main function for bulk importing into existing decks
async function bulkImportToDeck() {
  console.log('📦 One Piece TCG Bulk Import Tool');
  console.log('==================================\n');

  // Load card data
  console.log('📚 Loading card data...');
  const cards = loadCardData();
  console.log(`✅ Loaded ${cards.length} cards\n`);

  // Get available decks
  const decks = getAvailableDecks();
  
  if (decks.length === 0) {
    console.log('❌ No deck files found. Please create a deck first using the deck creator.');
    return;
  }

  displayDeckList(decks);

  // Select deck to modify
  while (true) {
    const selection = await question('\nEnter the number of the deck to modify (or "q" to quit): ');
    
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

    console.log(`\n🎴 Modifying deck: ${deckData.name}`);
    console.log(`Current cards: ${deckData.mainDeck.reduce((sum, card) => sum + card.quantity, 0)}/50`);

    // Get all available cards (not filtered by leader colors for bulk import)
    const availableCards = cards.filter(card => card.cardType !== 'LEADER');

    // Perform bulk import
    const newMainDeck = await interactiveBulkImport(deckData, availableCards, question);
    
    if (newMainDeck) {
      // Update the deck
      deckData.mainDeck = newMainDeck;
      deckData.updatedAt = new Date().toISOString();
      
      // Save the updated deck
      const filepath = saveDeck(deckData, deckData.name);
      
      console.log(`\n💾 Updated deck saved to: ${filepath}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('Press Enter to modify another deck or "q" to quit...');
    
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

// Run the script
if (require.main === module) {
  bulkImportToDeck().catch(error => {
    console.error('❌ Error during bulk import:', error);
    process.exit(1);
  });
}

module.exports = { bulkImportToDeck }; 