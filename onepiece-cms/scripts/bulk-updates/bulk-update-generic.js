import fs from 'fs';
import path from 'path';

// Configuration for different update types
const UPDATE_CONFIGS = {
  rarity: {
    source: 'html', // 'html', 'csv', 'json'
    field: 'rarity',
    htmlPattern: /<div class="infoCol">\s*<span>[^<]+<\/span>\s*\|\s*<span>([^<]+)<\/span>\s*\|\s*<span>[^<]+<\/span>/i,
    csvColumn: 'rarity'
  },
  power: {
    source: 'html',
    field: 'power',
    htmlPattern: /<div class="power"><h3>Power<\/h3>(\d+)<\/div>/i,
    csvColumn: 'power'
  },
  cost: {
    source: 'html',
    field: 'cost',
    htmlPattern: /<div class="cost"><h3>Cost<\/h3>(\d+)<\/div>/i,
    csvColumn: 'cost'
  }
};

// Function to read data from different sources
function readDataSource(config, sourceType) {
  const data = {};
  
  if (sourceType === 'html') {
    const crawlerDir = path.join(process.cwd(), '..', '..', 'optcg-crawler', 'cards');
    
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
    
    const htmlFiles = findHtmlFiles(crawlerDir);
    console.log(`📁 Found ${htmlFiles.length} HTML files in crawler directory`);
    
    htmlFiles.forEach(filePath => {
      const html = fs.readFileSync(filePath, 'utf8');
      
      // Find all card sections (each card has a modalCol with id like "OP01-015_p1")
      const cardSections = html.match(/<dl class="modalCol" id="([^"]+)">([\s\S]*?)<\/dl>/g);
      
      if (cardSections) {
        cardSections.forEach(section => {
          // Extract card ID from the section ID (e.g., "OP01-015_p1" -> "OP01-015")
          const idMatch = section.match(/id="([^"]+)"/);
          if (idMatch) {
            const fullId = idMatch[1];
            const cardId = fullId.replace(/_p\d+$/, ''); // Remove _p1, _p2, etc.
            
            // Extract the field value using the configured pattern
            const match = section.match(config.htmlPattern);
            if (match) {
              data[cardId] = match[1].trim();
            }
          }
        });
      }
    });
  }
  
  // Add more source types as needed (CSV, JSON, etc.)
  
  return data;
}

// Function to update JSON database
function updateJsonDatabase(updateConfig, sourceData) {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let totalUpdated = 0;
  let totalCards = 0;
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let setUpdated = 0;
    
    setData.cards.forEach(card => {
      totalCards++;
      const cardId = card.cardId;
      
      if (sourceData[cardId]) {
        const oldValue = card[updateConfig.field];
        const newValue = sourceData[cardId];
        
        if (oldValue !== newValue) {
          card[updateConfig.field] = newValue;
          setUpdated++;
          console.log(`🔄 Updated ${cardId} ${updateConfig.field}: ${oldValue} → ${newValue}`);
        }
      }
    });
    
    if (setUpdated > 0) {
      setData.updatedAt = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(setData, null, 2));
      console.log(`✅ Updated ${setUpdated} cards in ${file}`);
      totalUpdated += setUpdated;
    }
  });
  
  return { totalCards, totalUpdated };
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
async function bulkUpdate(fieldType) {
  try {
    const config = UPDATE_CONFIGS[fieldType];
    
    if (!config) {
      console.error(`❌ Unknown field type: ${fieldType}`);
      console.log('Available types:', Object.keys(UPDATE_CONFIGS).join(', '));
      return;
    }
    
    console.log(`🔄 Starting bulk update for ${fieldType}...\n`);
    
    // Read source data
    console.log(`📖 Reading ${config.source} sources...`);
    const sourceData = readDataSource(config, config.source);
    
    if (Object.keys(sourceData).length === 0) {
      console.log('❌ No data found in sources');
      return;
    }
    
    console.log(`📊 Found ${Object.keys(sourceData).length} items with ${fieldType} data`);
    
    // Update database
    console.log('\n📝 Updating JSON database...');
    const { totalCards, totalUpdated } = updateJsonDatabase(config, sourceData);
    
    // Update db.json
    console.log('\n🔄 Updating db.json...');
    updateDbJson();
    
    console.log('\n🎉 Bulk update complete!');
    console.log(`📊 Summary:`);
    console.log(`   Total cards processed: ${totalCards}`);
    console.log(`   Total cards updated: ${totalUpdated}`);
    console.log(`   Field updated: ${fieldType}`);
    
  } catch (error) {
    console.error('❌ Bulk update failed:', error.message);
  }
}

// Get field type from command line argument
const fieldType = process.argv[2] || 'rarity';

console.log(`🎯 Updating field: ${fieldType}`);
bulkUpdate(fieldType); 