#!/usr/bin/env node

const { viewDeck } = require('./utils/deck-viewer');

// Main function
async function main() {
  try {
    await viewDeck();
  } catch (error) {
    console.error('❌ Error viewing deck:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main }; 