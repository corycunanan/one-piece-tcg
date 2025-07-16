import fs from 'fs';
import path from 'path';

// Function to read HTML sources and extract power data
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
          
          // Extract power value
          const powerMatch = section.match(/<div class="power"><h3>Power<\/h3>(\d+)<\/div>/i);
          if (powerMatch) {
            cardData[cardId] = parseInt(powerMatch[1]);
          }
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(cardData).length} cards with power data from HTML sources`);
  return cardData;
}

// Function to validate and update power values
function updatePowerValues(htmlCardData) {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let totalUpdated = 0;
  let totalCards = 0;
  let stageCardsFixed = 0;
  let eventCardsFixed = 0;
  let invalidPowerFixed = 0;
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let setUpdated = 0;
    
    setData.cards.forEach(card => {
      totalCards++;
      const cardId = card.cardId;
      const cardType = card.cardType;
      
      // Check if this is a stage card that shouldn't have power
      if (cardType === 'STAGE' && card.power !== null && card.power !== undefined) {
        console.log(`🔧 Fixed stage card ${cardId}: removed invalid power ${card.power}`);
        card.power = null;
        setUpdated++;
        stageCardsFixed++;
      }
      // Check if this is an event card that shouldn't have power
      else if (cardType === 'EVENT' && card.power !== null && card.power !== undefined) {
        console.log(`🔧 Fixed event card ${cardId}: removed invalid power ${card.power}`);
        card.power = null;
        setUpdated++;
        eventCardsFixed++;
      }
      // Check if we have HTML data for this card
      else if (htmlCardData[cardId]) {
        const oldPower = card.power;
        const newPower = htmlCardData[cardId];
        
        // Only update if the value is actually different
        if (oldPower !== newPower) {
          // Additional validation for stage and event cards
          if ((cardType === 'STAGE' || cardType === 'EVENT') && newPower !== null) {
            console.log(`⚠️  Warning: ${cardType.toLowerCase()} card ${cardId} has power ${newPower} in HTML, setting to null`);
            card.power = null;
            invalidPowerFixed++;
          } else {
            console.log(`🔄 Updated ${cardId} power: ${oldPower} → ${newPower}`);
            card.power = newPower;
          }
          setUpdated++;
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
  console.log(`   Stage cards fixed: ${stageCardsFixed}`);
  console.log(`   Event cards fixed: ${eventCardsFixed}`);
  console.log(`   Invalid power values fixed: ${invalidPowerFixed}`);
  
  return { totalCards, totalUpdated, stageCardsFixed, eventCardsFixed, invalidPowerFixed };
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

// Function to analyze power data issues
function analyzePowerIssues() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let stageCardsWithPower = [];
  let eventCardsWithPower = [];
  let cardsWithInvalidPower = [];
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    setData.cards.forEach(card => {
      const cardId = card.cardId;
      const cardType = card.cardType;
      const power = card.power;
      
      // Find stage cards with power
      if (cardType === 'STAGE' && power !== null && power !== undefined) {
        stageCardsWithPower.push({
          cardId,
          power,
          setName: setData.set
        });
      }
      
      // Find event cards with power
      if (cardType === 'EVENT' && power !== null && power !== undefined) {
        eventCardsWithPower.push({
          cardId,
          power,
          setName: setData.set
        });
      }
      
      // Find cards with obviously invalid power values (like 22122000)
      if (power && power > 100000) {
        cardsWithInvalidPower.push({
          cardId,
          power,
          cardType,
          setName: setData.set
        });
      }
    });
  });
  
  console.log('\n🔍 Power Data Analysis:');
  console.log(`   Stage cards with power: ${stageCardsWithPower.length}`);
  console.log(`   Event cards with power: ${eventCardsWithPower.length}`);
  console.log(`   Cards with invalid power (>100k): ${cardsWithInvalidPower.length}`);
  
  if (stageCardsWithPower.length > 0) {
    console.log('\n📋 Stage cards with power:');
    stageCardsWithPower.forEach(card => {
      console.log(`   ${card.cardId} (${card.setName}): ${card.power}`);
    });
  }
  
  if (eventCardsWithPower.length > 0) {
    console.log('\n📋 Event cards with power:');
    eventCardsWithPower.forEach(card => {
      console.log(`   ${card.cardId} (${card.setName}): ${card.power}`);
    });
  }
  
  if (cardsWithInvalidPower.length > 0) {
    console.log('\n📋 Cards with invalid power values:');
    cardsWithInvalidPower.forEach(card => {
      console.log(`   ${card.cardId} (${card.setName}): ${card.power} (${card.cardType})`);
    });
  }
  
  return { stageCardsWithPower, eventCardsWithPower, cardsWithInvalidPower };
}

// Main function
async function bulkUpdatePower() {
  try {
    console.log('🔄 Starting bulk power update...\n');
    
    // Step 1: Analyze current issues
    console.log('🔍 Analyzing current power data issues...');
    const issues = analyzePowerIssues();
    
    // Step 2: Read HTML sources
    console.log('\n📖 Reading HTML sources from crawler...');
    const htmlCardData = readHtmlSources();
    
    if (Object.keys(htmlCardData).length === 0) {
      console.log('❌ No card data found in HTML sources');
      return;
    }
    
    // Step 3: Update power values
    console.log('\n📝 Updating power values...');
    const { totalCards, totalUpdated, stageCardsFixed, eventCardsFixed, invalidPowerFixed } = updatePowerValues(htmlCardData);
    
    // Step 4: Update db.json
    console.log('\n🔄 Updating db.json...');
    updateDbJson();
    
    console.log('\n🎉 Bulk power update complete!');
    console.log(`📊 Summary:`);
    console.log(`   Total cards processed: ${totalCards}`);
    console.log(`   Total cards updated: ${totalUpdated}`);
    console.log(`   Stage cards fixed: ${stageCardsFixed}`);
    console.log(`   Event cards fixed: ${eventCardsFixed}`);
    console.log(`   Invalid power values fixed: ${invalidPowerFixed}`);
    console.log('🔄 JSON Server will automatically reload the changes');
    
  } catch (error) {
    console.error('❌ Bulk power update failed:', error.message);
  }
}

// Run the script
bulkUpdatePower(); 