import React, { useState, useEffect } from 'react';
import { Card, Deck } from '../types/deck-types';
import { DeckStorage, DeckMetadata } from '../types/deck-storage';

interface DeckManagerProps {
  allCards: Card[];
  onDeckSelect?: (deck: Deck) => void;
  onEditDeck?: (deck: Deck) => void;
}

const DeckManager: React.FC<DeckManagerProps> = ({ 
  allCards, 
  onDeckSelect, 
  onEditDeck 
}) => {
  const [decks, setDecks] = useState<DeckMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importString, setImportString] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportString, setExportString] = useState('');

  // Load decks on component mount
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = () => {
    const allDecks = DeckStorage.getAllDeckMetadata();
    setDecks(allDecks);
  };

  const handleDeckSelect = (deckId: string) => {
    const deck = DeckStorage.loadDeck(deckId);
    if (deck) {
      setSelectedDeckId(deckId);
      onDeckSelect?.(deck);
    }
  };

  const handleEditDeck = (deckId: string) => {
    const deck = DeckStorage.loadDeck(deckId);
    if (deck) {
      onEditDeck?.(deck);
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      DeckStorage.deleteDeck(deckId);
      loadDecks();
      if (selectedDeckId === deckId) {
        setSelectedDeckId(null);
      }
    }
  };

  const handleDuplicateDeck = (deckId: string) => {
    const originalDeck = DeckStorage.loadDeck(deckId);
    if (originalDeck) {
      const newName = `${originalDeck.name} (Copy)`;
      const newDeck = DeckStorage.duplicateDeck(deckId, newName);
      if (newDeck) {
        loadDecks();
        alert('Deck duplicated successfully!');
      }
    }
  };

  const handleExportDeck = (deckId: string) => {
    const deck = DeckStorage.loadDeck(deckId);
    if (deck) {
      const exportString = DeckStorage.exportDeck(deck);
      setExportString(exportString);
      setShowExportModal(true);
    }
  };

  const handleImportDeck = () => {
    if (!importString.trim()) {
      alert('Please enter a valid deck string');
      return;
    }

    const deck = DeckStorage.importDeck(importString, allCards);
    if (deck) {
      DeckStorage.saveDeck(deck);
      loadDecks();
      setShowImportModal(false);
      setImportString('');
      alert('Deck imported successfully!');
    } else {
      alert('Failed to import deck. Please check the deck string.');
    }
  };

  const handleExportAllDecks = () => {
    const backupString = DeckStorage.exportAllDecks();
    setExportString(backupString);
    setShowExportModal(true);
  };

  const handleImportAllDecks = () => {
    if (!importString.trim()) {
      alert('Please enter a valid backup string');
      return;
    }

    const success = DeckStorage.importAllDecks(importString);
    if (success) {
      loadDecks();
      setShowImportModal(false);
      setImportString('');
      alert('All decks imported successfully!');
    } else {
      alert('Failed to import decks. Please check the backup string.');
    }
  };

  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deck.description && deck.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLeaderName = (leaderId: string) => {
    const leader = allCards.find(card => card.cardId === leaderId);
    return leader?.name || leaderId;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="deck-manager" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Deck Manager</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Import Deck
          </button>
          <button
            onClick={handleExportAllDecks}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export All
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search decks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Deck List */}
      <div style={{ 
        border: '1px solid #ccc',
        borderRadius: '4px',
        maxHeight: '600px',
        overflow: 'auto'
      }}>
        {filteredDecks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            {searchTerm ? 'No decks found matching your search.' : 'No decks saved yet.'}
          </div>
        ) : (
          filteredDecks.map(deck => (
            <div
              key={deck.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                borderBottom: '1px solid #eee',
                backgroundColor: selectedDeckId === deck.id ? '#f0f8ff' : 'white',
                cursor: 'pointer'
              }}
              onClick={() => handleDeckSelect(deck.id)}
            >
              <div style={{ flex: '1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: '0', fontSize: '18px' }}>{deck.name}</h3>
                  {!deck.isValid && (
                    <span style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '12px'
                    }}>
                      Invalid
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  Leader: {getLeaderName(deck.leaderId)} • Cards: {deck.cardCount}/50
                </div>
                {deck.description && (
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                    {deck.description}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  Created: {formatDate(deck.createdAt)} • Updated: {formatDate(deck.updatedAt)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDeck(deck.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Edit
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateDeck(deck.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Copy
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportDeck(deck.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Export
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDeck(deck.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3>Import Deck</h3>
            <textarea
              placeholder="Paste deck string here..."
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              style={{
                width: '100%',
                height: '150px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={handleImportDeck}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Import Deck
              </button>
              <button
                onClick={handleImportAllDecks}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Import All Decks
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportString('');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3>Export Deck</h3>
            <textarea
              value={exportString}
              readOnly
              style={{
                width: '100%',
                height: '150px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportString);
                  alert('Copied to clipboard!');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckManager; 