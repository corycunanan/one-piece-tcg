const cloneDeep = require('lodash.clonedeep');

// Utility: shuffle array (Fisher-Yates)
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Initialize game state from 2 player decks
function initGameState({ player1Deck, player2Deck }) {
  return {
    turn: {
      number: 1,
      currentPlayer: 'player1',
      phase: 'reset'
    },
    players: {
      player1: buildPlayerState(player1Deck),
      player2: buildPlayerState(player2Deck)
    },
    effectSuppression: [],
    effectStack: [],
    actionHistory: [],
    pendingTriggers: []
  };
}

// Per-player state generator
function buildPlayerState(deck) {
  const clonedDeck = cloneDeep(deck); // clone to avoid mutation
  const shuffledDeck = shuffle(clonedDeck);

  const leaderCard = shuffledDeck.find(card => card.type === 'Leader');
  const rest = shuffledDeck.filter(card => card !== leaderCard);
  const hand = rest.slice(0, 5).map(setInitialCardFlags);
  const deckRest = rest.slice(5).map(setInitialCardFlags);

  const leaderWithFlags = {
    ...leaderCard,
    rested: false,
    attacksThisTurn: 0,
    canAttackMultipleTimes: false
  };

  return {
    life: leaderCard?.life || 5,
    hand,
    board: [],
    deck: deckRest,
    trash: [],
    don: {
      total: 0,
      active: 0,
      rested: 0
    },
    powerBuff: 0,
    leader: leaderWithFlags
  };
}

// Adds flags for cards
function setInitialCardFlags(card) {
  return {
    ...card,
    rested: false,
    attacksThisTurn: 0,
    canAttackMultipleTimes: false,
    summoningSickness: true
  };
}

module.exports = { initGameState };