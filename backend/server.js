const express = require('express');
const mongoose = require('mongoose');
const Card = require('./models/Card');
const fs = require('fs');                         
const path = require('path');                   
const { getCardById } = require('./services/cards');

const app = express();
const PORT = 5001;

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/onepiece_tcg', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('One Piece TCG API is running!');
});

// 🧪 Load cards from JSON file
app.get('/cards/load', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'sampleCards.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const cards = JSON.parse(data);

    await Card.insertMany(cards);
    res.json({ message: 'Cards loaded successfully!', count: cards.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load cards', error });
  }
});

// Get all cards
app.get('/cards', async (req, res) => {
  try {
    const cards = await Card.find({});
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cards', error });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
