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
            const player = gs.turn.currentPlayer;
            gs[player].don.active = gs[player].don.total;
            gs[player].don.rested = 0;
            gs.turn.phase = 'draw';
            message = `🔄 ${player}'s board reset. DON!! refreshed.`;
            break;

        case 'draw':
            const drawn = gs[gs.turn.currentPlayer].deck.shift();
            if (drawn) {
                gs[gs.turn.currentPlayer].hand.push(drawn);
                message = `🃏 Drew card: ${drawn}`;
            } else {
            message = `🃏 No cards left to draw.`;
            }
            gs.turn.phase = 'action';
            break;

        case 'action':
            message = `✅ Entered action phase. Awaiting player action.`;
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
  
  
  module.exports = {
    endTurn,
    cleanUpExpiredEffects,
    progressPhase
  };