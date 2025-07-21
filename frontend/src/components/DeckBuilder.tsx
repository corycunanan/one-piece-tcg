import React, { useState, useEffect, useMemo } from 'react';
import { Card, Deck, DeckCard, DeckValidator, DeckUtils } from '../types/deck-types';

interface DeckBuilderProps {
  allCards: Card[];
  onDeckSave?: (deck: Deck) => void;
  initialDeck?: Deck;
}

interface CardSearchFilters {
  cardType: string;
  color: string;
  cost: string;
  rarity: string;
  searchText: string;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ 
  allCards, 
  onDeckSave, 
  initialDeck 
}) => {
  const [deck, setDeck] = useState<Deck | null>(initialDeck || null);
  const [selectedLeader, setSelectedLeader] = useState<Card | null>(initialDeck?.leader || null);
  const [deckName, setDeckName] = useState(initialDeck?.name || 'New Deck');
  const [deckDescription, setDeckDescription] = useState(initialDeck?.description || '');
  const [filters, setFilters] = useState<CardSearchFilters>({
    cardType: '',
    color: '',
    cost: '',
    rarity: '',
    searchText: ''
  });

  // Separate cards by type
  const { leaders, characters, events, stages } = useMemo(() => {
    const sorted = {
      leaders: allCards.filter(card => card.cardType === 'LEADER'),
      characters: allCards.filter(card => card.cardType === 'CHARACTER'),
      events: allCards.filter(card => card.cardType === 'EVENT'),
      stages: allCards.filter(card => card.cardType === 'STAGE')
    };
    return sorted;
  }, [allCards]);

  // Filter cards based on search criteria
  const filteredCards = useMemo(() => {
    let filtered = [...characters, ...events, ...stages];

    if (filters.cardType) {
      filtered = filtered.filter(card => card.cardType === filters.cardType);
    }

    if (filters.color) {
      filtered = filtered.filter(card => 
        card.colors.some((color: { color: string }) => color.color === filters.color)
      );
    }

    if (filters.cost !== '') {
      const cost = parseInt(filters.cost);
      filtered = filtered.filter(card => card.cost === cost);
    }

    if (filters.rarity) {
      filtered = filtered.filter(card => card.rarity === filters.rarity);
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchLower) ||
        card.cardId.toLowerCase().includes(searchLower) ||
        card.traits.some((trait: { trait: string }) => trait.trait.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [characters, events, stages, filters]);

  // Create or update deck when leader changes
  useEffect(() => {
    if (selectedLeader) {
      const newDeck = DeckValidator.createDeck(
        deck?.id || crypto.randomUUID(),
        deckName,
        selectedLeader,
        deck?.mainDeck || []
      );
      setDeck(newDeck);
    }
  }, [selectedLeader, deckName]);

  const handleAddCard = (card: Card) => {
    if (!deck) return;

    const currentQuantity = deck.mainDeck.find((dc: DeckCard) => dc.card.cardId === card.cardId)?.quantity || 0;
    
    if (currentQuantity >= 4) {
      alert('Maximum 4 copies of a card allowed');
      return;
    }

    const updatedDeck = DeckValidator.addCardToDeck(deck, card, 1);
    setDeck(updatedDeck);
  };

  const handleRemoveCard = (cardId: string) => {
    if (!deck) return;
    const updatedDeck = DeckValidator.removeCardFromDeck(deck, cardId, 1);
    setDeck(updatedDeck);
  };

  const handleRemoveAllCopies = (cardId: string) => {
    if (!deck) return;
    const card = deck.mainDeck.find((dc: DeckCard) => dc.card.cardId === cardId);
    if (card) {
      const updatedDeck = DeckValidator.removeCardFromDeck(deck, cardId, card.quantity);
      setDeck(updatedDeck);
    }
  };

  const handleSaveDeck = () => {
    if (!deck || !deck.isValid) {
      alert('Deck is not valid. Please fix the errors before saving.');
      return;
    }

    const finalDeck = DeckValidator.updateDeck(deck, {
      name: deckName,
      description: deckDescription
    });

    onDeckSave?.(finalDeck);
    alert('Deck saved successfully!');
  };

  const getDeckStats = () => {
    if (!deck) return null;
    return DeckValidator.getDeckStats(deck);
  };

  const stats = getDeckStats();

  return (
    <div className="deck-builder" style={{ 
      display: 'flex', 
      gap: '20px', 
      padding: '20px',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Card Search */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>Card Search</h2>
        
        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search cards..."
            value={filters.searchText}
            onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
            style={{ flex: '1', minWidth: '200px' }}
          />
          
          <select
            value={filters.cardType}
            onChange={(e) => setFilters(prev => ({ ...prev, cardType: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="CHARACTER">Character</option>
            <option value="EVENT">Event</option>
            <option value="STAGE">Stage</option>
          </select>

          <select
            value={filters.color}
            onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
          >
            <option value="">All Colors</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Purple">Purple</option>
            <option value="Black">Black</option>
            <option value="Yellow">Yellow</option>
          </select>

          <select
            value={filters.cost}
            onChange={(e) => setFilters(prev => ({ ...prev, cost: e.target.value }))}
          >
            <option value="">All Costs</option>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(cost => (
              <option key={cost} value={cost}>{cost}</option>
            ))}
          </select>

          <select
            value={filters.rarity}
            onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value }))}
          >
            <option value="">All Rarities</option>
            <option value="C">Common</option>
            <option value="UC">Uncommon</option>
            <option value="R">Rare</option>
            <option value="SR">Super Rare</option>
            <option value="L">Leader</option>
            <option value="SEC">Secret</option>
          </select>
        </div>

        {/* Card List */}
        <div style={{ 
          flex: '1', 
          overflow: 'auto', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px'
        }}>
          {filteredCards.map(card => {
            const inDeck = deck?.mainDeck.find((dc: DeckCard) => dc.card.cardId === card.cardId);
            const quantity = inDeck?.quantity || 0;
            
            return (
              <div key={card.cardId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                borderBottom: '1px solid #eee',
                backgroundColor: quantity > 0 ? '#f0f8ff' : 'transparent'
              }}>
                <div style={{ flex: '1' }}>
                  <div style={{ fontWeight: 'bold' }}>{card.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {card.cardId} • {card.cardType} • Cost: {card.cost || 0}
                    {card.power && ` • Power: ${card.power}`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {card.colors.map((c: { color: string }) => c.color).join(', ')} • {card.rarity}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {quantity > 0 && (
                    <span style={{ 
                      backgroundColor: '#4CAF50', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}>
                      {quantity}/4
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleAddCard(card)}
                    disabled={quantity >= 4}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: quantity >= 4 ? '#ccc' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: quantity >= 4 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Deck Management */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2>Deck Builder</h2>

        {/* Deck Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="Deck Name"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            style={{ padding: '8px', fontSize: '16px' }}
          />
          
          <textarea
            placeholder="Deck Description (optional)"
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            style={{ padding: '8px', height: '60px', resize: 'vertical' }}
          />
        </div>

        {/* Leader Selection */}
        <div>
          <h3>Leader Card</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {leaders.map(leader => (
              <div
                key={leader.cardId}
                onClick={() => setSelectedLeader(leader)}
                style={{
                  padding: '10px',
                  border: selectedLeader?.cardId === leader.cardId ? '2px solid #4CAF50' : '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: selectedLeader?.cardId === leader.cardId ? '#f0f8ff' : 'white'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{leader.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {leader.cardId} • Life: {leader.life}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {leader.colors.map((c: { color: string }) => c.color).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deck Statistics */}
        {stats && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <h4>Deck Statistics</h4>
            <div>Total Cards: {stats.totalCards}/50</div>
            <div>Card Types: {Object.entries(stats.cardTypeCounts).map(([type, count]) => 
              `${type}: ${count}`
            ).join(', ')}</div>
            <div>Colors: {Object.entries(stats.colorCounts).map(([color, count]) => 
              `${color}: ${count}`
            ).join(', ')}</div>
          </div>
        )}

        {/* Validation Errors */}
        {deck && deck.validationErrors.length > 0 && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#ffebee', 
            borderRadius: '4px',
            border: '1px solid #f44336'
          }}>
            <h4 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>Deck Errors</h4>
            {deck.validationErrors.map((error: string, index: number) => (
              <div key={index} style={{ color: '#d32f2f', fontSize: '14px' }}>
                • {error}
              </div>
            ))}
          </div>
        )}

        {/* Deck List */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <h3>Main Deck ({deck?.mainDeck.reduce((sum: number, dc: DeckCard) => sum + dc.quantity, 0) || 0}/50)</h3>
          
          <div style={{ 
            flex: '1', 
            overflow: 'auto', 
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '10px'
          }}>
            {deck?.mainDeck.map(deckCard => (
              <div key={deckCard.card.cardId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ flex: '1' }}>
                  <div style={{ fontWeight: 'bold' }}>{deckCard.card.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {deckCard.card.cardId} • {deckCard.card.cardType} • Cost: {deckCard.card.cost || 0}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    {deckCard.quantity}
                  </span>
                  
                  <button
                    onClick={() => handleRemoveCard(deckCard.card.cardId)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  
                  <button
                    onClick={() => handleRemoveAllCopies(deckCard.card.cardId)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveDeck}
          disabled={!deck?.isValid}
          style={{
            padding: '12px',
            backgroundColor: deck?.isValid ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: deck?.isValid ? 'pointer' : 'not-allowed'
          }}
        >
          Save Deck
        </button>
      </div>
    </div>
  );
};

export default DeckBuilder; 