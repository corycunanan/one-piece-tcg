import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', 'data', 'cards');
const SETS_FILE = path.join(__dirname, '..', '..', 'data', 'sets', 'sets.json');

// Load sets data to get the mapping
const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));
const setCodeToName = {};
setsData.sets.forEach(set => {
  setCodeToName[set.code] = set.name;
});

// Create filename mapping
const setCodeToFilename = {};
setsData.sets.forEach(set => {
  const filename = set.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  setCodeToFilename[set.code] = filename;
});

console.log('📋 Set code to filename mapping:');
Object.keys(setCodeToFilename).forEach(code => {
  console.log(`   ${code} → ${setCodeToFilename[code]}.json`);
});

// Function to extract set code from cardId
function extractSetCode(cardId) {
  if (!cardId) return null;
  
  // Handle promotional cards (P-)
  if (cardId.startsWith('P-')) {
    return 'P';
  }
  
  // Extract set code (e.g., "OP11-001" → "OP11")
  const setMatch = cardId.match(/^([A-Z]{2,3}\d{2})/);
  if (setMatch) {
    return setMatch[1];
  }
  
  return null;
}

// Function to extract set names from image labels
function extractSetsFromImageLabels(card) {
  const sets = new Set();
  
  if (card.images && Array.isArray(card.images)) {
    card.images.forEach(image => {
      if (image.label) {
        // Extract set name from label patterns like:
        // "-ROMANCE DAWN- [OP01]"
        // "-ONE PIECE CARD THE BEST- [PRB-01] (p8)"
        // "-AWAKENING OF THE NEW ERA-[OP05] (p4)"
        // "-The Three Captains-[ST-10] (p3)"
        
        const label = image.label;
        
        // Map label patterns to set names
        if (label.includes('[OP01]')) {
          sets.add('OP01 - Romance Dawn');
        } else if (label.includes('[OP02]')) {
          sets.add('OP02 - Paramount War');
        } else if (label.includes('[OP03]')) {
          sets.add('OP03 - Pillars of Strength');
        } else if (label.includes('[OP04]')) {
          sets.add('OP04 - Kingdoms of Intrigue');
        } else if (label.includes('[OP05]')) {
          sets.add('OP05 - Awakening of the New Era');
        } else if (label.includes('[OP06]')) {
          sets.add('OP06 - Wings of the Captain');
        } else if (label.includes('[OP07]')) {
          sets.add('OP07 - 500 Years in the Future');
        } else if (label.includes('[OP08]')) {
          sets.add('OP08 - Two Legends');
        } else if (label.includes('[OP09]')) {
          sets.add('OP09 - Emperors in the New World');
        } else if (label.includes('[OP10]')) {
          sets.add('OP10 - Royal Blood');
        } else if (label.includes('[OP11]')) {
          sets.add('OP11 - A Fist of Divine Speed');
        } else if (label.includes('[EB01]')) {
          sets.add('EB01 - Memorial Collection');
        } else if (label.includes('[EB02]')) {
          sets.add('EB02 - Anime 25th Collection');
        } else if (label.includes('[PRB-01]') || label.includes('[PRB01]')) {
          sets.add('PRB01 - One Piece The Best');
        } else if (label.includes('[ST01]')) {
          sets.add('ST01 - Straw Hat Crew');
        } else if (label.includes('[ST02]')) {
          sets.add('ST02 - Worst Generation');
        } else if (label.includes('[ST03]')) {
          sets.add('ST03 - The Seven Warlords of the Sea');
        } else if (label.includes('[ST04]')) {
          sets.add('ST04 - Animal Kingdom Pirates');
        } else if (label.includes('[ST05]')) {
          sets.add('ST05 - One Piece Film Edition');
        } else if (label.includes('[ST06]')) {
          sets.add('ST06 - Absolute Justice');
        } else if (label.includes('[ST07]')) {
          sets.add('ST07 - Big Mom Pirates');
        } else if (label.includes('[ST08]')) {
          sets.add('ST08 - Monkey D. Luffy');
        } else if (label.includes('[ST09]')) {
          sets.add('ST09 - Yamato');
        } else if (label.includes('[ST-10]') || label.includes('[ST10]')) {
          sets.add('ST10 - The Three Captains');
        } else if (label.includes('[ST11]')) {
          sets.add('ST11 - Uta');
        } else if (label.includes('[ST12]')) {
          sets.add('ST12 - Zoro & Sanji');
        } else if (label.includes('[ST13]')) {
          sets.add('ST13 - The Three Brothers');
        } else if (label.includes('[ST14]')) {
          sets.add('ST14 - 3D2Y');
        } else if (label.includes('[ST15]')) {
          sets.add('ST15 - Edward.Newgate');
        } else if (label.includes('[ST16]')) {
          sets.add('ST16 - Uta');
        } else if (label.includes('[ST17]')) {
          sets.add('ST17 - Donquixote Doflamingo');
        } else if (label.includes('[ST18]')) {
          sets.add('ST18 - Monkey.D.Luffy');
        } else if (label.includes('[ST19]')) {
          sets.add('ST19 - Smoker');
        } else if (label.includes('[ST20]')) {
          sets.add('ST20 - Charlotte Katakuri');
        } else if (label.includes('[ST21]')) {
          sets.add('ST21 - EX - GEAR5');
        } else if (label.includes('[ST22]')) {
          sets.add('ST22 - Ace & Newgate');
        } else if (label.includes('[ST23]')) {
          sets.add('ST23 - Shanks');
        } else if (label.includes('[ST24]')) {
          sets.add('ST24 - Jewelry Bonney');
        } else if (label.includes('[ST25]')) {
          sets.add('ST25 - Buggy');
        } else if (label.includes('[ST26]')) {
          sets.add('ST26 - Monkey.D.Luffy');
        } else if (label.includes('[ST27]')) {
          sets.add('ST27 - Marshall.D.Teach');
        } else if (label.includes('[ST28]')) {
          sets.add('ST28 - Yamato');
        }
        
        // Handle promotional cards
        if (label.includes('Promotion') || label.includes('Event Pack') || label.includes('Regional') || label.includes('ONE PIECE DAY')) {
          sets.add('Promotional Cards');
        }
      }
    });
  }
  
  return Array.from(sets);
}

