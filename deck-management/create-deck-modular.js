#!/usr/bin/env node

const { loadCardData, rl, question } = require('./utils/data-loader');
const { validateDeck, getDeckStats } = require('./utils/deck-validation');
const { selectLeader, buildMainDeck } = require('./utils/deck-builder');
const { saveDeck } = require('./utils/file-operations');

// Main function
async function createDeck() {
  console.log('🎴 One Piece TCG Deck Creator');
  console.log('==============================\n');

  // Load card data
  console.log('📚 Loading card data...');
  const cards = loadCardData();
  console.log(`✅ Loaded ${cards.length} cards\n`);

  // Get deck name
  const deckName = await question('Enter deck name: ');
  if (!deckName.trim()) {
    console.log('❌ Deck name is required');
    rl.close();
    return;
  }

  // Select leader
  const leader = await selectLeader(cards);

  // Build main deck
  const mainDeck = await buildMainDeck(cards, leader);

  // Create deck object
  const deck = {
    name: deckName.trim(),
    description: '',
    leader: leader,
    mainDeck: mainDeck,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isValid: false,
    validationErrors: []
  };

  // Validate deck
  console.log('\n🔍 Validating deck...');
  const validation = validateDeck(deck);
  deck.isValid = validation.isValid;
  deck.validationErrors = validation.errors;

  if (validation.isValid) {
    console.log('✅ Deck is valid!');
  } else {
    console.log('❌ Deck validation failed:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }

  // Show deck statistics
  const stats = getDeckStats(deck);
  console.log('\n📊 Deck Statistics:');
  console.log(`   Total cards: ${stats.totalCards}/50`);
  console.log(`   Card types: ${Object.entries(stats.cardTypeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}`);
  console.log(`   Colors: ${Object.entries(stats.colorCounts).map(([color, count]) => `${color}: ${count}`).join(', ')}`);
  console.log(`   Cost distribution: ${Object.entries(stats.costDistribution).map(([cost, count]) => `${cost}: ${count}`).join(', ')}`);

  // Save deck
  const filepath = saveDeck(deck, deckName);

  console.log('\n🎉 Deck creation complete!');
  console.log(`📁 File: ${filepath}`);
  console.log(`✅ Valid: ${deck.isValid}`);
  
  rl.close();
}

// Run the script
if (require.main === module) {
  createDeck().catch(error => {
    console.error('❌ Error creating deck:', error);
    process.exit(1);
  });
}

module.exports = { createDeck }; 