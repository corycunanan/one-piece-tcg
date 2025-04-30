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
  const shuffledDeck = shuffle(deck);
  const leaderCard = shuffledDeck.find(card => card.type === 'Leader');
  const rest = shuffledDeck.filter(card => card !== leaderCard);
  const hand = rest.slice(0, 5);
  const deckRest = rest.slice(5);

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
    leader: leaderCard || null
  };
}

module.exports = { initGameState };
