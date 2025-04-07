const express = require('express');
const effectHandlers = require('../game/effectHandlers');

const router = express.Router();

router.post('/', (req, res) => {
  const { effect, apply, cardName } = req.body;

  const gameState = {
    currentPlayer: 'player1',
    player1: {
      hand: [],
      deck: ['Zoro', 'Nami', 'Luffy'],
      don: 0,
      powerBuff: 0,
    },
    player2: {
      hand: [],
      deck: [],
      don: 0,
      powerBuff: 0,
    },
  };

  const handler = effectHandlers[effect.action];

  if (apply && handler) {
    handler(gameState, effect, 'player1');
    return res.json({
      message: `✅ Applied optional effect from ${cardName}`,
      result: gameState,
    });
  }

  res.json({
    message: `⏩ Skipped optional effect from ${cardName}`,
    result: gameState,
  });
});

module.exports = router;
