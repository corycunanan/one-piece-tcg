const fs = require('fs');
const path = require('path');

// Save deck to file in data/decks directory
function saveDeck(deck, deckName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${deckName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
  const decksPath = path.join(__dirname, '..', '..', 'data', 'decks');
  
  // Create decks directory if it doesn't exist
  if (!fs.existsSync(decksPath)) {
    fs.mkdirSync(decksPath, { recursive: true });
  }
  
  const filepath = path.join(decksPath, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deck, null, 2));
  console.log(`\n💾 Deck saved to: ${filepath}`);
  return filepath;
}

module.exports = {
  saveDeck
}; 