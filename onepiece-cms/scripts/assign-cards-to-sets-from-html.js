import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', 'data', 'cards');
const SETS_FILE = path.join(__dirname, '..', '..', 'data', 'sets', 'sets.json');
const HTML_DIR = path.join(__dirname, '..', '..', 'optcg-crawler', 'cards');

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

// Function to read HTML sources and extract card set associations
function readHtmlSources() {
  console.log('📖 Reading HTML sources...');
  
  // Recursively find all HTML files
  function findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findHtmlFiles(fullPath));
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const htmlFiles = findHtmlFiles(HTML_DIR);
  console.log(`📁 Found ${htmlFiles.length} HTML files`);
  
  // Track card appearances by set
  const cardAppearances = {}; // cardId -> { setCode: count }
  
  htmlFiles.forEach(filePath => {
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Extract set code from filename or path
    let setCode = null;
    const fileName = path.basename(filePath, '.html');
    
    // Try to extract set code from filename
    if (fileName.includes('op01')) setCode = 'OP01';
    else if (fileName.includes('op02')) setCode = 'OP02';
    else if (fileName.includes('op03')) setCode = 'OP03';
    else if (fileName.includes('op04')) setCode = 'OP04';
    else if (fileName.includes('op05')) setCode = 'OP05';
    else if (fileName.includes('op06')) setCode = 'OP06';
    else if (fileName.includes('op07')) setCode = 'OP07';
    else if (fileName.includes('op08')) setCode = 'OP08';
    else if (fileName.includes('op09')) setCode = 'OP09';
    else if (fileName.includes('op10')) setCode = 'OP10';
    else if (fileName.includes('op11')) setCode = 'OP11';
    else if (fileName.includes('eb01')) setCode = 'EB01';
    else if (fileName.includes('eb02')) setCode = 'EB02';
    else if (fileName.includes('prb01')) setCode = 'PRB01';
    else if (fileName.includes('st01')) setCode = 'ST01';
    else if (fileName.includes('st02')) setCode = 'ST02';
    else if (fileName.includes('st03')) setCode = 'ST03';
    else if (fileName.includes('st04')) setCode = 'ST04';
    else if (fileName.includes('st05')) setCode = 'ST05';
    else if (fileName.includes('st06')) setCode = 'ST06';
    else if (fileName.includes('st07')) setCode = 'ST07';
    else if (fileName.includes('st08')) setCode = 'ST08';
    else if (fileName.includes('st09')) setCode = 'ST09';
    else if (fileName.includes('st10')) setCode = 'ST10';
    else if (fileName.includes('st11')) setCode = 'ST11';
    else if (fileName.includes('st12')) setCode = 'ST12';
    else if (fileName.includes('st13')) setCode = 'ST13';
    else if (fileName.includes('st14')) setCode = 'ST14';
    else if (fileName.includes('st15')) setCode = 'ST15';
    else if (fileName.includes('st16')) setCode = 'ST16';
    else if (fileName.includes('st17')) setCode = 'ST17';
    else if (fileName.includes('st18')) setCode = 'ST18';
    else if (fileName.includes('st19')) setCode = 'ST19';
    else if (fileName.includes('st20')) setCode = 'ST20';
    else if (fileName.includes('st21')) setCode = 'ST21';
    else if (fileName.includes('st22')) setCode = 'ST22';
    else if (fileName.includes('st23')) setCode = 'ST23';
    else if (fileName.includes('st24')) setCode = 'ST24';
    else if (fileName.includes('st25')) setCode = 'ST25';
    else if (fileName.includes('st26')) setCode = 'ST26';
    else if (fileName.includes('st27')) setCode = 'ST27';
    else if (fileName.includes('st28')) setCode = 'ST28';
    else if (fileName.includes('promotion')) setCode = 'P';
    
    if (!setCode) {
      console.log(`⚠️  Could not determine set code for file: ${fileName}`);
      return;
    }
    
    // Find all card sections in the HTML
    const cardSections = html.match(/<dl class="modalCol" id="([^"]+)">([\s\S]*?)<\/dl>/g);
    
    if (cardSections) {
      cardSections.forEach(section => {
        // Extract card ID from the section ID
        const idMatch = section.match(/id="([^"]+)"/);
        if (idMatch) {
          const fullCardId = idMatch[1];
          
          // Extract the base card ID (remove variant suffixes like _p1, _p2, _p3)
          const baseCardId = fullCardId.replace(/_\w+$/, '');
          
          // Initialize card appearances if not exists
          if (!cardAppearances[baseCardId]) {
            cardAppearances[baseCardId] = {};
          }
          
          // Track this appearance
          cardAppearances[baseCardId][setCode] = (cardAppearances[baseCardId][setCode] || 0) + 1;
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(cardAppearances).length} unique cards in HTML sources`);
  
  return cardAppearances;
}

// Function to assign cards to correct set files and build comprehensive set associations
function assignCardsToSets(htmlCardData) {
  const cardFiles = fs.readdirSync(CARDS_DIR).filter(f => f.endsWith('.json'));
  
  // Track cards by their target set
  const cardsBySet = {};
  
  console.log('\n📖 Processing cards and building set associations...');
  
  cardFiles.forEach(file => {
    const filePath = path.join(CARDS_DIR, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (setData.cards && Array.isArray(setData.cards)) {
      setData.cards.forEach(card => {
        const cardId = card.cardId;
        const primarySetCode = extractSetCode(cardId);
        
        if (primarySetCode && setCodeToFilename[primarySetCode]) {
          const targetFilename = setCodeToFilename[primarySetCode];
          
          if (!cardsBySet[targetFilename]) {
            cardsBySet[targetFilename] = [];
          }
          
          // Build comprehensive set associations from HTML data
          const setAssociations = [];
          
          if (htmlCardData[cardId]) {
            // Add all sets this card appears in
            Object.keys(htmlCardData[cardId]).forEach(setCode => {
              if (setCodeToName[setCode]) {
                setAssociations.push({
                  set: setCodeToName[setCode],
                  is_default: (setCode === primarySetCode)
                });
              }
            });
          }
          
          // If no HTML data found, use primary set only
          if (setAssociations.length === 0 && primarySetCode && setCodeToName[primarySetCode]) {
            setAssociations.push({
              set: setCodeToName[primarySetCode],
              is_default: true
            });
          }
          
          // Update the card's set associations
          card.set = setAssociations;
          
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
  Object.keys(cardsBySet).forEach(filename => {
    cardsBySet[filename].forEach(card => {
      if (card.set && card.set.length > 1) {
        if (multiSetExamples < 5) {
          console.log(`   ${card.cardId}: ${card.set.map(s => s.set).join(', ')}`);
        }
        multiSetExamples++;
      }
    });
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
    console.log('🔄 Starting card assignment to sets from HTML sources...\n');
    
    // Step 1: Read HTML sources
    const htmlCardData = readHtmlSources();
    
    if (Object.keys(htmlCardData).length === 0) {
      console.log('❌ No card data found in HTML sources');
      return;
    }
    
    // Step 2: Assign cards to sets
    assignCardsToSets(htmlCardData);
    
    // Step 3: Update db.json
    updateDbJson();
    
    console.log('\n🎉 Card assignment complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 