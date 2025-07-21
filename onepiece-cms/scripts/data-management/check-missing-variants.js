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
  
  const allVariants = {};
  
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
          const baseId = fullId.replace(/_[pr]\d+$/, ''); // Remove _p1, _r1, etc.
          
          if (!allVariants[baseId]) {
            allVariants[baseId] = [];
          }
          
          if (!allVariants[baseId].includes(fullId)) {
            allVariants[baseId].push(fullId);
          }
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(allVariants).length} unique cards with variants in HTML sources`);
  return allVariants;
}

// Function to check what variants are in the database
function checkDatabaseVariants() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  
  const dbVariants = {};
  
  cardFiles.forEach(file => {
    const filePath = path.join(dataDir, file);
    const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    setData.cards.forEach(card => {
      const cardId = card.cardId;
      
      if (card.images && card.images.length > 0) {
        dbVariants[cardId] = {
          variantCount: card.images.length,
          images: card.images.map(img => {
            if (typeof img === 'string') {
              return img;
            } else if (img.image_url) {
              return img.image_url;
            }
            return null;
          }).filter(Boolean)
        };
      }
    });
  });
  
  console.log(`📊 Found ${Object.keys(dbVariants).length} cards with variants in database`);
  return dbVariants;
}

// Function to compare HTML sources with database
function compareVariants(htmlVariants, dbVariants) {
  const missingVariants = {};
  const extraVariants = {};
  
  // Check for missing variants
  Object.keys(htmlVariants).forEach(baseId => {
    const htmlVariantList = htmlVariants[baseId];
    const dbVariant = dbVariants[baseId];
    
    if (dbVariant) {
      // Check if all HTML variants are in database
      htmlVariantList.forEach(variantId => {
        const variantSuffix = variantId.replace(baseId, '');
        const hasVariant = dbVariant.images.some(img => img.includes(variantSuffix));
        
        if (!hasVariant) {
          if (!missingVariants[baseId]) {
            missingVariants[baseId] = [];
          }
          missingVariants[baseId].push(variantId);
        }
      });
    } else {
      // Card not found in database
      missingVariants[baseId] = htmlVariantList;
    }
  });
  
  // Check for extra variants in database
  Object.keys(dbVariants).forEach(baseId => {
    const htmlVariantList = htmlVariants[baseId] || [];
    const dbVariant = dbVariants[baseId];
    
    if (htmlVariantList.length === 0) {
      extraVariants[baseId] = dbVariant;
    }
  });
  
  return { missingVariants, extraVariants };
}

// Main function
async function checkMissingVariants() {
  try {
    console.log('🔍 Checking for missing art variants...\n');
    
    // Step 1: Extract variants from HTML sources
    console.log('📖 Extracting variants from HTML sources...');
    const htmlVariants = extractVariantsFromHtml();
    
    // Step 2: Check database variants
    console.log('\n📊 Checking database variants...');
    const dbVariants = checkDatabaseVariants();
    
    // Step 3: Compare and report
    console.log('\n🔍 Comparing HTML sources with database...');
    const { missingVariants, extraVariants } = compareVariants(htmlVariants, dbVariants);
    
    console.log('\n📋 Results:');
    console.log(`   Cards with missing variants: ${Object.keys(missingVariants).length}`);
    console.log(`   Cards with extra variants: ${Object.keys(extraVariants).length}`);
    
    if (Object.keys(missingVariants).length > 0) {
      console.log('\n❌ Missing variants:');
      Object.keys(missingVariants).forEach(baseId => {
        const missing = missingVariants[baseId];
        console.log(`   ${baseId}: missing ${missing.join(', ')}`);
      });
    }
    
    if (Object.keys(extraVariants).length > 0) {
      console.log('\n➕ Extra variants in database:');
      Object.keys(extraVariants).forEach(baseId => {
        const extra = extraVariants[baseId];
        console.log(`   ${baseId}: ${extra.variantCount} variants`);
      });
    }
    
    // Check specific card
    if (htmlVariants['OP01-025']) {
      console.log('\n🔍 OP01-025 variants:');
      console.log(`   HTML sources: ${htmlVariants['OP01-025'].join(', ')}`);
      if (dbVariants['OP01-025']) {
        console.log(`   Database: ${dbVariants['OP01-025'].variantCount} variants`);
        console.log(`   Database images: ${dbVariants['OP01-025'].images.join(', ')}`);
      } else {
        console.log(`   Database: Not found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the script
checkMissingVariants(); 