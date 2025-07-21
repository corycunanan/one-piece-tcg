require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Added for static file serving

const cardRoutes = require('./routes/cards');
const deckRoutes = require('./routes/decks');
const simulateRoutes = require('./routes/simulate');
const resolveRoutes = require('./routes/resolve');
const playRoutes = require('./routes/play');
const turnRoutes = require('./routes/turnRoutes');

const app = express();
app.use(express.json());

// Serve static files from deck-management directory
app.use('/deck-management', express.static(path.join(__dirname, '..', 'deck-management')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Mount routes
app.use('/cards', cardRoutes);
app.use('/decks', deckRoutes);
app.use('/simulate', simulateRoutes);
app.use('/resolve', resolveRoutes);
app.use('/play', playRoutes);
app.use('/turn', turnRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
