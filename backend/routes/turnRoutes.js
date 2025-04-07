const express = require('express');
const router = express.Router();
const { endTurn, progressPhase } = require('../game/turn');
const gameState = require('../game/gameState');
const axios = require('axios');
const hasAvailableActions = require('../game/hasAvailableActions');

require('dotenv').config();

router.post('/end-turn', async (req, res) => {
    endTurn(gameState);

    // Auto-progress through reset → draw → action
    const resetMsg = progressPhase(gameState);
    const drawMsg = progressPhase(gameState);
    const actionMsg = progressPhase(gameState);

    let autoEndMsg = null;
    const currentPlayer = gameState.turn.currentPlayer;

    const hasActions = await hasAvailableActions(gameState, currentPlayer);

    if (!hasActions) {
        endTurn(gameState);
        const reset2 = progressPhase(gameState);
        const draw2 = progressPhase(gameState);
        const action2 = progressPhase(gameState);
        autoEndMsg = `🔚 No valid actions for ${currentPlayer}. Turn auto-ended.`;
    }

    res.json({
        message: `Turn ended. It is now ${gameState.turn.currentPlayer}'s turn.`,
        phaseMessages: [resetMsg, drawMsg, actionMsg],
        autoEndMsg,
        turn: gameState.turn,
    });
});

router.post('/progress-phase', (req, res) => {
  const message = progressPhase(gameState);

  res.json({
    message,
    phase: gameState.turn.phase,
    turn: gameState.turn,
  });
});

router.get('/phase/status', async (req, res) => {
  
    console.log('🖐 player2 hand before enrichment:', gameState.player2.hand);

    async function enrichCards(cardIds) {
        const detailedCards = [];
      
        for (const id of cardIds) {
          try {
            console.log('🖐️ Enriching card from hand with ID:', id);
      
            const response = await axios.get(
              `http://localhost:1337/api/cards/${id}?populate=*`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
                },
              }
            );
      
            const card = response.data?.data;
            if (card) {
              detailedCards.push({ id, ...card.attributes });
            } else {
              detailedCards.push({ id, error: 'Not found in Strapi' });
            }
          } catch (error) {
            console.error(`❌ Failed to enrich card ID ${id}:`, error.message);
            detailedCards.push({ id, error: 'Fetch failed' });
          }
        }
      
        return detailedCards;
    }

    console.log('🖐️ Enriching cards for hand:', gameState.player1.hand);
    
    const [p1Hand, p2Hand] = await Promise.all([
        enrichCards(gameState.player1.hand),
        enrichCards(gameState.player2.hand),
    ]);

    res.json({
        turn: gameState.turn,
        player1: {
            hand: p1Hand,
            deck: gameState.player1.deck,
            don: gameState.player1.don,
        },
        player2: {
            hand: p2Hand,
            deck: gameState.player2.deck,
            don: gameState.player2.don,
        }
    });
});

// 🔍 Debug any card by ID
router.get('/card/debug/:id', async (req, res) => {
    const cardId = req.params.id;

    try {
    const response = await axios.get(
        `http://localhost:1337/api/cards/${cardId}?populate=*`,
        {
        headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        }
    );

    if (response.data?.data) {
        res.json({ result: response.data.data });
    } else {
        res.status(404).json({ error: `Card with ID ${cardId} not found.` });
    }

    } catch (error) {
    console.error(`❌ Debug error for card ID ${cardId}:`, error.message);
    res.status(500).json({ error: error.message });
    }
});

module.exports = router;