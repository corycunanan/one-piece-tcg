import fs from 'fs';
import path from 'path';

// Function to extract all variants from HTML sources
function extractVariantsFromHtml() {
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
  
  const missingVariants = {};
  
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
          
          // Only process _r1, _r2 variants (missing ones)
          if (fullId.includes('_r')) {
            const baseId = fullId.replace(/_[r]\d+$/, '');
            
            // Extract image URL
            const imgMatch = section.match(/data-src="([^"]+)"/);
            if (imgMatch) {
              const imageUrl = imgMatch[1];
              
              if (!missingVariants[baseId]) {
                missingVariants[baseId] = [];
              }
              
              missingVariants[baseId].push({
                variantId: fullId,
                imageUrl: imageUrl
              });
            }
          }
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(missingVariants).length} cards with missing variants in HTML sources`);
  return missingVariants;
}

// Function to add missing variants to database
function addMissingVariants(missingVariants) {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  let totalAdded = 0;
  let totalCards = 0;
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let setUpdated = 0;
    
    setData.cards.forEach(card => {
      totalCards++;
      const cardId = card.cardId;
      
      if (missingVariants[cardId]) {
        const variants = missingVariants[cardId];
        
        // Initialize images array if it doesn't exist
        if (!card.images) {
          card.images = [];
        }
        
        // Add missing variants
        variants.forEach(variant => {
          const imageUrl = variant.imageUrl;
          
          // Check if this image is already in the card
          const imageExists = card.images.some(img => {
            if (typeof img === 'string') {
              return img === imageUrl;
            } else if (img.image_url) {
              return img.image_url === imageUrl;
            }
            return false;
          });
          
          if (!imageExists) {
            // Add the missing variant image
            card.images.push({
              image_url: imageUrl,
              label: variant.variantId.replace(cardId + '_', ''),
              artist: "",
              is_default: false
            });
            
            console.log(`🖼️  Added missing variant for ${cardId}: ${variant.variantId}`);
            setUpdated++;
            totalAdded++;
          }
        });
        
        // Update variant count
        if (variants.length > 0) {
          card.variantCount = card.images.length;
          console.log(`📊 ${cardId}: now has ${card.variantCount} art variants`);
        }
      }
    });
    
    if (setUpdated > 0) {
      setData.updatedAt = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(setData, null, 2));
      console.log(`✅ Added ${setUpdated} missing variants in ${file}`);
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total cards processed: ${totalCards}`);
  console.log(`   Total missing variants added: ${totalAdded}`);
  
  return { totalCards, totalAdded };
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
async function addMissingVariantsToDatabase() {
  try {
    console.log('🔄 Adding missing art variants...\n');
    
    // Step 1: Extract missing variants from HTML sources
    console.log('📖 Extracting missing variants from HTML sources...');
    const missingVariants = extractVariantsFromHtml();
    
    if (Object.keys(missingVariants).length === 0) {
      console.log('✅ No missing variants found');
      return;
    }
    
    // Step 2: Add missing variants to database
    console.log('\n📝 Adding missing variants to database...');
    const { totalCards, totalAdded } = addMissingVariants(missingVariants);
    
    // Step 3: Update db.json
    console.log('\n🔄 Updating db.json...');
    updateDbJson();
    
    console.log('\n🎉 Missing variants added successfully!');
    console.log(`📊 Summary:`);
    console.log(`   Total cards processed: ${totalCards}`);
    console.log(`   Total missing variants added: ${totalAdded}`);
    console.log('🔄 JSON Server will automatically reload the changes');
    
  } catch (error) {
    console.error('❌ Adding missing variants failed:', error.message);
  }
}

// Run the script
addMissingVariantsToDatabase(); 