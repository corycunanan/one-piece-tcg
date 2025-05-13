module.exports = (gs, effect, player) => {
    gs.players[player].powerBuff -= effect.amount || 1000;
    gs.actionHistory.push({
      type: 'reducePower',
      amount: effect.amount || 1000,
      player,
      timestamp: Date.now()
    });
  };
  