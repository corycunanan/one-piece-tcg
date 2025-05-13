// turn.js - Manages turn transitions and effect cleanup

function endTurn(gameState) {
  // Switch player
  gameState.turn.currentPlayer =
    gameState.turn.currentPlayer === 'player1' ? 'player2' : 'player1';

  // Increment turn number
  gameState.turn.number += 1;

  // Clean up expired effects
  cleanUpExpiredEffects(gameState);

  console.log(`🔄 Turn ${gameState.turn.number}: ${gameState.turn.currentPlayer}`);
}

function progressPhase(gs) {
  const current = gs.turn.phase;
  let message = '';

  switch (current) {
    case 'reset':
      resetPhase(gs);
      gs.turn.phase = 'draw';
      message = `🔄 Reset complete. Moving to draw phase.`;
      break;

    case 'draw': {
      const player = gs.turn.currentPlayer;
      const drawn = gs.players[player].deck.shift();
      if (drawn) {
        gs.players[player].hand.push(drawn);
        message = `🃏 ${player} drew a card.`;
      } else {
        message = `🃏 No cards left to draw.`;
      }
      gs.turn.phase = 'main';
      break;
    }

    case 'main':
      message = `⚔️ Entered main phase. Awaiting actions.`;
      break;

    default:
      gs.turn.phase = 'reset';
      message = `🔁 Unknown phase. Resetting.`;
  }

  return message;
}

function cleanUpExpiredEffects(gs) {
  if (!gs.effectSuppression) return;

  gs.effectSuppression = gs.effectSuppression.filter(rule => {
    switch (rule.duration) {
      case 'untilEndOfTurn':
        return gs.turn.currentPlayer !== rule.target;
      case 'untilEndOfOpponentTurn':
        return gs.turn.currentPlayer === rule.target;
      case 'untilEndOfOpponentNextTurn':
        return (gs.turn.number - rule.createdTurn) < 2;
      case 'permanent':
      default:
        return true;
    }
  });
}

function resetPhase(gameState) {
  const current = gameState.turn.currentPlayer;
  const player = gameState.players[current];

  // Ready all board cards
  for (const card of player.board) {
    card.rested = false;
    card.attacksThisTurn = 0;
    if (card.summoningSickness) {
      card.summoningSickness = false;
    }
  }

  // Ready leader
  if (player.leader) {
    player.leader.rested = false;
    player.leader.attacksThisTurn = 0;
  }

  // Ready DON!!
  player.don.active += player.don.rested;
  player.don.rested = 0;

  gameState.actionHistory.push({
    type: 'phaseReset',
    player: current,
    timestamp: Date.now()
  });
}

function advanceTurn(gameState) {
  // Switch player and increment turn
  gameState.turn.currentPlayer =
    gameState.turn.currentPlayer === 'player1' ? 'player2' : 'player1';
  gameState.turn.number += 1;

  // Start new turn with a reset
  gameState.turn.phase = 'reset';
  resetPhase(gameState);
}

module.exports = {
  endTurn,
  progressPhase,
  cleanUpExpiredEffects,
  resetPhase,
  advanceTurn
};