const canAttack = require('../utils/canAttack');

module.exports = (gs, effect, player) => {
  const opponent = player === 'player1' ? 'player2' : 'player1';
  const attackerId = effect.attacker || 'leader';
  const targetId = effect.target || 'leader';

  const result = canAttack({ attacker: attackerId, target: targetId, gameState: gs, player });

    if (!result.allowed) {
        gs.actionHistory.push({
            type: 'attackBlocked',
            reason: result.reason,
            attacker: attackerId,
            target: targetId,
            player,
            timestamp: Date.now()
        });
        return;
    }

    // ✅ Rest attacker (whether it's a board character or the leader)
    if (attackerId === 'leader') {
        gs.players[player].leader.rested = true;
    } else {
        const attacker = gs.players[player].board.find(c => c.id === attackerId);
        if (attacker) attacker.rested = true;
    }

    // Check if card already attacked this turn
    if (attackerId === 'leader') {
        const leader = gs.players[player].leader;
        if (leader.attacksThisTurn >= 1 && !leader.canAttackMultipleTimes) {
            return { error: 'Leader has already attacked this turn.' };
        }
    } else {
        const attacker = gs.players[player].board.find(c => c.id === attackerId);
        if (!attacker) return { error: 'Attacker not found on board.' };

        if (attacker.attacksThisTurn >= 1 && !attacker.canAttackMultipleTimes) {
            return { error: 'This character has already attacked this turn.' };
        }
    }
  
    gs.actionHistory.push({
        type: 'attack',
        attacker: attackerId,
        target: targetId,
        player,
        opponent,
        timestamp: Date.now()
    });

    gs.effectStack.push({
        source: attackerId,
        target: targetId,
        player,
        type: 'attack',
        interruptWindow: true
    });
};
