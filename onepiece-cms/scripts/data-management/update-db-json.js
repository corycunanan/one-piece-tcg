import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', '..', 'data', 'cards');
const SETS_FILE = path.join(__dirname, '..', '..', '..', 'data', 'sets', 'sets.json');
const DB_FILE = path.join(__dirname, '..', '..', '..', 'db.json');

function updateDbJson() {
  console.log('🔄 Updating db.json with latest data from individual files...');
  
  const db = {
    cards: [],
    sets: [],
    metadata: {}
  };
  
  // Read all card files
  const cardFiles = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.json'));
  
  console.log(`📁 Reading ${cardFiles.length} card files...`);
  
  cardFiles.forEach(file => {
    const filePath = path.join(CARDS_DIR, file);
    const cardData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (cardData.cards && Array.isArray(cardData.cards)) {
      db.cards.push(...cardData.cards);
      console.log(`   ✅ Added ${cardData.cards.length} cards from ${file}`);
    }
  });
  
  // Read sets
  if (fs.existsSync(SETS_FILE)) {
    const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));
    db.sets = setsData.sets;
    console.log(`   ✅ Added ${setsData.sets.length} sets`);
  }
  
  // Read metadata if it exists
  const metadataPath = path.join(__dirname, '..', '..', '..', 'data', 'metadata', 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    db.metadata = metadata;
    console.log('   ✅ Added metadata');
  }
  
  // Write db.json
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log(`✅ Updated db.json with ${db.cards.length} cards`);
  
  // Test a specific card
  const testCard = db.cards.find(c => c.cardId === 'OP06-022');
  if (testCard) {
    console.log(`📋 Test card OP06-022 has ${testCard.set.length} set(s):`);
    testCard.set.forEach(s => {
      console.log(`   - ${s.set} (${s.is_default ? 'default' : 'reprint'})`);
    });
  }
}

updateDbJson(); 