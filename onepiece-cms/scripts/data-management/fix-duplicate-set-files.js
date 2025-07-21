import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', '..', 'data', 'cards');
const SETS_FILE = path.join(__dirname, '..', '..', '..', 'data', 'sets', 'sets.json');

// Load sets data to get the correct naming
const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));

// Function to generate consistent filename from set name
function generateFilename(setName) {
  return setName.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters (including dots)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Define the duplicate mappings (duplicate file -> correct file)
const duplicateMappings = {
  'st15-edwardnewgate.json': 'st15-edward-newgate.json',
  'st18-monkeydluffy.json': 'st18-monkey-d-luffy.json',
  'st21-ex-gear5.json': 'st21-gear-5.json',
  'st26-monkeydluffy.json': 'st26-monkey-d-luffy.json',
  'st27-marshalldteach.json': 'st27-marshall-d-teach.json'
};

console.log('🔧 Fixing duplicate set files...');

let totalConsolidated = 0;
let totalRemoved = 0;

// Process each duplicate mapping
Object.entries(duplicateMappings).forEach(([duplicateFile, correctFile]) => {
  const duplicatePath = path.join(CARDS_DIR, duplicateFile);
  const correctPath = path.join(CARDS_DIR, correctFile);
  
  if (fs.existsSync(duplicatePath) && fs.existsSync(correctPath)) {
    console.log(`\n📁 Processing: ${duplicateFile} -> ${correctFile}`);
    
    // Read both files
    const duplicateData = JSON.parse(fs.readFileSync(duplicatePath, 'utf8'));
    const correctData = JSON.parse(fs.readFileSync(correctPath, 'utf8'));
    
    // Merge cards from duplicate into correct file
    const allCards = [...correctData.cards];
    const seenCardIds = new Set(correctData.cards.map(card => card.cardId));
    
    let mergedCards = 0;
    duplicateData.cards.forEach(card => {
      if (!seenCardIds.has(card.cardId)) {
        allCards.push(card);
        seenCardIds.add(card.cardId);
        mergedCards++;
      }
    });
    
    // Update correct file with merged data
    correctData.cards = allCards;
    correctData.totalCards = allCards.length;
    correctData.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(correctPath, JSON.stringify(correctData, null, 2));
    console.log(`   ✅ Merged ${mergedCards} cards from ${duplicateFile} into ${correctFile}`);
    
    // Remove duplicate file
    fs.unlinkSync(duplicatePath);
    console.log(`   🗑️  Removed duplicate file: ${duplicateFile}`);
    
    totalConsolidated += mergedCards;
    totalRemoved++;
    
  } else if (fs.existsSync(duplicatePath) && !fs.existsSync(correctPath)) {
    // If only duplicate exists, rename it to correct name
    const duplicatePath = path.join(CARDS_DIR, duplicateFile);
    const correctPath = path.join(CARDS_DIR, correctFile);
    
    fs.renameSync(duplicatePath, correctPath);
    console.log(`   🔄 Renamed ${duplicateFile} -> ${correctFile}`);
    totalRemoved++;
    
  } else if (!fs.existsSync(duplicatePath)) {
    console.log(`   ⏭️  Skipped ${duplicateFile} (does not exist)`);
  }
});

// Update sets.json with correct counts
console.log('\n📝 Updating sets.json with correct card counts...');

setsData.sets.forEach(set => {
  const filename = generateFilename(set.name);
  const filePath = path.join(CARDS_DIR, `${filename}.json`);
  
  if (fs.existsSync(filePath)) {
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const actualCount = fileData.cards ? fileData.cards.length : 0;
    
    if (set.totalCards !== actualCount) {
      console.log(`   📊 ${set.name}: ${set.totalCards} → ${actualCount} cards`);
      set.totalCards = actualCount;
    }
  }
});

setsData.exportedAt = new Date().toISOString();
fs.writeFileSync(SETS_FILE, JSON.stringify(setsData, null, 2));
console.log('✅ Updated sets.json with correct card counts');

// Update db.json
console.log('\n🔄 Updating db.json...');
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

console.log(`\n🎉 Duplicate set files fix complete!`);
console.log(`📊 Summary:`);
console.log(`   Files consolidated: ${totalRemoved}`);
console.log(`   Cards merged: ${totalConsolidated}`);
console.log(`   Database updated: ✅`); 