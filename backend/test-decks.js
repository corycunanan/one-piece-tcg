const axios = require('axios');

const API_BASE = 'http://localhost:5001';

// Sample leader card data
const sampleLeader = {
  cardId: "ST01-001",
  name: "Monkey D. Luffy",
  cardType: "LEADER",
  cost: 0,
  power: 0,
  life: 4,
  counter: 0,
  colors: [{ color: "Red" }],
  traits: [{ trait: "Straw Hat Crew" }],
  attributes: [],
  effect_description: "This leader can attack the turn it's played.",
  trigger_description: "",
  rarity: "L",
  images: [{
    image_url: "https://example.com/luffy.jpg",
    label: "Default",
    artist: "Unknown",
    is_default: true
  }],
  set: [{
    set: "Straw Hat Crew",
    is_default: true
  }]
};

// Sample main deck cards
const sampleCards = [
  {
    cardId: "ST01-002",
    name: "Zoro",
    cardType: "CHARACTER",
    cost: 2,
    power: 2000,
    life: 0,
    counter: 0,
    colors: [{ color: "Red" }],
    traits: [{ trait: "Straw Hat Crew" }],
    attributes: [],
    effect_description: "When this card attacks, draw 1 card.",
    trigger_description: "",
    rarity: "C",
    images: [{
      image_url: "https://example.com/zoro.jpg",
      label: "Default",
      artist: "Unknown",
      is_default: true
    }],
    set: [{
      set: "Straw Hat Crew",
      is_default: true
    }],
    quantity: 4
  },
  {
    cardId: "ST01-003",
    name: "Sanji",
    cardType: "CHARACTER",
    cost: 3,
    power: 3000,
    life: 0,
    counter: 0,
    colors: [{ color: "Red" }],
    traits: [{ trait: "Straw Hat Crew" }],
    attributes: [],
    effect_description: "When this card attacks, your opponent discards 1 card.",
    trigger_description: "",
    rarity: "C",
    images: [{
      image_url: "https://example.com/sanji.jpg",
      label: "Default",
      artist: "Unknown",
      is_default: true
    }],
    set: [{
      set: "Straw Hat Crew",
      is_default: true
    }],
    quantity: 4
  }
];

// Create a sample deck with 50 cards (simplified for testing)
const sampleDeck = {
  name: "Test Straw Hat Deck",
  description: "A test deck for the Straw Hat Crew",
  leader: sampleLeader,
  mainDeck: [
    ...sampleCards,
    // Add more cards to reach 50 total
    ...Array.from({ length: 42 }, (_, i) => ({
      ...sampleCards[0],
      cardId: `ST01-00${4 + i}`,
      name: `Test Card ${i + 1}`,
      quantity: 1
    }))
  ],
  tags: ["test", "straw-hat"],
  isPublic: true
};

async function testDeckAPI() {
  console.log('🧪 Testing Deck API...\n');

  try {
    // Test 1: Create a deck
    console.log('1. Creating a test deck...');
    const createResponse = await axios.post(`${API_BASE}/decks`, sampleDeck);
    const createdDeck = createResponse.data.deck;
    console.log(`✅ Deck created with ID: ${createdDeck._id}`);
    console.log(`   Name: ${createdDeck.name}`);
    console.log(`   Valid: ${createdDeck.isValid}`);
    console.log(`   Cards: ${createdDeck.mainDeck.reduce((sum, card) => sum + card.quantity, 0)}/50\n`);

    // Test 2: Get all decks
    console.log('2. Fetching all decks...');
    const listResponse = await axios.get(`${API_BASE}/decks`);
    console.log(`✅ Found ${listResponse.data.decks.length} decks\n`);

    // Test 3: Get specific deck
    console.log('3. Fetching specific deck...');
    const getResponse = await axios.get(`${API_BASE}/decks/${createdDeck._id}`);
    console.log(`✅ Retrieved deck: ${getResponse.data.name}\n`);

    // Test 4: Validate deck
    console.log('4. Validating deck...');
    const validateResponse = await axios.post(`${API_BASE}/decks/${createdDeck._id}/validate`);
    console.log(`✅ Validation result: ${validateResponse.data.isValid ? 'Valid' : 'Invalid'}`);
    if (validateResponse.data.errors.length > 0) {
      console.log(`   Errors: ${validateResponse.data.errors.join(', ')}`);
    }
    console.log(`   Stats: ${JSON.stringify(validateResponse.data.stats, null, 2)}\n`);

    // Test 5: Get deck statistics
    console.log('5. Getting deck statistics...');
    const statsResponse = await axios.get(`${API_BASE}/decks/${createdDeck._id}/stats`);
    console.log(`✅ Deck stats: ${JSON.stringify(statsResponse.data, null, 2)}\n`);

    // Test 6: Update deck
    console.log('6. Updating deck...');
    const updateResponse = await axios.put(`${API_BASE}/decks/${createdDeck._id}`, {
      name: "Updated Test Deck",
      description: "This deck has been updated"
    });
    console.log(`✅ Deck updated: ${updateResponse.data.deck.name}\n`);

    // Test 7: Duplicate deck
    console.log('7. Duplicating deck...');
    const duplicateResponse = await axios.post(`${API_BASE}/decks/${createdDeck._id}/duplicate`, {
      newName: "Copied Test Deck"
    });
    console.log(`✅ Deck duplicated: ${duplicateResponse.data.deck.name}\n`);

    // Test 8: Get overview statistics
    console.log('8. Getting overview statistics...');
    const overviewResponse = await axios.get(`${API_BASE}/decks/stats/overview`);
    console.log(`✅ Overview stats: ${JSON.stringify(overviewResponse.data, null, 2)}\n`);

    // Test 9: Delete the original deck
    console.log('9. Deleting test deck...');
    await axios.delete(`${API_BASE}/decks/${createdDeck._id}`);
    console.log(`✅ Deck deleted successfully\n`);

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testDeckAPI(); 