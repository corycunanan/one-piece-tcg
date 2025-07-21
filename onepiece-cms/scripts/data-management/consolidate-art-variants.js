import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');

// Function to consolidate art variants into base cards
function consolidateArtVariants() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let totalConsolidated = 0;
  let totalCards = 0;
  let totalVariants = 0;
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Group cards by their base ID (without r1, r2, etc.)
    const cardGroups = {};
    
    setData.cards.forEach(card => {
      totalCards++;
      const cardId = card.cardId;
      
      // Extract base ID (remove r1, r2, r3, etc.)
      const baseId = cardId.replace(/_r\d+$/, '');
      
      if (!cardGroups[baseId]) {
        cardGroups[baseId] = {
          baseCard: null,
          variants: []
        };
      }
      
      // Check if this is a base card or variant
      if (cardId === baseId) {
        // This is the base card
        cardGroups[baseId].baseCard = card;
      } else {
        // This is a variant (r1, r2, etc.)
        cardGroups[baseId].variants.push(card);
        totalVariants++;
      }
    });
    
    // Consolidate variants into base cards
    const consolidatedCards = [];
    let setConsolidated = 0;
    
    Object.keys(cardGroups).forEach(baseId => {
      const group = cardGroups[baseId];
      
      if (group.baseCard) {
        const baseCard = group.baseCard;
        
        // Initialize images array if it doesn't exist
        if (!baseCard.images) {
          baseCard.images = [];
        }
        
        // Add base card's image if it exists
        if (baseCard.image && !baseCard.images.includes(baseCard.image)) {
          baseCard.images.push(baseCard.image);
        }
        
        // Add variant images
        group.variants.forEach(variant => {
          if (variant.image && !baseCard.images.includes(variant.image)) {
            baseCard.images.push(variant.image);
            console.log(`🖼️  Added variant image for ${baseId}: ${variant.image}`);
          }
        });
        
        // Add variant count to base card metadata
        if (group.variants.length > 0) {
          baseCard.variantCount = group.variants.length + 1; // +1 for base card
          console.log(`📊 ${baseId}: ${baseCard.variantCount} art variants (${group.variants.length} + base)`);
        }
        
        consolidatedCards.push(baseCard);
        setConsolidated += group.variants.length;
      } else {
        // No base card found, keep variants as separate entries
        console.log(`⚠️  No base card found for ${baseId}, keeping ${group.variants.length} variants separate`);
        consolidatedCards.push(...group.variants);
      }
    });
    
    // Update the set data
    setData.cards = consolidatedCards;
    setData.updatedAt = new Date().toISOString();
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(setData, null, 2));
    
    if (setConsolidated > 0) {
      console.log(`✅ Consolidated ${setConsolidated} variants in ${file}`);
      totalConsolidated += setConsolidated;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total cards processed: ${totalCards}`);
  console.log(`   Total variants found: ${totalVariants}`);
  console.log(`   Total variants consolidated: ${totalConsolidated}`);
  console.log(`   Cards after consolidation: ${totalCards - totalConsolidated}`);
  
  return { totalCards, totalVariants, totalConsolidated };
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

// Function to analyze current variant situation
function analyzeVariants() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let totalVariants = 0;
  let variantGroups = {};
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    setData.cards.forEach(card => {
      const cardId = card.cardId;
      const baseId = cardId.replace(/_r\d+$/, '');
      
      if (cardId !== baseId) {
        totalVariants++;
        if (!variantGroups[baseId]) {
          variantGroups[baseId] = [];
        }
        variantGroups[baseId].push(cardId);
      }
    });
  });
  
  console.log('\n🔍 Art Variant Analysis:');
  console.log(`   Total variants found: ${totalVariants}`);
  console.log(`   Unique base cards with variants: ${Object.keys(variantGroups).length}`);
  
  if (Object.keys(variantGroups).length > 0) {
    console.log('\n📋 Cards with art variants:');
    Object.keys(variantGroups).forEach(baseId => {
      const variants = variantGroups[baseId];
      console.log(`   ${baseId}: ${variants.length} variants (${variants.join(', ')})`);
    });
  }
  
  return { totalVariants, variantGroups };
}

// Main function
async function consolidateVariants() {
  try {
    console.log('🔄 Starting art variant consolidation...\n');
    
    // Step 1: Analyze current variants
    console.log('🔍 Analyzing current art variants...');
    const { totalVariants, variantGroups } = analyzeVariants();
    
    if (totalVariants === 0) {
      console.log('✅ No art variants found to consolidate');
      return;
    }
    
    // Step 2: Consolidate variants
    console.log('\n📝 Consolidating art variants...');
    const { totalCards, totalVariants: processedVariants, totalConsolidated } = consolidateArtVariants();
    
    // Step 3: Update db.json
    console.log('\n🔄 Updating db.json...');
    updateDbJson();
    
    console.log('\n🎉 Art variant consolidation complete!');
    console.log(`📊 Summary:`);
    console.log(`   Total cards processed: ${totalCards}`);
    console.log(`   Total variants found: ${processedVariants}`);
    console.log(`   Total variants consolidated: ${totalConsolidated}`);
    console.log(`   Cards after consolidation: ${totalCards - totalConsolidated}`);
    console.log('🔄 JSON Server will automatically reload the changes');
    
  } catch (error) {
    console.error('❌ Art variant consolidation failed:', error.message);
  }
}

// Run the script
consolidateVariants(); 