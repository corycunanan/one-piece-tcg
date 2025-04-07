const express = require('express');
const axios = require('axios');
const effectHandlers = require('../game/effectHandlers');
const evaluateCondition = require('../game/conditionEngine');

const router = express.Router();

router.get('/by-document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const response = await axios.get(
      `http://localhost:1337/api/cards?filters[documentId][$eq]=${documentId}&populate=*`,
      { headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } }
    );

    const match = response.data?.data?.[0];

    if (!match) return res.status(404).json({ message: 'Card not found for that documentId' });

    const card = { ...match, name: match.name || 'Unknown Card' };

    const gameState = {
      currentPlayer: 'player1',
      player1: { hand: [], deck: ['Zoro', 'Nami', 'Luffy'], don: 0, powerBuff: 0 },
      player2: { hand: [], deck: [], don: 0, powerBuff: 0 },
    };

    const pendingChoices = [];

    for (const effect of card.effect_logic || []) {
      const handler = effectHandlers[effect.action];
      const shouldRun = evaluateCondition(effect.condition, gameState, 'player1');

      if (!shouldRun) continue;
      if (effect.optional) {
        pendingChoices.push({ card: card.name, effect });
        continue;
      }

      if (handler) handler(gameState, effect, 'player1');
    }

    res.json({
      message: `Simulated card: ${card.name}`,
      result: gameState,
      pendingChoices,
    });

  } catch (err) {
    res.status(500).json({
      message: 'Simulation failed',
      error: err.response?.data || err.message,
    });
  }
});

module.exports = router;
