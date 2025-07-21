// Deck System for One Piece TCG
// A deck consists of 1 Leader card and 50 main deck cards (Character, Event, or Stage)

export interface Card {
  cardId: string;
  name: string;
  cardType: 'LEADER' | 'CHARACTER' | 'EVENT' | 'STAGE';
  cost?: number;
  power?: number;
  life?: number;
  counter?: number;
  colors: Array<{ color: string }>;
  traits: Array<{ trait: string }>;
  attributes?: Array<{ attribute: string }>;
  effect_description?: string;
  trigger_description?: string;
  rarity: string;
  images: Array<{
    image_url: string;
    label: string;
    artist?: string;
    is_default: boolean;
  }>;
  set: Array<{
    set: string;
    is_default: boolean;
  }>;
  variantCount?: number;
  keywords?: string[];
}

export interface DeckCard {
  card: Card;
  quantity: number; // 1-4 copies allowed per card
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  leader: Card;
  mainDeck: DeckCard[];
  createdAt: Date;
  updatedAt: Date;
  isValid: boolean;
  validationErrors: string[];
}

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Deck validation rules
export class DeckValidator {
  private static readonly MAX_DECK_SIZE = 50;
  private static readonly MAX_COPIES_PER_CARD = 4;
  private static readonly MIN_DECK_SIZE = 50;

  /**
   * Validates a deck according to One Piece TCG rules
   */
  static validateDeck(deck: Deck): DeckValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if leader exists
    if (!deck.leader) {
      errors.push('Deck must have exactly one leader card');
    } else if (deck.leader.cardType !== 'LEADER') {
      errors.push('Leader card must be of type LEADER');
    }

    // Check main deck size
    const totalCards = deck.mainDeck.reduce((sum, deckCard) => sum + deckCard.quantity, 0);
    
    if (totalCards !== this.MAX_DECK_SIZE) {
      errors.push(`Main deck must have exactly ${this.MAX_DECK_SIZE} cards, found ${totalCards}`);
    }

    // Check card type restrictions
    const invalidCards = deck.mainDeck.filter(deckCard => 
      !['CHARACTER', 'EVENT', 'STAGE'].includes(deckCard.card.cardType)
    );
    
    if (invalidCards.length > 0) {
      errors.push('Main deck can only contain CHARACTER, EVENT, or STAGE cards');
    }

    // Check copy limits
    const cardCounts = new Map<string, number>();
    deck.mainDeck.forEach(deckCard => {
      const currentCount = cardCounts.get(deckCard.card.cardId) || 0;
      cardCounts.set(deckCard.card.cardId, currentCount + deckCard.quantity);
    });

    for (const [cardId, count] of Array.from(cardCounts)) {
      if (count > this.MAX_COPIES_PER_CARD) {
        const card = deck.mainDeck.find(dc => dc.card.cardId === cardId)?.card;
        errors.push(`${card?.name || cardId} has ${count} copies (maximum ${this.MAX_COPIES_PER_CARD} allowed)`);
      }
    }

    // Check color matching with leader
    if (deck.leader && deck.mainDeck.length > 0) {
      const leaderColors = deck.leader.colors.map(c => c.color);
      const unmatchedCards = deck.mainDeck.filter(deckCard => {
        const cardColors = deckCard.card.colors.map(c => c.color);
        return !cardColors.some(color => leaderColors.includes(color));
      });

      if (unmatchedCards.length > 0) {
        errors.push('All cards in the deck must match at least one color of the leader card');
      }
    }

    // Check for banned/restricted cards (future implementation)
    // This would be a separate validation step

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Creates a new deck with validation
   */
  static createDeck(
    id: string,
    name: string,
    leader: Card,
    mainDeck: DeckCard[],
    description?: string
  ): Deck {
    const deck: Deck = {
      id,
      name,
      description,
      leader,
      mainDeck,
      createdAt: new Date(),
      updatedAt: new Date(),
      isValid: false,
      validationErrors: []
    };

    const validation = this.validateDeck(deck);
    deck.isValid = validation.isValid;
    deck.validationErrors = validation.errors;

    return deck;
  }

  /**
   * Updates an existing deck
   */
  static updateDeck(deck: Deck, updates: Partial<Deck>): Deck {
    const updatedDeck = {
      ...deck,
      ...updates,
      updatedAt: new Date()
    };

    const validation = this.validateDeck(updatedDeck);
    updatedDeck.isValid = validation.isValid;
    updatedDeck.validationErrors = validation.errors;

    return updatedDeck;
  }

