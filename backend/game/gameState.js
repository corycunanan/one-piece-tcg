const gameState = {
    turn: {
        number: 1,
        currentPlayer: 'player1',
        phase: 'reset' // Options: reset → draw → action
    },
    player1: {
      hand: [15],
      field: [],
      deck: [5, 16], // Zoro, Jet Pistol
      don: {
        total: 10,
        active: 1,
        rested: 0
      },
      powerBuff: 0
    },
    player2: {
      hand: [22],
      field: [],
      deck: [],
      don: {
        total: 10,
        active: 0,
        rested: 0
      },
      powerBuff: 0
    },
    effectSuppression: []
  };
  
  module.exports = gameState;