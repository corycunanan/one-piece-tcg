const fs = require('fs');
const path = require('path');

// Card validation rules
const VALIDATION_RULES = {
  // Required fields for all cards
  required: ['cardId', 'name', 'cardType', 'rarity'],
  
  // Valid card types
  validCardTypes: ['LEADER', 'CHARACTER', 'EVENT', 'STAGE'],
  
  // Valid rarities
  validRarities: ['C', 'UC', 'R', 'SR', 'L', 'SEC', 'P', 'DON', 'SP', 'TR'],
  
  // Valid colors
  validColors: ['Red', 'Blue', 'Green', 'Purple', 'Yellow', 'Black'],
  
  // Valid attributes
  validAttributes: ['Slash', 'Strike', 'Wisdom', 'Ranged', 'Special'],
  
  // Field types
  fieldTypes: {
    cardId: 'string',
    name: 'string',
    cardType: 'string',
    cost: ['number', 'string', 'null'],
    power: ['number', 'null'],
    life: ['number', 'null'],
    counter: ['number', 'null'],
    rarity: 'string',
    effect_description: ['string', 'null'],
    trigger_description: ['string', 'null'],
    keywords: 'array',
    colors: 'array',
    traits: 'array',
    attributes: 'array',
    images: 'array',
    set: 'array'
  }
};

// Validation functions
function validateCard(card, cardIndex) {
  const errors = [];
  const warnings = [];

  // Check required fields
  VALIDATION_RULES.required.forEach(field => {
    if (!card.hasOwnProperty(field)) {
      errors.push(`Missing required field: ${field}`);
    } else if (card[field] === null || card[field] === undefined || card[field] === '') {
      errors.push(`Required field ${field} is empty`);
    }
  });

  // Validate card type
  if (card.cardType && !VALIDATION_RULES.validCardTypes.includes(card.cardType)) {
    errors.push(`Invalid cardType: ${card.cardType}. Must be one of: ${VALIDATION_RULES.validCardTypes.join(', ')}`);
  }

  // Validate rarity
  if (card.rarity && !VALIDATION_RULES.validRarities.includes(card.rarity)) {
    errors.push(`Invalid rarity: ${card.rarity}. Must be one of: ${VALIDATION_RULES.validRarities.join(', ')}`);
  }

  // Validate cost (should be number or string)
  if (card.cost !== null && card.cost !== undefined) {
    if (typeof card.cost !== 'number' && typeof card.cost !== 'string') {
      errors.push(`Invalid cost type: ${typeof card.cost}. Must be number or string`);
    }
  }

  // Validate power (should be number or null)
  if (card.power !== null && card.power !== undefined) {
    if (typeof card.power !== 'number') {
      errors.push(`Invalid power type: ${typeof card.power}. Must be number or null`);
    }
  }

  // Validate life (should be number or null)
  if (card.life !== null && card.life !== undefined) {
    if (typeof card.life !== 'number') {
      errors.push(`Invalid life type: ${typeof card.life}. Must be number or null`);
    }
  }

  // Validate keywords array
  if (card.keywords && !Array.isArray(card.keywords)) {
    errors.push('Keywords must be an array');
  }

  // Validate colors array
  if (card.colors) {
    if (!Array.isArray(card.colors)) {
      errors.push('Colors must be an array');
    } else {
      card.colors.forEach((color, index) => {
        if (!color.color || !VALIDATION_RULES.validColors.includes(color.color)) {
          errors.push(`Invalid color at index ${index}: ${color.color}. Must be one of: ${VALIDATION_RULES.validColors.join(', ')}`);
        }
      });
    }
  }

  // Validate traits array
  if (card.traits) {
    if (!Array.isArray(card.traits)) {
      errors.push('Traits must be an array');
    } else {
      card.traits.forEach((trait, index) => {
        if (!trait.trait) {
          errors.push(`Invalid trait at index ${index}: missing trait property`);
        }
      });
    }
  }

  // Validate attributes array
  if (card.attributes) {
    if (!Array.isArray(card.attributes)) {
      errors.push('Attributes must be an array');
    } else {
      card.attributes.forEach((attr, index) => {
        if (!attr.attribute || !VALIDATION_RULES.validAttributes.includes(attr.attribute)) {
          errors.push(`Invalid attribute at index ${index}: ${attr.attribute}. Must be one of: ${VALIDATION_RULES.validAttributes.join(', ')}`);
        }
      });
    }
  }

  // Validate images array
  if (card.images) {
    if (!Array.isArray(card.images)) {
      errors.push('Images must be an array');
    } else {
      card.images.forEach((image, index) => {
        if (!image.image_url) {
          errors.push(`Image at index ${index} missing image_url`);
        }
        if (!image.label) {
          errors.push(`Image at index ${index} missing label`);
        }
      });
    }
  }

  // Validate set array
  if (card.set) {
    if (!Array.isArray(card.set)) {
      errors.push('Set must be an array');
    } else {
      card.set.forEach((setItem, index) => {
        if (!setItem.set) {
          errors.push(`Set item at index ${index} missing set property`);
        }
      });
    }
  }

  // Warnings for missing optional fields
  if (!card.keywords || card.keywords.length === 0) {
    warnings.push('No keywords defined');
  }

  if (!card.effect_description) {
    warnings.push('No effect description');
  }

  return { errors, warnings };
}

