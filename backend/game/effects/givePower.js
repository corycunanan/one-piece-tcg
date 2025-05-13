module.exports = (gs, effect, player) => {
    const amount = effect.amount || 1000;
    gs.players[player].powerBuff += amount;
  
    gs.actionHistory.push({
      type: 'givePower',
      amount,
      player,
      timestamp: Date.now()
    });
};