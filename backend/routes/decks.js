const express = require('express');
const Deck = require('../models/Deck');
const Card = require('../models/Card');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// GET /decks - Get all decks with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      isValid, 
      createdBy,
      isPublic,
      leaderId,
      tags 
    } = req.query;

    const filter = {};

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by validation status
    if (isValid !== undefined) {
      filter.isValid = isValid === 'true';
    }

    // Filter by creator
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    // Filter by public status
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }

    // Filter by leader
    if (leaderId) {
      filter['leader.cardId'] = leaderId;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const skip = (page - 1) * limit;
    
    const decks = await Deck.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Deck.countDocuments(filter);

    res.json({
      decks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ 
      message: 'Failed to fetch decks', 
      error: error.message 
    });
  }
});

// GET /decks/files - List deck files from deck-management directory
router.get('/files', async (req, res) => {
  try {
    const deckManagementPath = path.join(__dirname, '..', '..', 'deck-management');
    
    if (!fs.existsSync(deckManagementPath)) {
      return res.json([]);
    }
    
    const files = fs.readdirSync(deckManagementPath)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => {
        // Sort by modification time, newest first
        const statA = fs.statSync(path.join(deckManagementPath, a));
        const statB = fs.statSync(path.join(deckManagementPath, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });
    
    res.json(files);
  } catch (error) {
    console.error('Error listing deck files:', error);
    res.status(500).json({ 
      message: 'Failed to list deck files', 
      error: error.message 
    });
  }
});

// GET /decks/files/:filename - Get a specific deck file
router.get('/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const deckManagementPath = path.join(__dirname, '..', '..', 'deck-management');
    const filePath = path.join(deckManagementPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Deck file not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const deckData = JSON.parse(fileContent);
    
    res.json(deckData);
  } catch (error) {
    console.error('Error reading deck file:', error);
    res.status(500).json({ 
      message: 'Failed to read deck file', 
      error: error.message 
    });
  }
});

// GET /decks/:id - Get a specific deck
router.get('/:id', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id).lean();
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    res.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ 
      message: 'Failed to fetch deck', 
      error: error.message 
    });
  }
});

// POST /decks - Create a new deck
router.post('/', async (req, res) => {
  try {
    const { name, description, leader, mainDeck, tags, isPublic } = req.body;

    // Validate required fields
    if (!name || !leader || !mainDeck) {
      return res.status(400).json({ 
        message: 'Name, leader, and mainDeck are required' 
      });
    }

    // Create deck with validation
    const deck = Deck.createDeck({
      name,
      description,
      leader,
      mainDeck,
      tags: tags || [],
      isPublic: isPublic || false,
      createdBy: req.body.createdBy || 'admin'
    });

    await deck.save();

    res.status(201).json({
      message: 'Deck created successfully',
      deck
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create deck', 
      error: error.message 
    });
  }
});

// PUT /decks/:id - Update a deck
router.put('/:id', async (req, res) => {
  try {
    const { name, description, leader, mainDeck, tags, isPublic } = req.body;

    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    // Update fields
    if (name !== undefined) deck.name = name;
    if (description !== undefined) deck.description = description;
    if (leader !== undefined) deck.leader = leader;
    if (mainDeck !== undefined) deck.mainDeck = mainDeck;
    if (tags !== undefined) deck.tags = tags;
    if (isPublic !== undefined) deck.isPublic = isPublic;

    await deck.save();

    res.json({
      message: 'Deck updated successfully',
      deck
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update deck', 
      error: error.message 
    });
  }
});

// DELETE /decks/:id - Delete a deck
router.delete('/:id', async (req, res) => {
  try {
    const deck = await Deck.findByIdAndDelete(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    res.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ 
      message: 'Failed to delete deck', 
      error: error.message 
    });
  }
});

// POST /decks/:id/validate - Validate a deck
router.post('/:id/validate', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const validation = deck.validateDeck();
    const stats = deck.getStats();

    res.json({
      isValid: validation.isValid,
      errors: validation.errors,
      stats
    });
  } catch (error) {
    console.error('Error validating deck:', error);
    res.status(500).json({ 
      message: 'Failed to validate deck', 
      error: error.message 
    });
  }
});

