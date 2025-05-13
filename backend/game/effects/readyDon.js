module.exports = (gs, eff, player) => {
    const p = gs.players[player];
    const toReady = Math.min(p.don.rested, eff.amount || 1);
    p.don.rested -= toReady;
    p.don.active += toReady;
    gs.actionHistory.push({
      type: 'readyDon',
      amount: toReady,
      player,
      timestamp: Date.now()
    });
  };
  