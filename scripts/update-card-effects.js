const fs = require('fs');
const path = require('path');

// Common keywords for One Piece TCG
const COMMON_KEYWORDS = {
  // Combat keywords
  'Rush': 'Can attack the turn it comes into play',
  'doubleAttack': 'Can attack twice per turn',
  'banish': 'Remove from game',
  'blocker': 'Can block attacks',
  'characterRush': 'Can attack characters directly',
  'attackActiveCharacters': 'Can attack active characters',
  
  // Effect keywords
  'draw': 'Draw cards',
  'search': 'Search deck for cards',
  'discard': 'Discard cards',
  'rest': 'Tap/rest this card',
  'don': 'Attach Don!! cards',
  'counter': 'Add counter cards',
  'life': 'Life points',
  'power': 'Attack power',
  'cost': 'Cost to play',
  
  // Timing keywords
  'onPlay': 'When this card is played',
  'onAttack': 'When this card attacks',
  'onBlock': 'When this card blocks',
  'onRest': 'When this card is rested',
  'onDon': 'When Don!! is attached',
  'onCounter': 'When counter is added',
  
  // Target keywords
  'target': 'Choose a target',
  'all': 'Affects all cards',
  'your': 'Your cards',
  'opponent': 'Opponent\'s cards',
  'leader': 'Leader card',
  'character': 'Character cards',
  'event': 'Event cards',
  'stage': 'Stage cards'
};

// Example card updates
const EXAMPLE_UPDATES = {
  'ST01-006': {
    name: 'Tony Tony.Chopper',
    keywords: ['blocker'],
    effect_description: '[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)'
  },
  'ST01-014': {
    name: 'Guard Point',
    keywords: ['draw', 'search'],
    effect_description: 'Draw 1 card. Then, search your deck for up to 1 {Animal} or {Straw Hat Crew} card, reveal it, and add it to your hand.'
  }
};

function extractKeywordsFromEffect(effectText) {
  if (!effectText) return [];
  
  const keywords = [];
  const effectLower = effectText.toLowerCase();
  
  // Check for common keywords
  Object.keys(COMMON_KEYWORDS).forEach(keyword => {
    if (effectLower.includes(keyword.toLowerCase())) {
      keywords.push(keyword);
    }
  });
  
  return keywords;
}

function updateCardEffects(filePath, updates = {}) {
  try {
    console.log(`\n📝 Updating: ${path.basename(filePath)}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const cardData = JSON.parse(fileContent);
    
    let updatedCount = 0;
    
    cardData.cards.forEach(card => {
      // Check if we have specific updates for this card
      if (updates[card.cardId]) {
        const update = updates[card.cardId];
        
        if (update.keywords) {
          card.keywords = update.keywords;
        }
        
        if (update.effect_description) {
          card.effect_description = update.effect_description;
        }
        
        if (update.trigger_description) {
          card.trigger_description = update.trigger_description;
        }
        
        updatedCount++;
        console.log(`  ✅ Updated ${card.cardId} (${card.name})`);
      } else {
        // Auto-extract keywords from existing effect description
        if (card.effect_description && (!card.keywords || card.keywords.length === 0)) {
          const extractedKeywords = extractKeywordsFromEffect(card.effect_description);
          if (extractedKeywords.length > 0) {
            card.keywords = extractedKeywords;
            updatedCount++;
            console.log(`  🔍 Auto-extracted keywords for ${card.cardId} (${card.name}): ${extractedKeywords.join(', ')}`);
          }
        }
      }
    });
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(cardData, null, 2), 'utf8');
    
    console.log(`  📊 Updated ${updatedCount} cards`);
    return updatedCount;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return 0;
  }
}

function updateAllCardFiles(updates = {}) {
  const cardsDir = path.join(__dirname, '..', 'data', 'cards');
  
  if (!fs.existsSync(cardsDir)) {
    console.error('❌ Cards directory not found:', cardsDir);
    return;
  }
  
  const files = fs.readdirSync(cardsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  console.log(`📝 Updating ${jsonFiles.length} card files...`);
  
  let totalUpdated = 0;
  
  jsonFiles.forEach(file => {
    const filePath = path.join(cardsDir, file);
    const updatedCount = updateCardEffects(filePath, updates);
    totalUpdated += updatedCount;
  });
  
  console.log(`\n🎉 Completed! Updated ${totalUpdated} cards total.`);
}

function showKeywordHelp() {
  console.log('\n📚 KEYWORD REFERENCE');
  console.log('='.repeat(50));
  
  Object.entries(COMMON_KEYWORDS).forEach(([keyword, description]) => {
    console.log(`${keyword}: ${description}`);
  });
  
  console.log('\n💡 USAGE EXAMPLES:');
  console.log('1. Run validation: node scripts/validate-cards.js');
  console.log('2. Update specific cards:');
  console.log('   const updates = {');
  console.log('     "ST01-006": {');
  console.log('       keywords: ["blocker", "rush"]');
  console.log('     }');
  console.log('   };');
  console.log('   updateAllCardFiles(updates);');
}

function showExampleUpdates() {
  console.log('\n📋 EXAMPLE CARD UPDATES');
  console.log('='.repeat(50));
  
  Object.entries(EXAMPLE_UPDATES).forEach(([cardId, update]) => {
    console.log(`\n${cardId} (${update.name}):`);
    console.log(`  Keywords: [${update.keywords.join(', ')}]`);
    console.log(`  Effect: ${update.effect_description}`);
  });
}

// Export functions
module.exports = {
  updateCardEffects,
  updateAllCardFiles,
  extractKeywordsFromEffect,
  COMMON_KEYWORDS,
  EXAMPLE_UPDATES,
  showKeywordHelp,
  showExampleUpdates
};

// Run examples if script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showKeywordHelp();
  } else if (args.includes('--examples') || args.includes('-e')) {
    showExampleUpdates();
  } else {
    console.log('Card Effect Update Tool');
    console.log('Usage:');
    console.log('  node scripts/update-card-effects.js --help     # Show keyword reference');
    console.log('  node scripts/update-card-effects.js --examples # Show example updates');
    console.log('\nTo update cards, import and use the functions:');
    console.log('  const { updateAllCardFiles } = require("./scripts/update-card-effects.js");');
    console.log('  updateAllCardFiles(yourUpdates);');
  }
} 