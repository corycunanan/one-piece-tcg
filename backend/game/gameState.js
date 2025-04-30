const gameState = {
  turn: {
    number: 1,
    currentPlayer: 'player1',
    phase: 'reset', // phases: reset, draw, main, end
  },

  players: {
    player1: {
      life: 5,
      hand: [],
      board: [],
      deck: [],
      trash: [],
      don: {
        total: 0,
        active: 0,
        rested: 0
      },
      powerBuff: 0,
      leader: null
    },
    player2: {
      life: 5,
      hand: [],
      board: [],
      deck: [],
      trash: [],
      don: {
        total: 0,
        active: 0,
        rested: 0
      },
      powerBuff: 0,
      leader: null
    }
  },

  effectSuppression: [], // e.g. [{ source: 'cardId', effectType: 'onPlay', duration: 'turn' }]
  effectStack: [],
  actionHistory: [],
  pendingTriggers: [],
};

module.exports = gameState;
