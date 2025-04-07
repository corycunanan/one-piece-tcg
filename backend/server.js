require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const cardRoutes = require('./routes/cards');
const simulateRoutes = require('./routes/simulate');
const resolveRoutes = require('./routes/resolve');
const playRoutes = require('./routes/play');
const turnRoutes = require('./routes/turnRoutes');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Mount routes
app.use('/cards', cardRoutes);
app.use('/simulate', simulateRoutes);
app.use('/resolve', resolveRoutes);
app.use('/play', playRoutes);
app.use('/turn', turnRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
