module.exports = (gs, effect, player) => {
    gs.players[player].don.total += effect.amount || 1;
    gs.actionHistory.push({
      type: 'attachDon',
      amount: effect.amount || 1,
      player,
      timestamp: Date.now()
    });
  };
  