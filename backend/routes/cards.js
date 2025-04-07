const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const router = express.Router();

router.get('/load', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'sampleCards.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const cards = JSON.parse(data);

    for (const card of cards) {
      await axios.post('http://localhost:1337/api/cards', {
        data: card,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`
        }
      });
    }

    res.json({ message: 'Cards loaded successfully!', count: cards.length });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load cards',
      error: error.response?.data || error.message,
    });
  }
});

router.get('/export', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:1337/api/cards?populate=*', {
      headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
    });

    console.log('🧪 First card data:', JSON.stringify(response.data.data[0], null, 2));

    const cards = response.data.data.map((card) => {
      return {
        id: card.id,
        name: card.name,
        type: card.type,
        cost: card.cost,
        power: card.power,
        life: card.life,
        rarity: card.rarity,
        effect_trigger: card.effect_trigger,
        effect_description: card.effect_description,
        set_id: card.set_id,
        image_url: card.image_url,
        documentId: card.documentId,
        traits: card.traits?.map((t) => ({ trait_name: t.trait_name })) || [],
        colors: card.colors?.map((c) => ({ color: c.color })) || [],
        effect_logic: card.effect_logic?.map((e) => ({
          trigger: e.trigger,
          action: e.action,
          target: e.target,
          amount: e.amount,
          optional: e.optional,
          condition: e.condition,
          timing: e.timing,
          priority: e.priority,
          filter: e.filter,
          duration: e.duration
        })) || [],
      };
    });    

    const filePath = path.join(__dirname, '..', 'exportedCards.json');
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), 'utf-8');

    res.json({
      message: 'Cards exported successfully!',
      count: cards.length,
      cards // ✅ Include the actual cards here!
    });
    } catch (error) {
    res.status(500).json({
      message: 'Failed to export cards',
      error: error.message,
      cards
    });
  }
});

module.exports = router;
