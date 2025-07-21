const mongoose = require('mongoose');

// Schema for individual cards in a deck
const DeckCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true },
  name: { type: String, required: true },
  cardType: { 
    type: String, 
    enum: ['LEADER', 'CHARACTER', 'EVENT', 'STAGE'], 
    required: true 
  },
  cost: Number,
  power: Number,
  life: Number,
  counter: Number,
  colors: [{ color: String }],
  traits: [{ trait: String }],
  attributes: [{ attribute: String }],
  effect_description: String,
  trigger_description: String,
  rarity: String,
  images: [{
    image_url: String,
    label: String,
    artist: String,
    is_default: Boolean
  }],
  set: [{
    set: String,
    is_default: Boolean
  }],
  keywords: [String],
  quantity: { type: Number, min: 1, max: 4, default: 1 }
});

// Schema for the leader card
const LeaderCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true },
  name: { type: String, required: true },
  cardType: { type: String, enum: ['LEADER'], required: true },
  cost: Number,
  power: Number,
  life: { type: Number, required: true },
  counter: Number,
  colors: [{ color: String }],
  traits: [{ trait: String }],
  attributes: [{ attribute: String }],
  effect_description: String,
  trigger_description: String,
  rarity: String,
  images: [{
    image_url: String,
    label: String,
    artist: String,
    is_default: Boolean
  }],
  set: [{
    set: String,
    is_default: Boolean
  }],
  keywords: [String]
});

const DeckSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100 
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500 
  },
  leader: { 
    type: LeaderCardSchema, 
    required: true 
  },
  mainDeck: { 
    type: [DeckCardSchema], 
    required: true,
    validate: {
      validator: function(cards) {
        // Must have exactly 50 cards
        const totalCards = cards.reduce((sum, card) => sum + card.quantity, 0);
        return totalCards === 50;
      },
      message: 'Main deck must contain exactly 50 cards'
    }
  },
  isValid: { 
    type: Boolean, 
    default: false 
  },
  validationErrors: [{ type: String }],
  createdBy: { 
    type: String, 
    default: 'admin' 
  },
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ type: String }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save middleware to validate deck and update timestamps
DeckSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validate deck structure
  const validation = this.validateDeck();
  this.isValid = validation.isValid;
  this.validationErrors = validation.errors;
  
  next();
});

// Instance method to validate deck according to One Piece TCG rules
DeckSchema.methods.validateDeck = function() {
  const errors = [];
  
  // Check if leader exists and is correct type
  if (!this.leader) {
    errors.push('Deck must have exactly one leader card');
  } else if (this.leader.cardType !== 'LEADER') {
    errors.push('Leader card must be of type LEADER');
  }
  
  // Check main deck size
  const totalCards = this.mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  if (totalCards !== 50) {
    errors.push(`Main deck must have exactly 50 cards, found ${totalCards}`);
  }
  
  // Check card type restrictions
  const invalidCards = this.mainDeck.filter(card => 
    !['CHARACTER', 'EVENT', 'STAGE'].includes(card.cardType)
  );
  if (invalidCards.length > 0) {
    errors.push('Main deck can only contain CHARACTER, EVENT, or STAGE cards');
  }
  
  // Check copy limits
  const cardCounts = {};
  this.mainDeck.forEach(card => {
    cardCounts[card.cardId] = (cardCounts[card.cardId] || 0) + card.quantity;
  });
  
  for (const [cardId, count] of Object.entries(cardCounts)) {
    if (count > 4) {
      const card = this.mainDeck.find(c => c.cardId === cardId);
      errors.push(`${card?.name || cardId} has ${count} copies (maximum 4 allowed)`);
    }
  }
  
  // Check color matching with leader
  if (this.leader && this.mainDeck.length > 0) {
    const leaderColors = this.leader.colors.map(c => c.color);
    const unmatchedCards = this.mainDeck.filter(card => {
      const cardColors = card.colors.map(c => c.color);
      return !cardColors.some(color => leaderColors.includes(color));
    });
    
    if (unmatchedCards.length > 0) {
      errors.push('All cards in the deck must match at least one color of the leader card');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Instance method to get deck statistics
DeckSchema.methods.getStats = function() {
  const totalCards = this.mainDeck.reduce((sum, card) => sum + card.quantity, 0);
  
  const cardTypeCounts = this.mainDeck.reduce((counts, card) => {
    counts[card.cardType] = (counts[card.cardType] || 0) + card.quantity;
    return counts;
  }, {});
  
  const colorCounts = this.mainDeck.reduce((counts, card) => {
    card.colors.forEach(color => {
      counts[color.color] = (counts[color.color] || 0) + card.quantity;
    });
    return counts;
  }, {});
  
  const costDistribution = this.mainDeck.reduce((distribution, card) => {
    const cost = card.cost || 0;
    distribution[cost] = (distribution[cost] || 0) + card.quantity;
    return distribution;
  }, {});
  
  return {
    totalCards,
    cardTypeCounts,
    colorCounts,
    costDistribution,
    leader: this.leader
  };
};

// Static method to create a new deck
DeckSchema.statics.createDeck = function(deckData) {
  const deck = new this(deckData);
  const validation = deck.validateDeck();
  deck.isValid = validation.isValid;
  deck.validationErrors = validation.errors;
  return deck;
};

module.exports = mongoose.model('Deck', DeckSchema); 