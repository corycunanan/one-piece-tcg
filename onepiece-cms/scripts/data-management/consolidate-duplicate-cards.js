import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', 'data', 'cards');
const SETS_FILE = path.join(__dirname, '..', '..', 'data', 'sets', 'sets.json');

// Function to consolidate duplicates within a single file
function consolidateFileDuplicates(filePath) {
  console.log(`📖 Processing ${path.basename(filePath)}...`);
  
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const uniqueCards = [];
  const seenCardIds = new Set();
  let duplicatesRemoved = 0;
  
  if (fileData.cards && Array.isArray(fileData.cards)) {
    fileData.cards.forEach(card => {
      if (!seenCardIds.has(card.cardId)) {
        seenCardIds.add(card.cardId);
        uniqueCards.push(card);
      } else {
        duplicatesRemoved++;
        console.log(`   ⚠️  Removed duplicate: ${card.cardId}`);
      }
    });
  }
  
  if (duplicatesRemoved > 0) {
    fileData.cards = uniqueCards;
    fileData.totalCards = uniqueCards.length;
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    console.log(`   ✅ Removed ${duplicatesRemoved} duplicates, kept ${uniqueCards.length} unique cards`);
  } else {
    console.log(`   ✅ No duplicates found`);
  }
  
  return duplicatesRemoved;
}

// Function to remove unknown.json file
function removeUnknownFile() {
  const unknownPath = path.join(CARDS_DIR, 'unknown.json');
  if (fs.existsSync(unknownPath)) {
    fs.unlinkSync(unknownPath);
    console.log('🗑️  Removed unknown.json file');
    return true;
  }
  return false;
}

// Function to update sets.json with correct counts
function updateSetsJson() {
  console.log('\n📝 Updating sets.json with correct card counts...');
  
  const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));
  let totalDuplicatesRemoved = 0;
  
  setsData.sets.forEach(set => {
    const filename = set.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const filePath = path.join(CARDS_DIR, `${filename}.json`);
    
    if (fs.existsSync(filePath)) {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const actualCount = fileData.cards ? fileData.cards.length : 0;
      
      if (set.totalCards !== actualCount) {
        console.log(`   📊 ${set.name}: ${set.totalCards} → ${actualCount} cards`);
        set.totalCards = actualCount;
        totalDuplicatesRemoved += (set.totalCards - actualCount);
      }
    }
  });
  
  setsData.exportedAt = new Date().toISOString();
  fs.writeFileSync(SETS_FILE, JSON.stringify(setsData, null, 2));
  console.log('✅ Updated sets.json with correct card counts');
  
  return totalDuplicatesRemoved;
}

// Function to update db.json
function updateDbJson() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  const dbPath = path.join(process.cwd(), '..', '..', 'db.json');
  
  const db = {
    cards: [],
    sets: [],
    metadata: {}
  };
  
  // Read all card files
  const cardsDir = path.join(dataDir, 'cards');
  if (fs.existsSync(cardsDir)) {
    const cardFiles = fs.readdirSync(cardsDir).filter(f => f.endsWith('.json'));
    
    cardFiles.forEach(file => {
      const filePath = path.join(cardsDir, file);
      const cardData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      db.cards.push(...cardData.cards);
    });
  }
  
  // Read sets and metadata
  const setsPath = path.join(dataDir, 'sets', 'sets.json');
  if (fs.existsSync(setsPath)) {
    const setsData = JSON.parse(fs.readFileSync(setsPath, 'utf8'));
    db.sets = setsData.sets;
  }
  
  const metadataPath = path.join(dataDir, 'metadata', 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    db.metadata = metadata;
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('✅ Updated db.json for JSON Server');
}

// Main function
async function main() {
  try {
    console.log('🔄 Starting duplicate card consolidation...\n');
    
    let totalDuplicatesRemoved = 0;
    
    // Step 1: Remove unknown.json file
    const unknownRemoved = removeUnknownFile();
    
    // Step 2: Consolidate duplicates in each card file
    const cardFiles = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.json'));
    
    console.log(`📁 Processing ${cardFiles.length} card files...\n`);
    
    cardFiles.forEach(file => {
      const filePath = path.join(CARDS_DIR, file);
      const duplicatesRemoved = consolidateFileDuplicates(filePath);
      totalDuplicatesRemoved += duplicatesRemoved;
    });
    
    // Step 3: Update sets.json
    const setsDuplicatesRemoved = updateSetsJson();
    
    // Step 4: Update db.json
    updateDbJson();
    
    console.log(`\n🎉 Consolidation complete!`);
    console.log(`📊 Total duplicates removed: ${totalDuplicatesRemoved}`);
    if (unknownRemoved) {
      console.log(`🗑️  Removed unknown.json file`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 