// GET /decks/:id/stats - Get deck statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const stats = deck.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting deck stats:', error);
    res.status(500).json({ 
      message: 'Failed to get deck stats', 
      error: error.message 
    });
  }
});

// POST /decks/:id/add-card - Add a card to the deck
router.post('/:id/add-card', async (req, res) => {
  try {
    const { cardId, quantity = 1 } = req.body;

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }

    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    // Find the card in the main deck
    const existingCard = deck.mainDeck.find(card => card.cardId === cardId);
    
    if (existingCard) {
      // Update quantity
      existingCard.quantity += quantity;
      if (existingCard.quantity > 4) {
        return res.status(400).json({ 
          message: 'Maximum 4 copies of a card allowed' 
        });
      }
    } else {
      // Add new card (you would need to fetch card data from your card database)
      // For now, we'll require the full card data
      return res.status(400).json({ 
        message: 'Card data is required for new cards' 
      });
    }

    await deck.save();

    res.json({
      message: 'Card added to deck successfully',
      deck
    });
  } catch (error) {
    console.error('Error adding card to deck:', error);
    res.status(500).json({ 
      message: 'Failed to add card to deck', 
      error: error.message 
    });
  }
});

// DELETE /decks/:id/remove-card/:cardId - Remove a card from the deck
router.delete('/:id/remove-card/:cardId', async (req, res) => {
  try {
    const { quantity = 1 } = req.query;
    const { cardId } = req.params;

    const deck = await Deck.findById(req.params.id);
    
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const cardIndex = deck.mainDeck.findIndex(card => card.cardId === cardId);
    
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Card not found in deck' });
    }

    const card = deck.mainDeck[cardIndex];
    
    if (card.quantity <= quantity) {
      // Remove the card entirely
      deck.mainDeck.splice(cardIndex, 1);
    } else {
      // Reduce quantity
      card.quantity -= quantity;
    }

    await deck.save();

    res.json({
      message: 'Card removed from deck successfully',
      deck
    });
  } catch (error) {
    console.error('Error removing card from deck:', error);
    res.status(500).json({ 
      message: 'Failed to remove card from deck', 
      error: error.message 
    });
  }
});

// GET /decks/stats/overview - Get overall deck statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalDecks = await Deck.countDocuments();
    const validDecks = await Deck.countDocuments({ isValid: true });
    const invalidDecks = totalDecks - validDecks;
    const publicDecks = await Deck.countDocuments({ isPublic: true });

    // Get most used leaders
    const leaderStats = await Deck.aggregate([
      {
        $group: {
          _id: '$leader.cardId',
          count: { $sum: 1 },
          leaderName: { $first: '$leader.name' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get deck creation over time
    const creationStats = await Deck.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalDecks,
      validDecks,
      invalidDecks,
      publicDecks,
      leaderStats,
      creationStats
    });
  } catch (error) {
    console.error('Error getting deck statistics:', error);
    res.status(500).json({ 
      message: 'Failed to get deck statistics', 
      error: error.message 
    });
  }
});

// POST /decks/:id/duplicate - Duplicate a deck
router.post('/:id/duplicate', async (req, res) => {
  try {
    const { newName } = req.body;
    
    const originalDeck = await Deck.findById(req.params.id);
    
    if (!originalDeck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    const newDeck = new Deck({
      name: newName || `${originalDeck.name} (Copy)`,
      description: originalDeck.description,
      leader: originalDeck.leader,
      mainDeck: originalDeck.mainDeck,
      tags: originalDeck.tags,
      isPublic: false, // Duplicates are private by default
      createdBy: req.body.createdBy || 'admin'
    });

    await newDeck.save();

    res.status(201).json({
      message: 'Deck duplicated successfully',
      deck: newDeck
    });
  } catch (error) {
    console.error('Error duplicating deck:', error);
    res.status(500).json({ 
      message: 'Failed to duplicate deck', 
      error: error.message 
    });
  }
});

module.exports = router; 