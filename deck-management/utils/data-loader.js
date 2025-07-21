const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load card data from db.json
function loadCardData() {
  try {
    const dbPath = path.join(__dirname, '..', '..', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    return dbData.cards || [];
  } catch (error) {
    console.error('❌ Error loading card data:', error.message);
    console.log('Make sure db.json exists in the project root');
    process.exit(1);
  }
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promise wrapper for readline
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

module.exports = {
  loadCardData,
  rl,
  question
}; 