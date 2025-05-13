module.exports = function canAttack({ attacker, target, gameState, player }) {
  const opponent = player === 'player1' ? 'player2' : 'player1';

  // 1. Turn must be ≥3
  if (gameState.turn.number < 3) {
    return { allowed: false, reason: 'Cannot attack until turn 3' };
  }

  // 2. Find attacker
  const atk = attacker === 'leader'
    ? gameState.players[player].leader
    : gameState.players[player].board.find(c => c.id === attacker);
  if (!atk) return { allowed: false, reason: 'Attacker not found' };

  // 3. Find target
  const tgt = target === 'leader'
    ? gameState.players[opponent].leader
    : gameState.players[opponent].board.find(c => c.id === target);
  if (!tgt) return { allowed: false, reason: 'Target not found' };

  // 4. Only Characters or Leaders
  if (!['Character','Leader'].includes(tgt.type)) {
    return { allowed: false, reason: 'Cannot attack non-character targets' };
  }

  // 5. Attacker must not be rested
  if (atk.rested) {
    return { allowed: false, reason: 'Attacker is rested' };
  }

  // 6. Target must be rested (unless it’s the leader)
  if (tgt.type === 'Character' && !tgt.rested) {
    return { allowed: false, reason: 'Target character is not rested' };
  }

  // 7. Power check
  if (atk.power < tgt.power) {
    return { allowed: false, reason: 'Attacker power too low' };
  }

  return { allowed: true };
};