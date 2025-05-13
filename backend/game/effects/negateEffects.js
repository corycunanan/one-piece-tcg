module.exports = (gs, effect, player) => {
    const opponent = player === 'player1' ? 'player2' : 'player1';
    if (!gs.effectSuppression) gs.effectSuppression = [];
  
    const suppression = {
      target: opponent,
      filter: effect.filter,
      duration: effect.duration || 'untilEndOfTurn',
      createdTurn: gs.turn?.number || 0
    };
  
    gs.effectSuppression.push(suppression);
  
    gs.actionHistory.push({
      type: 'negateEffects',
      effectType: effect.filter?.effectType,
      target: opponent,
      duration: suppression.duration,
      player,
      timestamp: Date.now()
    });
  };
  