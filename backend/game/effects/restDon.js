module.exports = (gs, eff, player) => {
    const p = gs.players[player];
    const toRest = Math.min(p.don.active, eff.amount || 1);
    p.don.active -= toRest;
    p.don.rested += toRest;
    gs.actionHistory.push({
      type: 'restDon',
      amount: toRest,
      player,
      timestamp: Date.now()
    });
  };
  