  /**
   * Adds a card to the deck
   */
  static addCardToDeck(deck: Deck, card: Card, quantity: number = 1): Deck {
    const existingCardIndex = deck.mainDeck.findIndex(dc => dc.card.cardId === card.cardId);
    
    let newMainDeck: DeckCard[];
    
    if (existingCardIndex >= 0) {
      // Update existing card quantity
      newMainDeck = [...deck.mainDeck];
      newMainDeck[existingCardIndex] = {
        ...newMainDeck[existingCardIndex],
        quantity: newMainDeck[existingCardIndex].quantity + quantity
      };
    } else {
      // Add new card
      newMainDeck = [...deck.mainDeck, { card, quantity }];
    }

    return this.updateDeck(deck, { mainDeck: newMainDeck });
  }

  /**
   * Removes a card from the deck
   */
  static removeCardFromDeck(deck: Deck, cardId: string, quantity: number = 1): Deck {
    const existingCardIndex = deck.mainDeck.findIndex(dc => dc.card.cardId === cardId);
    
    if (existingCardIndex === -1) {
      return deck; // Card not found
    }

    const newMainDeck = [...deck.mainDeck];
    const currentQuantity = newMainDeck[existingCardIndex].quantity;
    
    if (currentQuantity <= quantity) {
      // Remove the card entirely
      newMainDeck.splice(existingCardIndex, 1);
    } else {
      // Reduce quantity
      newMainDeck[existingCardIndex] = {
        ...newMainDeck[existingCardIndex],
        quantity: currentQuantity - quantity
      };
    }

    return this.updateDeck(deck, { mainDeck: newMainDeck });
  }

  /**
   * Changes the leader card
   */
  static changeLeader(deck: Deck, newLeader: Card): Deck {
    return this.updateDeck(deck, { leader: newLeader });
  }

  /**
   * Gets deck statistics
   */
  static getDeckStats(deck: Deck) {
    const totalCards = deck.mainDeck.reduce((sum, dc) => sum + dc.quantity, 0);
    const cardTypeCounts = deck.mainDeck.reduce((counts, dc) => {
      counts[dc.card.cardType] = (counts[dc.card.cardType] || 0) + dc.quantity;
      return counts;
    }, {} as Record<string, number>);

    const colorCounts = deck.mainDeck.reduce((counts, dc) => {
      dc.card.colors.forEach(color => {
        counts[color.color] = (counts[color.color] || 0) + dc.quantity;
      });
      return counts;
    }, {} as Record<string, number>);

    const costDistribution = deck.mainDeck.reduce((distribution, dc) => {
      const cost = dc.card.cost || 0;
      distribution[cost] = (distribution[cost] || 0) + dc.quantity;
      return distribution;
    }, {} as Record<number, number>);

    return {
      totalCards,
      cardTypeCounts,
      colorCounts,
      costDistribution,
      leader: deck.leader
    };
  }
}

// Utility functions for deck management
export class DeckUtils {
  /**
   * Shuffles a deck (returns a new array)
   */
  static shuffleDeck<T>(deck: T[]): T[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Converts a deck to a flat array of cards (for shuffling/drawing)
   */
  static deckToCardArray(deck: Deck): Card[] {
    const cards: Card[] = [];
    deck.mainDeck.forEach(deckCard => {
      for (let i = 0; i < deckCard.quantity; i++) {
        cards.push(deckCard.card);
      }
    });
    return cards;
  }

  /**
   * Creates a deck from a flat array of cards
   */
  static cardArrayToDeck(cards: Card[]): DeckCard[] {
    const cardCounts = new Map<string, { card: Card; count: number }>();
    
    cards.forEach(card => {
      const existing = cardCounts.get(card.cardId);
      if (existing) {
        existing.count++;
      } else {
        cardCounts.set(card.cardId, { card, count: 1 });
      }
    });

    return Array.from(cardCounts.values()).map(({ card, count }) => ({
      card,
      quantity: count
    }));
  }

  /**
   * Exports deck to a shareable format
   */
  static exportDeck(deck: Deck): string {
    const deckData = {
      name: deck.name,
      leader: deck.leader.cardId,
      mainDeck: deck.mainDeck.map(dc => ({
        cardId: dc.card.cardId,
        quantity: dc.quantity
      }))
    };
    
    return btoa(JSON.stringify(deckData));
  }

  /**
   * Imports deck from a shareable format
   */
  static importDeck(deckString: string, allCards: Card[]): Deck | null {
    try {
      const deckData = JSON.parse(atob(deckString));
      const leader = allCards.find(c => c.cardId === deckData.leader);
      
      if (!leader) {
        throw new Error('Leader card not found');
      }

      const mainDeck: DeckCard[] = deckData.mainDeck.map((item: any) => {
        const card = allCards.find(c => c.cardId === item.cardId);
        if (!card) {
          throw new Error(`Card not found: ${item.cardId}`);
        }
        return { card, quantity: item.quantity };
      });

      return DeckValidator.createDeck(
        crypto.randomUUID(),
        deckData.name,
        leader,
        mainDeck
      );
    } catch (error) {
      console.error('Failed to import deck:', error);
      return null;
    }
  }
} 