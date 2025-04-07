const axios = require('axios');

async function hasAvailableActions(gs, player) {
  const hand = gs[player].hand;
  const don = gs[player].don.active;

  console.log(`📦 ${player}'s hand:`, hand);

  for (const cardName of hand) {
    try {
      const response = await axios.get(
        `http://localhost:1337/api/cards?filters[name][$eq]=${encodeURIComponent(cardName)}&populate=*`,
        {
          headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` },
        }
      );

      const cardData = response.data?.data?.[0];
      const cardCost = cardData?.attributes?.cost || 0;

      console.log(`🔍 Checking ${cardName}: cost ${cardCost}, available DON!! ${don}`);
      if (cardCost <= don) {
        return true;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch card cost for: ${cardName}`, error.message);
    }
  }

  return false;
}

module.exports = hasAvailableActions;