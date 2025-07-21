const { updateAllCardFiles } = require('./update-card-effects.js');
const { validateAllCards } = require('./validate-cards.js');

// Example: Update specific cards with keywords and effects
const exampleUpdates = {
  'ST01-006': {
    name: 'Tony Tony.Chopper',
    keywords: ['blocker'],
    effect_description: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)'
  },
  'ST01-014': {
    name: 'Guard Point',
    keywords: ['draw', 'search'],
    effect_description: 'Draw 1 card. Then, search your deck for up to 1 {Animal} or {Straw Hat Crew} card, reveal it, and add it to your hand.'
  },
  'ST01-001': {
    name: 'Monkey D. Luffy',
    keywords: ['leader', 'rush', 'don'],
    effect_description: '[Leader] [Rush] When this card attacks, you may attach up to 1 {Don!!} card from your hand to this card.'
  }
};

console.log('🎯 Example Card Updates');
console.log('='.repeat(50));

// Show what we're going to update
Object.entries(exampleUpdates).forEach(([cardId, update]) => {
  console.log(`\n${cardId} (${update.name}):`);
  console.log(`  Keywords: [${update.keywords.join(', ')}]`);
  console.log(`  Effect: ${update.effect_description}`);
});

// Ask for confirmation
console.log('\n❓ Do you want to apply these updates? (y/n)');
console.log('Note: This will modify the card files directly.');

// In a real scenario, you might want to add user input here
// For now, we'll just show the example without actually running it
console.log('\n💡 To actually apply these updates, uncomment the line below:');
console.log('// updateAllCardFiles(exampleUpdates);');

console.log('\n🔍 To validate all cards after updates:');
console.log('// validateAllCards();');

module.exports = { exampleUpdates }; 