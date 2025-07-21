const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Leader', 'Character', 'Event', 'Stage', 'Don!!'], required: true },
  color: [String], // Can support multiple colors (Red, Blue, etc.)
  cost: Number,
  power: Number,
  life: Number,
  traits: [String],
  rarity: String,
  keywords: [String],
  effect: {
    trigger: String,
    description: String
  },
  image_url: String,
  set_id: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', CardSchema);