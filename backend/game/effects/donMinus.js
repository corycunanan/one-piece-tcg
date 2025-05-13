module.exports = (gs, eff, player) => {
    const p = gs.players[player];
    const amount = eff.amount || 1;
    const spent = Math.min(amount, p.don.active);
    p.don.active -= spent;
    gs.actionHistory.push({
      type: 'donMinus',
      amount: spent,
      player,
      timestamp: Date.now()
    });
  };
  