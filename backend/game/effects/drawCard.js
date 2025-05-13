module.exports = (gs, effect, player) => {
    const drawn = gs.players[player].deck.splice(0, effect.amount || 1);
    gs.players[player].hand.push(...drawn);
    gs.actionHistory.push({
      type: 'drawCard',
      amount: drawn.length,
      cards: drawn,
      player,
      timestamp: Date.now()
    });
  };
  