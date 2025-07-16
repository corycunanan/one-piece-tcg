import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3001';

// Function to read HTML sources (same as before)
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
    
    // Extract card ID from filename (assuming format like "OP01-001.html")
    const fileName = path.basename(filePath);
    const cardId = fileName.replace('.html', '');
    
    // Extract rarity from HTML (adjust based on your HTML structure)
    const rarityMatch = html.match(/rarity["\s]*:["\s]*([^"}\s]+)/i);
    const rarity = rarityMatch ? rarityMatch[1] : null;
    
    if (rarity) {
      cardData[cardId] = rarity;
    }
  });
  
  return cardData;
}

// Function to update cards via API
async function updateCardsViaApi(htmlCardData) {
  try {
    // Get all cards from API
    console.log('📡 Fetching cards from API...');
    const response = await axios.get(`${API_BASE}/cards`);
    const cards = response.data;
    
    let updatedCount = 0;
    
    // Update each card that has new data
    for (const card of cards) {
      const cardId = card.cardId;
      
      if (htmlCardData[cardId]) {
        const oldRarity = card.rarity;
        const newRarity = htmlCardData[cardId];
        
        if (oldRarity !== newRarity) {
          // Update the card via API
          await axios.put(`${API_BASE}/cards/${card.id}`, {
            ...card,
            rarity: newRarity
          });
          
          console.log(`🔄 Updated ${cardId}: ${oldRarity} → ${newRarity}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\n📊 Updated ${updatedCount} cards via API`);
    return updatedCount;
    
  } catch (error) {
    console.error('❌ API update failed:', error.message);
    return 0;
  }
}

// Main function
async function bulkUpdateViaApi() {
  try {
    console.log('🔄 Starting bulk update via API...\n');
    
    // Read HTML sources
    console.log('📖 Reading HTML sources...');
    const htmlCardData = readHtmlSources();
    
    if (Object.keys(htmlCardData).length === 0) {
      console.log('❌ No card data found in HTML sources');
      return;
    }
    
    // Update via API
    console.log('\n📡 Updating cards via API...');
    const updatedCount = await updateCardsViaApi(htmlCardData);
    
    console.log('\n🎉 Bulk update complete!');
    console.log(`📊 Updated ${updatedCount} cards via API`);
    
  } catch (error) {
    console.error('❌ Bulk update failed:', error.message);
  }
}

// Run the script
bulkUpdateViaApi(); 