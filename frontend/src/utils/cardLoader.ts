import { Card } from '../types/deck-types';

// Import all card data from the JSON files
// This will be populated when we load the actual card data
let allCards: Card[] = [];

/**
 * Load all cards from the data directory
 */
export async function loadAllCards(): Promise<Card[]> {
  if (allCards.length > 0) {
    return allCards;
  }

  try {
    // Load the main db.json file which contains all cards
    const response = await fetch('/db.json');
    if (!response.ok) {
      throw new Error('Failed to load card data');
    }

    const data = await response.json();
    allCards = data.cards || [];
    
    console.log(`Loaded ${allCards.length} cards`);
    return allCards;
  } catch (error) {
    console.error('Error loading cards:', error);
    
    // Fallback: try to load individual set files
    try {
      const sets = [
        'op01-romance-dawn',
        'op02-paramount-war',
        'op03-pillars-of-strength',
        'op04-kingdoms-of-intrigue',
        'op05-awakening-of-the-new-era',
        'op06-wings-of-the-captain',
        'op07-500-years-in-the-future',
        'op08-two-legends',
        'op09-emperors-in-the-new-world',
        'op10-royal-blood',
        'op11-a-fist-of-divine-speed',
        'st01-straw-hat-crew',
        'st02-worst-generation',
        'st03-the-seven-warlords-of-the-sea',
        'st04-animal-kingdom-pirates',
        'st05-one-piece-film-edition',
        'st06-absolute-justice',
        'st07-big-mom-pirates',
        'st08-monkey-d-luffy',
        'st09-yamato',
        'st10-the-three-captains',
        'st11-uta',
        'st12-zoro-sanji',
        'st13-the-three-brothers',
        'st14-3d2y',
        'st15-edward-newgate',
        'st16-uta',
        'st17-donquixote-doflamingo',
        'st18-monkeydluffy',
        'st19-smoker',
        'st20-charlotte-katakuri',
        'st21-ex-gear5',
        'st22-ace-newgate',
        'st23-shanks',
        'st24-jewelry-bonney',
        'st25-buggy',
        'st26-monkeydluffy',
        'st27-marshalldteach',
        'st28-yamato',
        'eb01-memorial-collection',
        'eb02-anime-25th-collection',
        'prb01-one-piece-the-best',
        'promotional-cards'
      ];

      const cards: Card[] = [];
      
      for (const set of sets) {
        try {
          const setResponse = await fetch(`/data/cards/${set}.json`);
          if (setResponse.ok) {
            const setData = await setResponse.json();
            if (setData.cards && Array.isArray(setData.cards)) {
              cards.push(...setData.cards);
            }
          }
        } catch (setError) {
          console.warn(`Failed to load set ${set}:`, setError);
        }
      }

      allCards = cards;
      console.log(`Loaded ${allCards.length} cards from individual set files`);
      return allCards;
    } catch (fallbackError) {
      console.error('Failed to load cards from fallback sources:', fallbackError);
      return [];
    }
  }
}

/**
 * Get all cards (cached)
 */
export function getAllCards(): Card[] {
  return allCards;
}

/**
 * Search cards by various criteria
 */
export function searchCards(criteria: {
  name?: string;
  cardType?: string;
  color?: string;
  cost?: number;
  rarity?: string;
  trait?: string;
}): Card[] {
  return allCards.filter(card => {
    if (criteria.name && !card.name.toLowerCase().includes(criteria.name.toLowerCase())) {
      return false;
    }
    
    if (criteria.cardType && card.cardType !== criteria.cardType) {
      return false;
    }
    
    if (criteria.color && !card.colors.some(c => c.color === criteria.color)) {
      return false;
    }
    
    if (criteria.cost !== undefined && card.cost !== criteria.cost) {
      return false;
    }
    
    if (criteria.rarity && card.rarity !== criteria.rarity) {
      return false;
    }
    
    if (criteria.trait && !card.traits.some(t => t.trait.toLowerCase().includes(criteria.trait!.toLowerCase()))) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get cards by leader (for color matching)
 */
export function getCardsByLeader(leaderCard: Card): Card[] {
  const leaderColors = leaderCard.colors.map(c => c.color);
  
  return allCards.filter(card => 
    card.cardType !== 'LEADER' && 
    card.colors.some(color => leaderColors.includes(color.color))
  );
}

/**
 * Get all leader cards
 */
export function getLeaderCards(): Card[] {
  return allCards.filter(card => card.cardType === 'LEADER');
}

/**
 * Get cards by type
 */
export function getCardsByType(cardType: string): Card[] {
  return allCards.filter(card => card.cardType === cardType);
}

/**
 * Get unique colors from all cards
 */
export function getUniqueColors(): string[] {
  const colors = new Set<string>();
  allCards.forEach(card => {
    card.colors.forEach(color => colors.add(color.color));
  });
  return Array.from(colors).sort();
}

/**
 * Get unique rarities from all cards
 */
export function getUniqueRarities(): string[] {
  const rarities = new Set<string>();
  allCards.forEach(card => {
    rarities.add(card.rarity);
  });
  return Array.from(rarities).sort();
}

/**
 * Get unique traits from all cards
 */
export function getUniqueTraits(): string[] {
  const traits = new Set<string>();
  allCards.forEach(card => {
    card.traits.forEach(trait => traits.add(trait.trait));
  });
  return Array.from(traits).sort();
} 