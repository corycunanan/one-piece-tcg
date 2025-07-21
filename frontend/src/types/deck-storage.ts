import { Deck, Card, DeckValidator, DeckUtils } from './deck-types';

export interface DeckMetadata {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
  isValid: boolean;
}

export class DeckStorage {
  private static readonly STORAGE_KEY = 'one-piece-tcg-decks';
  private static readonly DECK_PREFIX = 'deck-';

  /**
   * Save a deck to localStorage
   */
  static saveDeck(deck: Deck): void {
    try {
      const existingDecks = this.getAllDeckMetadata();
      const deckData = JSON.stringify(deck);
      
      localStorage.setItem(`${this.DECK_PREFIX}${deck.id}`, deckData);
      
      // Update metadata
      const metadata: DeckMetadata = {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        leaderId: deck.leader.cardId,
        cardCount: deck.mainDeck.reduce((sum, dc) => sum + dc.quantity, 0),
        createdAt: deck.createdAt,
        updatedAt: deck.updatedAt,
        isValid: deck.isValid
      };
      
      const existingIndex = existingDecks.findIndex(d => d.id === deck.id);
      if (existingIndex >= 0) {
        existingDecks[existingIndex] = metadata;
      } else {
        existingDecks.push(metadata);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingDecks));
    } catch (error) {
      console.error('Failed to save deck:', error);
      throw new Error('Failed to save deck to storage');
    }
  }

  /**
   * Load a deck from localStorage
   */
  static loadDeck(deckId: string): Deck | null {
    try {
      const deckData = localStorage.getItem(`${this.DECK_PREFIX}${deckId}`);
      if (!deckData) return null;
      
      const deck = JSON.parse(deckData) as Deck;
      
      // Convert date strings back to Date objects
      deck.createdAt = new Date(deck.createdAt);
      deck.updatedAt = new Date(deck.updatedAt);
      
      return deck;
    } catch (error) {
      console.error('Failed to load deck:', error);
      return null;
    }
  }

  /**
   * Get all deck metadata (for listing decks)
   */
  static getAllDeckMetadata(): DeckMetadata[] {
    try {
      const metadata = localStorage.getItem(this.STORAGE_KEY);
      if (!metadata) return [];
      
      const deckMetadata = JSON.parse(metadata) as DeckMetadata[];
      
      // Convert date strings back to Date objects
      return deckMetadata.map(dm => ({
        ...dm,
        createdAt: new Date(dm.createdAt),
        updatedAt: new Date(dm.updatedAt)
      }));
    } catch (error) {
      console.error('Failed to load deck metadata:', error);
      return [];
    }
  }

  /**
   * Delete a deck
   */
  static deleteDeck(deckId: string): boolean {
    try {
      // Remove deck data
      localStorage.removeItem(`${this.DECK_PREFIX}${deckId}`);
      
      // Remove from metadata
      const existingDecks = this.getAllDeckMetadata();
      const updatedDecks = existingDecks.filter(d => d.id !== deckId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedDecks));
      
      return true;
    } catch (error) {
      console.error('Failed to delete deck:', error);
      return false;
    }
  }

  /**
   * Export deck to a shareable string
   */
  static exportDeck(deck: Deck): string {
    return DeckUtils.exportDeck(deck);
  }

  /**
   * Import deck from a shareable string
   */
  static importDeck(deckString: string, allCards: Card[]): Deck | null {
    return DeckUtils.importDeck(deckString, allCards);
  }

  /**
   * Create a new deck with a unique ID
   */
  static createNewDeck(name: string, leader: Card, allCards: Card[]): Deck {
    const deckId = crypto.randomUUID();
    const deck = DeckValidator.createDeck(deckId, name, leader, []);
    
    this.saveDeck(deck);
    return deck;
  }

  /**
   * Duplicate an existing deck
   */
  static duplicateDeck(deckId: string, newName: string): Deck | null {
    const originalDeck = this.loadDeck(deckId);
    if (!originalDeck) return null;
    
    const newDeck = DeckValidator.createDeck(
      crypto.randomUUID(),
      newName,
      originalDeck.leader,
      originalDeck.mainDeck,
      originalDeck.description
    );
    
    this.saveDeck(newDeck);
    return newDeck;
  }

  /**
   * Get deck statistics for all saved decks
   */
  static getDeckStatistics(): {
    totalDecks: number;
    validDecks: number;
    invalidDecks: number;
    averageCardsPerDeck: number;
    mostUsedLeaders: Array<{ leaderId: string; count: number }>;
  } {
    const allDecks = this.getAllDeckMetadata();
    const totalDecks = allDecks.length;
    const validDecks = allDecks.filter(d => d.isValid).length;
    const invalidDecks = totalDecks - validDecks;
    
    const totalCards = allDecks.reduce((sum, deck) => sum + deck.cardCount, 0);
    const averageCardsPerDeck = totalDecks > 0 ? totalCards / totalDecks : 0;
    
    // Count leader usage
    const leaderCounts = new Map<string, number>();
    allDecks.forEach(deck => {
      const count = leaderCounts.get(deck.leaderId) || 0;
      leaderCounts.set(deck.leaderId, count + 1);
    });
    
    const mostUsedLeaders = Array.from(leaderCounts.entries())
      .map(([leaderId, count]) => ({ leaderId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalDecks,
      validDecks,
      invalidDecks,
      averageCardsPerDeck,
      mostUsedLeaders
    };
  }

  /**
   * Search decks by name or description
   */
  static searchDecks(searchTerm: string): DeckMetadata[] {
    const allDecks = this.getAllDeckMetadata();
    const searchLower = searchTerm.toLowerCase();
    
    return allDecks.filter(deck => 
      deck.name.toLowerCase().includes(searchLower) ||
      (deck.description && deck.description.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Get decks by leader
   */
  static getDecksByLeader(leaderId: string): DeckMetadata[] {
    const allDecks = this.getAllDeckMetadata();
    return allDecks.filter(deck => deck.leaderId === leaderId);
  }

  /**
   * Validate all saved decks and update their validation status
   */
  static validateAllDecks(): void {
    const allDecks = this.getAllDeckMetadata();
    
    allDecks.forEach(deckMeta => {
      const deck = this.loadDeck(deckMeta.id);
      if (deck) {
        const validation = DeckValidator.validateDeck(deck);
        if (deck.isValid !== validation.isValid) {
          deck.isValid = validation.isValid;
          deck.validationErrors = validation.errors;
          this.saveDeck(deck);
        }
      }
    });
  }

  /**
   * Clear all deck data (for testing/reset)
   */
  static clearAllDecks(): void {
    const allDecks = this.getAllDeckMetadata();
    allDecks.forEach(deck => {
      localStorage.removeItem(`${this.DECK_PREFIX}${deck.id}`);
    });
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export all decks as a backup
   */
  static exportAllDecks(): string {
    const allDecks = this.getAllDeckMetadata();
    const decksData = allDecks.map(deckMeta => {
      const deck = this.loadDeck(deckMeta.id);
      return deck;
    }).filter(Boolean);
    
    return btoa(JSON.stringify(decksData));
  }

  /**
   * Import decks from backup
   */
  static importAllDecks(backupString: string): boolean {
    try {
      const decksData = JSON.parse(atob(backupString)) as Deck[];
      
      decksData.forEach(deck => {
        if (deck && deck.id) {
          this.saveDeck(deck);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to import decks:', error);
      return false;
    }
  }
} 