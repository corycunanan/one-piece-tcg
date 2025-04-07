function isSuppressed(effect, player, gameState) {
    return gameState.effectSuppression.some((entry) => {
      return (
        entry.target === player &&
        entry.effect === effect.trigger &&
        (entry.expiresOnTurn === undefined || entry.expiresOnTurn >= gameState.turn.number)
      );
    });
  }
  
module.exports = isSuppressed;  