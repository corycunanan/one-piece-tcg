const fs = require('fs');
const path = require('path');

// Get all deck files in the data/decks directory
function getAvailableDecks() {
  try {
    const decksPath = path.join(__dirname, '..', '..', 'data', 'decks');
    
    // Create decks directory if it doesn't exist
    if (!fs.existsSync(decksPath)) {
      fs.mkdirSync(decksPath, { recursive: true });
    }
    
    const files = fs.readdirSync(decksPath);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        filename: file,
        filepath: path.join(decksPath, file)
      }))
      .filter(deck => {
        try {
          const content = fs.readFileSync(deck.filepath, 'utf8');
          const deckData = JSON.parse(content);
          return deckData.name && deckData.leader; // Basic validation
        } catch {
          return false; // Skip invalid JSON files
        }
      });
  } catch (error) {
    console.error('❌ Error reading deck directory:', error.message);
    return [];
  }
}

// Load deck data from file
function loadDeckFromFile(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ Error loading deck:', error.message);
    return null;
  }
}

module.exports = {
  getAvailableDecks,
  loadDeckFromFile
}; 