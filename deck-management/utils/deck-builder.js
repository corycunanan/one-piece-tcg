const { question } = require('./data-loader');
const { displayCard, searchCards, filterCardsByType } = require('./card-display');
const { interactiveBulkImport } = require('./bulk-importer');

// Interactive leader selection
async function selectLeader(cards) {
  console.log('\n🎯 STEP 1: Select your Leader Card');
  console.log('=====================================');
  
  const leaders = filterCardsByType(cards, 'LEADER');
  console.log(`Found ${leaders.length} leader cards available.\n`);

  while (true) {
    const searchTerm = await question('Search for a leader (name or cardId): ');
    if (!searchTerm.trim()) continue;

    const results = searchCards(leaders, searchTerm);
    
    if (results.length === 0) {
      console.log('❌ No leaders found matching your search. Try again.\n');
      continue;
    }

    console.log(`\nFound ${results.length} leader(s):\n`);
    results.slice(0, 10).forEach((card, index) => displayCard(card, index));

    if (results.length > 10) {
      console.log(`... and ${results.length - 10} more results`);
    }

    const selection = await question('\nEnter the number of the leader you want to select (or search again): ');
    
    if (isNaN(selection) || selection < 1 || selection > Math.min(results.length, 10)) {
      console.log('❌ Invalid selection. Please try again.\n');
      continue;
    }

    const selectedLeader = results[parseInt(selection) - 1];
    console.log(`\n✅ Selected leader: ${selectedLeader.name} (${selectedLeader.cardId})`);
    return selectedLeader;
  }
}

// Interactive main deck building
async function buildMainDeck(cards, leader) {
  console.log('\n🃏 STEP 2: Build your Main Deck (50 cards required)');
  console.log('===================================================');
  console.log(`Leader colors: ${leader.colors.map(c => c.color).join(', ')}`);
  console.log('You can only include cards that match your leader\'s colors.\n');

  const mainDeck = [];
  const leaderColors = leader.colors.map(c => c.color);
  const availableCards = cards.filter(card => 
    card.cardType !== 'LEADER' && 
    card.colors.some(color => leaderColors.includes(color.color))
  );

  console.log(`Found ${availableCards.length} cards that match your leader's colors.\n`);

  while (true) {
    const currentTotal = mainDeck.reduce((sum, card) => sum + card.quantity, 0);
    console.log(`\n📊 Current deck: ${currentTotal}/50 cards`);
    
    if (currentTotal >= 50) {
      console.log('✅ Deck is complete!');
      break;
    }

    console.log('\nOptions:');
    console.log('1. Search and add individual cards');
    console.log('2. Bulk import cards (quantityxcardId format)');
    console.log('3. Finish deck building');
    
    const choice = await question('\nEnter your choice (1-3): ');
    
    if (choice === '3') {
      if (currentTotal < 50) {
        console.log(`❌ Deck is incomplete. You need ${50 - currentTotal} more cards.`);
        continue;
      }
      console.log('✅ Deck is complete!');
      break;
    } else if (choice === '2') {
      // Bulk import
      const newMainDeck = await interactiveBulkImport(
        { mainDeck: mainDeck },
        availableCards,
        question
      );
      
      if (newMainDeck) {
        mainDeck.length = 0; // Clear the array
        mainDeck.push(...newMainDeck); // Add all cards from bulk import
      }
      
      continue;
    } else if (choice !== '1') {
      console.log('❌ Invalid choice. Please enter 1, 2, or 3.');
      continue;
    }

    // Individual card search (original functionality)
    const searchTerm = await question(`\nSearch for cards to add (${50 - currentTotal} more needed): `);
    if (!searchTerm.trim()) continue;

    const results = searchCards(availableCards, searchTerm);
    
    if (results.length === 0) {
      console.log('❌ No cards found matching your search. Try again.\n');
      continue;
    }

    console.log(`\nFound ${results.length} card(s):\n`);
    results.slice(0, 10).forEach((card, index) => displayCard(card, index));

    if (results.length > 10) {
      console.log(`... and ${results.length - 10} more results`);
    }

    const selection = await question('\nEnter the number of the card to add (or search again): ');
    
    if (isNaN(selection) || selection < 1 || selection > Math.min(results.length, 10)) {
      console.log('❌ Invalid selection. Please try again.\n');
      continue;
    }

    const selectedCard = results[parseInt(selection) - 1];
    
    // Check if card is already in deck
    const existingCard = mainDeck.find(card => card.cardId === selectedCard.cardId);
    const currentCopies = existingCard ? existingCard.quantity : 0;
    
    // Special exception for OP01-075 - unlimited copies allowed
    const maxAllowed = selectedCard.cardId === 'OP01-075' ? 50 : 4;
    
    if (currentCopies >= maxAllowed) {
      const limitText = selectedCard.cardId === 'OP01-075' ? 'unlimited' : '4';
      console.log(`❌ You already have ${currentCopies} copies of ${selectedCard.name} (maximum ${limitText} allowed)`);
      continue;
    }

    const maxPossible = Math.min(maxAllowed - currentCopies, 50 - currentTotal);
    const quantity = await question(`\nHow many copies of ${selectedCard.name}? (1-${maxPossible}): `);
    
    if (isNaN(quantity) || quantity < 1 || quantity > maxPossible) {
      console.log(`❌ Invalid quantity. Please enter a number between 1 and ${maxPossible}.`);
      continue;
    }

    if (existingCard) {
      existingCard.quantity += parseInt(quantity);
      console.log(`✅ Added ${quantity} more copies of ${selectedCard.name} (total: ${existingCard.quantity})`);
    } else {
      mainDeck.push({
        ...selectedCard,
        quantity: parseInt(quantity)
      });
      console.log(`✅ Added ${quantity} copies of ${selectedCard.name}`);
    }
  }

  return mainDeck;
}

module.exports = {
  selectLeader,
  buildMainDeck
}; 