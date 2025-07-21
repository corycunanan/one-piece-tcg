import React, { useState, useEffect } from 'react';
import DeckBuilder from '../components/DeckBuilder';
import DeckManager from '../components/DeckManager';
import { loadAllCards, getAllCards } from '../utils/cardLoader';
import { Card, Deck } from '../types/deck-types';
import { DeckStorage } from '../types/deck-storage';

const DeckBuilderPage: React.FC = () => {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'builder' | 'manager'>('builder');
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  // Load cards on component mount
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cards = await loadAllCards();
      setAllCards(cards);
      
      if (cards.length === 0) {
        setError('No cards loaded. Please check if the card data files are available.');
      }
    } catch (err) {
      setError('Failed to load cards. Please check the console for details.');
      console.error('Error loading cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeckSave = (deck: Deck) => {
    try {
      DeckStorage.saveDeck(deck);
      alert('Deck saved successfully!');
      setSelectedDeck(null);
    } catch (error) {
      alert('Failed to save deck: ' + error);
    }
  };

  const handleDeckSelect = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentView('builder');
  };

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setCurrentView('builder');
  };

  const handleCreateNewDeck = () => {
    setSelectedDeck(null);
    setCurrentView('builder');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading cards... Please wait.
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '20px'
      }}>
        <div style={{ color: 'red', fontSize: '18px' }}>Error: {error}</div>
        <button 
          onClick={loadCards}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry Loading Cards
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>One Piece TCG Deck Builder</h1>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setCurrentView('manager')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'manager' ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Deck Manager
          </button>
          <button
            onClick={handleCreateNewDeck}
            style={{
              padding: '8px 16px',
              backgroundColor: currentView === 'builder' ? '#4CAF50' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            New Deck
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#e3f2fd',
        borderBottom: '1px solid #ddd',
        fontSize: '14px'
      }}>
        <strong>Loaded {allCards.length} cards</strong> • 
        {allCards.filter(c => c.cardType === 'LEADER').length} Leaders • 
        {allCards.filter(c => c.cardType === 'CHARACTER').length} Characters • 
        {allCards.filter(c => c.cardType === 'EVENT').length} Events • 
        {allCards.filter(c => c.cardType === 'STAGE').length} Stages
      </div>

      {/* Main Content */}
      <div style={{ flex: '1', overflow: 'hidden' }}>
        {currentView === 'builder' ? (
          <DeckBuilder
            allCards={allCards}
            onDeckSave={handleDeckSave}
            initialDeck={selectedDeck || undefined}
          />
        ) : (
          <DeckManager
            allCards={allCards}
            onDeckSelect={handleDeckSelect}
            onEditDeck={handleEditDeck}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        fontSize: '12px',
        color: '#666'
      }}>
        <div>One Piece TCG Deck Builder • Cards must match leader colors • Maximum 4 copies per card • Exactly 50 cards required</div>
      </div>
    </div>
  );
};

export default DeckBuilderPage; 