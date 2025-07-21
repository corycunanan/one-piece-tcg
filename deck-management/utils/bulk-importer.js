const { loadCardData } = require('./data-loader');

// Parse bulk import format: "quantityxcardId"
function parseBulkImport(input) {
  const lines = input.trim().split('\n');
  const cards = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    // Parse format: "quantityxcardId"
    const match = line.match(/^(\d+)x([A-Z0-9\-]+)$/);
    if (!match) {
      errors.push(`Line ${i + 1}: Invalid format "${line}". Expected format: "quantityxcardId" (e.g., "4xOP05-015")`);
      continue;
    }

    const quantity = parseInt(match[1]);
    const cardId = match[2];

    if (quantity < 1 || quantity > 50) {
      errors.push(`Line ${i + 1}: Invalid quantity ${quantity}. Must be between 1 and 50.`);
      continue;
    }

    cards.push({ cardId, quantity });
  }

  return { cards, errors };
}

// Validate that all cards exist in the database
function validateCards(cards, allCards) {
  const errors = [];
  const validatedCards = [];

  for (const card of cards) {
    const foundCard = allCards.find(c => c.cardId === card.cardId);
    if (!foundCard) {
      errors.push(`Card not found: ${card.cardId}`);
      continue;
    }

    validatedCards.push({
      ...foundCard,
      quantity: card.quantity
    });
  }

  return { validatedCards, errors };
}

// Bulk import cards into a deck
function bulkImportCards(deck, cardsToAdd, allCards) {
  const newMainDeck = [...deck.mainDeck];
  const addedCards = [];
  const errors = [];

  for (const cardToAdd of cardsToAdd) {
    const existingCardIndex = newMainDeck.findIndex(card => card.cardId === cardToAdd.cardId);
    
    if (existingCardIndex >= 0) {
      // Update existing card quantity
      const currentQuantity = newMainDeck[existingCardIndex].quantity;
      const newQuantity = currentQuantity + cardToAdd.quantity;
      
      // Check if this would exceed the limit (except for OP01-075)
      if (cardToAdd.cardId === 'OP01-075') {
        // Unlimited copies allowed for OP01-075
        newMainDeck[existingCardIndex].quantity = newQuantity;
        addedCards.push({
          card: cardToAdd,
          action: 'updated',
          oldQuantity: currentQuantity,
          newQuantity: newQuantity
        });
      } else if (newQuantity > 4) {
        errors.push(`${cardToAdd.name} (${cardToAdd.cardId}): Cannot add ${cardToAdd.quantity} more copies. Would exceed limit of 4 (currently have ${currentQuantity})`);
      } else {
        newMainDeck[existingCardIndex].quantity = newQuantity;
        addedCards.push({
          card: cardToAdd,
          action: 'updated',
          oldQuantity: currentQuantity,
          newQuantity: newQuantity
        });
      }
    } else {
      // Add new card
      newMainDeck.push({
        ...cardToAdd,
        quantity: cardToAdd.quantity
      });
      addedCards.push({
        card: cardToAdd,
        action: 'added',
        quantity: cardToAdd.quantity
      });
    }
  }

  return {
    newMainDeck,
    addedCards,
    errors
  };
}

// Interactive bulk import function
async function interactiveBulkImport(deck, allCards, question) {
  console.log('\n📦 Bulk Import Cards');
  console.log('====================');
  console.log('Enter cards in the format: quantityxcardId');
  console.log('Examples:');
  console.log('  4xOP05-015');
  console.log('  1xP-069');
  console.log('  2xOP09-108');
  console.log('\nEnter your cards (press Enter twice when done):\n');

  const lines = [];
  let line;
  
  while (true) {
    line = await question('');
    if (line.trim() === '') {
      if (lines.length === 0) {
        console.log('❌ No cards entered. Cancelling bulk import.');
        return null;
      }
      break;
    }
    lines.push(line.trim());
  }

  // Parse the input using the collected lines
  const { cards, errors: parseErrors } = parseBulkImportFromLines(lines);
  
  if (parseErrors.length > 0) {
    console.log('\n❌ Parse errors:');
    parseErrors.forEach(error => console.log(`   ${error}`));
    return null;
  }

  if (cards.length === 0) {
    console.log('❌ No valid cards found in input.');
    return null;
  }

  // Validate that all cards exist
  const { validatedCards, errors: validationErrors } = validateCards(cards, allCards);
  
  if (validationErrors.length > 0) {
    console.log('\n❌ Validation errors:');
    validationErrors.forEach(error => console.log(`   ${error}`));
    return null;
  }

  // Check current deck size
  const currentTotal = deck.mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  const newCardsTotal = validatedCards.reduce((sum, card) => sum + card.quantity, 0);
  const finalTotal = currentTotal + newCardsTotal;

  if (finalTotal > 50) {
    console.log(`\n❌ Cannot add cards. Would exceed 50 card limit.`);
    console.log(`   Current deck: ${currentTotal} cards`);
    console.log(`   Adding: ${newCardsTotal} cards`);
    console.log(`   Final total: ${finalTotal} cards (limit: 50)`);
    return null;
  }

  // Perform the bulk import
  const { newMainDeck, addedCards, errors: importErrors } = bulkImportCards(deck, validatedCards, allCards);

  if (importErrors.length > 0) {
    console.log('\n❌ Import errors:');
    importErrors.forEach(error => console.log(`   ${error}`));
    return null;
  }

  // Show results
  console.log('\n✅ Bulk import completed successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   Cards processed: ${validatedCards.length}`);
  console.log(`   Cards added: ${addedCards.filter(a => a.action === 'added').length}`);
  console.log(`   Cards updated: ${addedCards.filter(a => a.action === 'updated').length}`);
  console.log(`   Total cards in deck: ${newMainDeck.reduce((sum, card) => sum + card.quantity, 0)}/50`);

  console.log('\n📋 Added/Updated Cards:');
  addedCards.forEach(added => {
    if (added.action === 'added') {
      console.log(`   + ${added.quantity}x ${added.card.name} (${added.card.cardId})`);
    } else {
      console.log(`   ~ ${added.card.name} (${added.card.cardId}): ${added.oldQuantity} → ${added.newQuantity}`);
    }
  });

  return newMainDeck;
}

// Parse bulk import format from an array of lines
function parseBulkImportFromLines(lines) {
  const cards = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue; // Skip empty lines

    // Parse format: "quantityxcardId"
    const match = line.match(/^(\d+)x([A-Z0-9\-]+)$/);
    if (!match) {
      errors.push(`Line ${i + 1}: Invalid format "${line}". Expected format: "quantityxcardId" (e.g., "4xOP05-015")`);
      continue;
    }

    const quantity = parseInt(match[1]);
    const cardId = match[2];

    if (quantity < 1 || quantity > 50) {
      errors.push(`Line ${i + 1}: Invalid quantity ${quantity}. Must be between 1 and 50.`);
      continue;
    }

    cards.push({ cardId, quantity });
  }

  return { cards, errors };
}

module.exports = {
  parseBulkImport,
  parseBulkImportFromLines,
  validateCards,
  bulkImportCards,
  interactiveBulkImport
}; 