// Function to assign cards to correct set files and build comprehensive set associations
function assignCardsToSets() {
  const cardFiles = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.json'));
  
  // Track cards by their target set
  const cardsBySet = {};
  
  // Track all set associations for each card (cardId -> array of set names)
  const cardSetAssociations = {};
  
  console.log('\n📖 Reading all card files to build set associations...');
  
  // First pass: collect all set associations for each card
  cardFiles.forEach(file => {
    const filePath = path.join(CARDS_DIR, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (setData.cards && Array.isArray(setData.cards)) {
      setData.cards.forEach(card => {
        const cardId = card.cardId;
        
        // Get sets from both cardId and image labels
        const setCode = extractSetCode(cardId);
        const setsFromLabels = extractSetsFromImageLabels(card);
        
        // Combine all sets this card appears in
        const allSets = new Set();
        
        // Add set from cardId
        if (setCode && setCodeToName[setCode]) {
          allSets.add(setCodeToName[setCode]);
        }
        
        // Add sets from image labels
        setsFromLabels.forEach(setName => {
          allSets.add(setName);
        });
        
        // Initialize card associations if not exists
        if (!cardSetAssociations[cardId]) {
          cardSetAssociations[cardId] = [];
        }
        
        // Add all set associations
        allSets.forEach(setName => {
          if (!cardSetAssociations[cardId].some(assoc => assoc.set === setName)) {
            cardSetAssociations[cardId].push({
              set: setName,
              is_default: false // Will be set later
            });
          }
        });
      });
    }
  });
  
  console.log(`📊 Found set associations for ${Object.keys(cardSetAssociations).length} unique cards`);
  
  // Second pass: assign cards to correct set files and determine default sets
  cardFiles.forEach(file => {
    const filePath = path.join(CARDS_DIR, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (setData.cards && Array.isArray(setData.cards)) {
      setData.cards.forEach(card => {
        const cardId = card.cardId;
        const setCode = extractSetCode(cardId);
        
        if (setCode && setCodeToFilename[setCode]) {
          const targetFilename = setCodeToFilename[setCode];
          
          if (!cardsBySet[targetFilename]) {
            cardsBySet[targetFilename] = [];
          }
          
          // Update the card's set associations
          if (cardSetAssociations[cardId]) {
            // Determine which set should be default (primary set from cardId)
            const primarySetName = setCodeToName[setCode];
            cardSetAssociations[cardId].forEach(assoc => {
              assoc.is_default = (assoc.set === primarySetName);
            });
            
            // Update the card with comprehensive set associations
            card.set = cardSetAssociations[cardId];
          }
          
          cardsBySet[targetFilename].push(card);
        } else {
          console.log(`⚠️  Could not determine set for card: ${cardId}`);
        }
      });
    }
  });
  
  console.log('\n📊 Cards found by set:');
  Object.keys(cardsBySet).forEach(filename => {
    console.log(`   ${filename}.json: ${cardsBySet[filename].length} cards`);
  });
  
  // Write cards to their correct set files
  console.log('\n✍️  Writing cards to correct set files...');
  
  Object.keys(cardsBySet).forEach(filename => {
    const filePath = path.join(CARDS_DIR, `${filename}.json`);
    const setCode = Object.keys(setCodeToFilename).find(code => 
      setCodeToFilename[code] === filename
    );
    const setName = setCodeToName[setCode];
    
    const setData = {
      totalCards: cardsBySet[filename].length,
      cards: cardsBySet[filename]
    };
    
    fs.writeFileSync(filePath, JSON.stringify(setData, null, 2));
    console.log(`✅ Updated ${filename}.json with ${cardsBySet[filename].length} cards`);
  });
  
  // Update sets.json with correct totalCards
  console.log('\n📝 Updating sets.json with correct card counts...');
  setsData.sets.forEach(set => {
    const filename = setCodeToFilename[set.code];
    if (filename && cardsBySet[filename]) {
      set.totalCards = cardsBySet[filename].length;
    }
  });
  
  setsData.exportedAt = new Date().toISOString();
  fs.writeFileSync(SETS_FILE, JSON.stringify(setsData, null, 2));
  console.log('✅ Updated sets.json with correct card counts');
  
  // Show some examples of cards with multiple set associations
  console.log('\n📋 Examples of cards with multiple set associations:');
  let multiSetExamples = 0;
  Object.keys(cardSetAssociations).forEach(cardId => {
    if (cardSetAssociations[cardId].length > 1) {
      if (multiSetExamples < 5) { // Show first 5 examples
        console.log(`   ${cardId}: ${cardSetAssociations[cardId].map(s => s.set).join(', ')}`);
      }
      multiSetExamples++;
    }
  });
  console.log(`   ... and ${Math.max(0, multiSetExamples - 5)} more cards with multiple set associations`);
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
    console.log('🔄 Starting card assignment to sets...\n');
    
    assignCardsToSets();
    updateDbJson();
    
    console.log('\n🎉 Card assignment complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 