const express = require('express');
const axios = require('axios');
const effectHandlers = require('../game/effects');
const evaluateCondition = require('../game/conditionEngine');
const { initGameState } = require('../game/initGameState');
const sampleDeck = require('../sampleCards.json');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      card, // optional full card object
      cardId, // optional Strapi lookup fallback
      player1Deck = sampleDeck.slice(0, 50),
      player2Deck = sampleDeck.slice(0, 50)
    } = req.body;

    // Fetch from Strapi if no full card provided
    let cardData = card;
    if (!cardData && cardId) {
      const response = await axios.get(
        `http://localhost:1337/api/cards?filters[cardId][$eq]=${cardId}&populate=*`,
        { headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` } }
      );
      const match = response.data?.data?.[0];
      if (!match) return res.status(404).json({ message: `Card not found with cardId: ${cardId}` });
      
      // Map Strapi data structure to expected simulation format
      cardData = {
        id: match.id,
        cardId: match.cardId,
        name: match.name,
        type: match.type,
        cost: match.cost,
        power: match.power,
        life: match.life,
        rarity: match.rarity,
        effect_description: match.effect_description,
        traits: match.traits?.map(t => t.trait) || [],
        colors: match.colors?.map(c => c.color) || [],
        // Parse effect_logic from Strapi's structure
        effect_logic: match.effect_logic?.map(e => {
          try {
            if (typeof e.effect_data === 'string') {
              return JSON.parse(e.effect_data);
            }
            if (typeof e.effect_data === 'object' && e.effect_data !== null) {
              return e.effect_data;
            }
            console.warn('⚠️ Missing or invalid effect_data:', e);
            return { invalid: true }; // Flag it for debugging
          } catch (err) {
            console.warn(`❌ Failed to parse effect_data: ${err.message}`);
            return { parseError: true };
          }
        }) || []        
      };
    }

    console.log('Effect logic:', JSON.stringify(cardData.effect_logic, null, 2));

    if (!cardData) {
      return res.status(400).json({ message: 'Card data not provided or invalid.' });
    }
    
    // If effect_logic is empty or invalid, provide a useful message
    if (!Array.isArray(cardData.effect_logic) || cardData.effect_logic.length === 0) {
      return res.status(400).json({ 
        message: 'Card effect logic not provided or invalid.',
        card: cardData 
      });
    }

    const gameState = initGameState({ player1Deck, player2Deck });
    const currentPlayer = gameState.turn.currentPlayer;

    const pendingChoices = [];

    console.log()
    console.log(`Running simulation for card: ${cardData.name}`);
    console.log('Effect logic:', JSON.stringify(cardData.effect_logic, null, 2));

    for (const effect of cardData.effect_logic || []) {
      const handler = effectHandlers[effect.action];

      if (!handler) {
        console.warn(`⚠️ No handler found for effect action: "${effect.action}"`);
        gameState.actionHistory.push({
          type: 'unhandledEffect',
          action: effect.action,
          player: currentPlayer,
          timestamp: Date.now()
        });
        continue;
      }

      const shouldRun = evaluateCondition(effect.condition, gameState, currentPlayer);
    
      console.log(`→ Effect: ${effect.action}`);
      console.log(`→ Should run: ${shouldRun}`);
    
      if (!shouldRun) continue;
    
      if (effect.optional) {
        pendingChoices.push({ card: cardData.name, effect });
        gameState.actionHistory.push({
          type: 'optionalEffectPrompt',
          card: cardData.name,
          effect
        });
        continue;
      }
    
      if (handler) {
        handler(gameState, effect, currentPlayer);
        gameState.actionHistory.push({
          type: 'effectApplied',
          card: cardData.name,
          effect,
          player: currentPlayer,
          timestamp: Date.now()
        });
      }
    }    

    res.json({
      message: `Simulated card: ${cardData.name}`,
      result: gameState,
      pendingChoices
    });

  } catch (err) {
    res.status(500).json({
      message: 'Simulation failed',
      error: err.response?.data || err.message
    });
  }
});

module.exports = router;
