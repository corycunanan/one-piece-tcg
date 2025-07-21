import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', 'data', 'cards');
const SETS_FILE = path.join(__dirname, '..', '..', 'data', 'sets', 'sets.json');

// Load all set names for validation
const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));
const validSetNames = new Set(setsData.sets.map(s => s.name));

// Step 1: Build cardId -> [{set, file}] mapping
const cardSetMap = {};
const fileOrder = [];

fs.readdirSync(CARDS_DIR).forEach(file => {
  if (!file.endsWith('.json')) return;
  fileOrder.push(file);
  const filePath = path.join(CARDS_DIR, file);
  const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const setName = setData.set;
  if (!setName || !validSetNames.has(setName)) return;
  (setData.cards || []).forEach(card => {
    const cardId = card.cardId;
    if (!cardId) return;
    if (!cardSetMap[cardId]) cardSetMap[cardId] = [];
    // Avoid duplicate set entries for a card in the same file
    if (!cardSetMap[cardId].some(s => s.set === setName)) {
      cardSetMap[cardId].push({ set: setName, file });
    }
  });
});

// Step 2: For each file, update cards to new set structure
fs.readdirSync(CARDS_DIR).forEach(file => {
  if (!file.endsWith('.json')) return;
  const filePath = path.join(CARDS_DIR, file);
  const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const setName = setData.set;
  if (!setName || !validSetNames.has(setName)) return;
  let updated = false;
  (setData.cards || []).forEach(card => {
    const cardId = card.cardId;
    if (!cardId) return;
    // Build the set array for this card
    const setsForCard = cardSetMap[cardId] || [];
    // Determine default: first file in fileOrder that contains this cardId is default
    let defaultSet = null;
    for (const f of fileOrder) {
      const found = setsForCard.find(s => s.file === f);
      if (found) {
        defaultSet = found.set;
        break;
      }
    }
    card.set = setsForCard.map(s => ({
      set: s.set,
      is_default: s.set === defaultSet
    }));
    updated = true;
  });
  // Remove old set field from file root (keep in cards as new array)
  if (setData.set) delete setData.set;
  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(setData, null, 2));
    console.log(`Updated ${file}`);
  }
});

console.log('Migration complete.'); 