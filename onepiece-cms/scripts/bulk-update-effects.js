import fs from 'fs';
import path from 'path';

// Function to read HTML sources and extract effect descriptions
function readHtmlSources() {
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
  
  const cardData = {};
  
  htmlFiles.forEach(filePath => {
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Find all card sections
    const cardSections = html.match(/<dl class="modalCol" id="([^"]+)">([\s\S]*?)<\/dl>/g);
    
    if (cardSections) {
      cardSections.forEach(section => {
        // Extract card ID from the section ID
        const idMatch = section.match(/id="([^"]+)"/);
        if (idMatch) {
          const fullId = idMatch[1];
          const cardId = fullId.replace(/_p\d+$/, ''); // Remove _p1, _p2, etc.
          
          // Extract effect description (robust to whitespace/line breaks)
          const effectMatch = section.match(/<div\s+class=["']text["']>\s*<h3>Effect<\/h3>([\s\S]*?)<\/div>/i);
          let effectDescription = '';
          if (effectMatch) {
            effectDescription = effectMatch[1]
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
          }
          // Debug: Print for EB01-001
          if (cardId === 'EB01-001') {
            console.log(`DEBUG: EB01-001 effect found:`, effectDescription);
          }
          
          // Store data for base card (not variants)
          if (fullId === cardId) {
            if (effectDescription) {
              cardData[cardId] = effectDescription;
            }
          }
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(cardData).length} cards with effect descriptions from HTML sources`);
  
  // Debug: Show first few card IDs found
  const sampleCardIds = Object.keys(cardData).slice(0, 10);
  console.log(`📋 Sample card IDs found: ${sampleCardIds.join(', ')}`);
  
  return cardData;
}

// Function to update JSON database with effect descriptions
function updateJsonDatabase(htmlCardData) {
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
      
      if (htmlCardData[cardId]) {
        const oldEffect = card.effect_description || '';
        const newEffect = htmlCardData[cardId];
        
        if (oldEffect !== newEffect) {
          card.effect_description = newEffect;
          setUpdated++;
          console.log(`📝 Updated effect for ${cardId}: ${newEffect.substring(0, 50)}...`);
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
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total cards processed: ${totalCards}`);
  console.log(`   Total cards updated: ${totalUpdated}`);
  
  return totalUpdated;
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
async function bulkUpdateEffects() {
  try {
    console.log('🔄 Starting bulk effect description update...\n');
    
    // Step 1: Read HTML sources
    console.log('📖 Reading HTML sources from crawler...');
    const htmlCardData = readHtmlSources();
    
    if (Object.keys(htmlCardData).length === 0) {
      console.log('❌ No card data found in HTML sources');
      return;
    }
    
    // Step 2: Update JSON database
    console.log('\n📝 Updating JSON database...');
    const updatedCount = updateJsonDatabase(htmlCardData);
    
    // Step 3: Update db.json for JSON Server
    console.log('\n🔄 Updating db.json...');
    updateDbJson();
    
    console.log('\n🎉 Bulk update complete!');
    console.log(`📊 Updated ${updatedCount} cards with effect descriptions`);
    console.log('🔄 JSON Server will automatically reload the changes');
    
  } catch (error) {
    console.error('❌ Bulk update failed:', error.message);
  }
}

// Run the script
bulkUpdateEffects(); 