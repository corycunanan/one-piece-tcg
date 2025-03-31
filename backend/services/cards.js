const axios = require('axios');

async function getCardById(cardId) {
  try {
    const response = await axios.get(`http://localhost:1337/api/cards/${cardId}?populate=deep`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch card:', error.message);
    return null;
  }
}

module.exports = { getCardById };