function validateCardFile(filePath) {
  try {
    console.log(`\n🔍 Validating: ${path.basename(filePath)}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const cardData = JSON.parse(fileContent);
    
    const results = {
      file: path.basename(filePath),
      totalCards: 0,
      validCards: 0,
      invalidCards: 0,
      totalErrors: 0,
      totalWarnings: 0,
      cardErrors: [],
      cardWarnings: []
    };

    if (!cardData.cards || !Array.isArray(cardData.cards)) {
      console.error('❌ Invalid file structure: missing or invalid cards array');
      return results;
    }

    results.totalCards = cardData.cards.length;
    
    cardData.cards.forEach((card, index) => {
      const validation = validateCard(card, index);
      
      if (validation.errors.length > 0) {
        results.invalidCards++;
        results.totalErrors += validation.errors.length;
        results.cardErrors.push({
          cardId: card.cardId || `Unknown-${index}`,
          name: card.name || 'Unknown',
          errors: validation.errors
        });
      } else {
        results.validCards++;
      }
      
      if (validation.warnings.length > 0) {
        results.totalWarnings += validation.warnings.length;
        results.cardWarnings.push({
          cardId: card.cardId || `Unknown-${index}`,
          name: card.name || 'Unknown',
          warnings: validation.warnings
        });
      }
    });

    // Print results
    if (results.invalidCards === 0) {
      console.log(`✅ All ${results.totalCards} cards are valid`);
    } else {
      console.log(`❌ ${results.invalidCards}/${results.totalCards} cards have errors`);
    }
    
    if (results.totalWarnings > 0) {
      console.log(`⚠️  ${results.totalWarnings} warnings found`);
    }

    // Print detailed errors
    results.cardErrors.forEach(cardError => {
      console.log(`  ❌ ${cardError.cardId} (${cardError.name}):`);
      cardError.errors.forEach(error => {
        console.log(`    - ${error}`);
      });
    });

    // Print detailed warnings
    results.cardWarnings.forEach(cardWarning => {
      console.log(`  ⚠️  ${cardWarning.cardId} (${cardWarning.name}):`);
      cardWarning.warnings.forEach(warning => {
        console.log(`    - ${warning}`);
      });
    });

    return results;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return null;
  }
}

function validateAllCards() {
  const cardsDir = path.join(__dirname, '..', 'data', 'cards');
  
  if (!fs.existsSync(cardsDir)) {
    console.error('❌ Cards directory not found:', cardsDir);
    return;
  }
  
  const files = fs.readdirSync(cardsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  console.log(`🔍 Validating ${jsonFiles.length} card files...`);
  
  const allResults = [];
  let totalCards = 0;
  let totalValidCards = 0;
  let totalInvalidCards = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  jsonFiles.forEach(file => {
    const filePath = path.join(cardsDir, file);
    const result = validateCardFile(filePath);
    
    if (result) {
      allResults.push(result);
      totalCards += result.totalCards;
      totalValidCards += result.validCards;
      totalInvalidCards += result.invalidCards;
      totalErrors += result.totalErrors;
      totalWarnings += result.totalWarnings;
    }
  });
  
  // Summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total files processed: ${jsonFiles.length}`);
  console.log(`Total cards: ${totalCards}`);
  console.log(`Valid cards: ${totalValidCards}`);
  console.log(`Invalid cards: ${totalInvalidCards}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total warnings: ${totalWarnings}`);
  
  if (totalInvalidCards === 0) {
    console.log('\n🎉 All cards are valid!');
  } else {
    console.log('\n❌ Some cards need attention.');
  }
  
  return allResults;
}

// Export functions for use in other scripts
module.exports = {
  validateCard,
  validateCardFile,
  validateAllCards,
  VALIDATION_RULES
};

// Run validation if script is executed directly
if (require.main === module) {
  validateAllCards();
} 