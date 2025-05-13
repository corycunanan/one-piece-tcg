const express = require('express');
const gameState = require('../game/gameState');
const { initGameState } = require('../game/initGameState');
const axios = require('axios');
const { resetPhase, advanceTurn, progressPhase } = require('../game/turn');
require('dotenv').config();

const router = express.Router();

let currentGameState = null;

// POST /turn/start
router.post('/start', (req, res) => {
  // You can accept decks in the body, or use a default sample
  const { player1Deck, player2Deck } = req.body;
  currentGameState = initGameState({ player1Deck, player2Deck });
  res.json({ message: 'Game started', gameState: currentGameState });
});

// POST /turn/reset
router.post('/reset', (req, res) => {
  resetPhase(gameState);
  res.json({ message: 'Board and DON!! reset', gameState });
});

// POST /turn/advance
router.post('/advance', (req, res) => {
  advanceTurn(gameState);
  res.json({ message: 'Turn advanced', gameState });
});

// POST /turn/next-phase
router.post('/next-phase', (req, res) => {
  if (!currentGameState) {
    return res.status(400).json({ message: 'Game has not been started.' });
  }
  const msg = progressPhase(currentGameState);
  res.json({ message: msg, gameState: currentGameState });
});

// POST /turn/end
router.post('/end', (req, res) => {
  if (!currentGameState) {
    return res.status(400).json({ message: 'Game has not been started.' });
  }
  advanceTurn(currentGameState);
  res.json({
    message: `Turn advanced to ${currentGameState.turn.currentPlayer}`,
    gameState: currentGameState
  });
});

// POST /turn/progress-phase
router.post('/progress-phase', (req, res) => {
  const message = progressPhase(gameState);

  res.json({
    message,
    phase: gameState.turn.phase,
    turn: gameState.turn,
  });
});

// 🔍 Inspect current phase of game state
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