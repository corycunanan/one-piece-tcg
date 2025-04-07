const express = require('express');
const axios = require('axios');
const effectHandlers = require('../game/effectHandlers');
const evaluateCondition = require('../game/conditionEngine');
const isSuppressed = require('../game/suppressionChecker');
const gameState = require('../game/gameState');

const router = express.Router();

router.post('/', async (req, res) => {
  const { cardId } = req.body;
  const player = gameState.player1;

  try {
    console.log(`🎯 Trying to play card ID: ${cardId}`);

    // Validate card is in hand
    if (!player.hand.includes(cardId)) {
      return res.status(400).json({ message: `Card ID ${cardId} is not in player1's hand.` });
    }

    // Fetch card from Strapi
    const response = await axios.get(
        `http://localhost:1337/api/cards/${cardId}?populate=*&publicationState=preview`,
        {
            headers: {
                Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },
        }
    );      

    const cardData = response.data?.data;
    if (!cardData) {
      return res.status(404).json({ message: `Card with ID ${cardId} not found.` });
    }

    const card = cardData.attributes;
    const cost = card.cost || 0;

    // DON!! check
    if (cost > player.don.active) {
      return res.status(400).json({
        message: `Not enough DON!! to play ${card.name}. Requires ${cost}, but only ${player.don.active} available.`,
      });
    }

    // Subtract DON!!
    const spent = Math.min(cost, player.don.active);
    player.don.active -= spent;
    player.don.rested += spent;

    // Move card from hand to field
    player.hand = player.hand.filter(id => id !== cardId);
    player.field.push(cardId);

    const pendingChoices = [];

    for (const effect of card.effect_logic || []) {
      if (!effect.trigger || effect.trigger === 'onPlay' || effect.trigger.startsWith('Activate')) {
        if (isSuppressed(effect, 'player1', gameState)) {
          console.log(`🚫 Effect suppressed: ${effect.trigger}`);
          continue;
        }

        const shouldRun = evaluateCondition(effect.condition, gameState, 'player1');
        if (!shouldRun) {
          console.log(`🛑 Skipping effect due to failed condition.`);
          continue;
        }

        if (effect.condition?.type === 'trashCard') {
          const amount = effect.condition.amount || 1;
          const trashed = player.hand.splice(0, amount);
          console.log(`🗑️ Trashed cards:`, trashed);
        }

        if (effect.optional) {
          pendingChoices.push({ card: card.name, effect });
          continue;
        }

        const handler = effectHandlers[effect.action];
        if (handler) {
          handler(gameState, effect, 'player1');
          console.log(`✨ Ran effect: ${effect.action}`);
        } else {
          console.warn(`⚠️ No handler for effect: ${effect.action}`);
        }
      }
    }

    res.json({
      message: `✅ Played card: ${card.name}`,
      result: gameState,
      pendingChoices,
    });

  } catch (err) {
    console.error('❌ Play error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to play card',
      error: err.response?.data?.error?.message || err.message,
    });
  }
});

module.exports = router;