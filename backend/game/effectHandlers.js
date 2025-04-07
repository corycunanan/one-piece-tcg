const effectHandlers = {
    drawCard: (gs, effect, player) => {
      const drawn = gs[player].deck.splice(0, effect.amount || 1);
      gs[player].hand.push(...drawn);
    },
  
    attachDon: (gs, effect, player) => {
      gs[player].don += effect.amount || 1;
    },
  
    givePower: (gs, effect, player) => {
      gs[player].powerBuff += effect.amount || 1000;
    },
  
    reducePower: (gs, effect, player) => {
      gs[player].powerBuff -= effect.amount || 1000;
    },
  
    donMinus: (gs, eff, player) => {
        const p = gs[player];
        p.don.active = Math.max(0, p.don.active - (eff.amount || 1));
    },
      
    restDon: (gs, eff, player) => {
        const p = gs[player];
        const toRest = Math.min(p.don.active, eff.amount || 1);
        p.don.active -= toRest;
        p.don.rested += toRest;
    },

    readyDon: (gs, eff, player) => {
        const p = gs[player];
        const toReady = Math.min(p.don.rested, eff.amount || 1);
        p.don.rested -= toReady;
        p.don.active += toReady;
    },
    
    donMinus: (gs, eff, player) => {
        const p = gs[player];
        const amount = eff.amount || 1;
      
        const spent = Math.min(amount, p.don.active);
        p.don.active -= spent;
      
        console.log(`💸 donMinus: -${spent} DON!! from ${player}`);
    },
    
    negateEffects: (gs, eff, player) => {
        const opponent = player === 'player1' ? 'player2' : 'player1';
      
        if (!gs.effectSuppression) gs.effectSuppression = [];
      
        gs.effectSuppression.push({
          target: opponent,
          filter: eff.filter,
          duration: eff.duration || 'untilEndOfTurn',
          createdTurn: gs.turn?.number || 0 // ✅ Add this line
        });
      
        console.log(`🔕 ${opponent}'s ${eff.filter?.effectType || 'effects'} are suppressed.`);
      }
      
      
};

module.exports = effectHandlers;