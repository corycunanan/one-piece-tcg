import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load cleaned cards
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, 'cards.cleaned.json'), 'utf8'));

// Your Strapi API URLs
const BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const CARDS_API_URL = `${BASE_URL}/api/cards`;
const SETS_API_URL = `${BASE_URL}/api/sets`;
const AUTH_TOKEN = process.env.STRAPI_API_TOKEN;

let successCount = 0;
let failureCount = 0;
let skippedCount = 0;
let relationErrorCount = 0;

// Function to fetch all sets from Strapi
async function fetchAllSets() {
  try {
    console.log('📊 Fetching all sets from Strapi...');
    const response = await axios.get(`${SETS_API_URL}?pagination[pageSize]=100`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      }
    });
    
    // Log the response structure to help debug
    console.log('API Response structure:', Object.keys(response.data));
    
    const sets = response.data.data || [];
    console.log(`✅ Successfully fetched ${sets.length} sets.`);
    
    if (sets.length > 0) {
      console.log('First set structure:', Object.keys(sets[0]));
    }
    
    // Build dynamic mapping of set codes to IDs
    const setCodeToId = {};
    sets.forEach(set => {
      // Handle both possible data structures
      const code = set.code || (set.attributes ? set.attributes.code : null);
      
      if (code) {
        setCodeToId[code] = set.id;
        console.log(`  - Found set: ${code} (ID: ${set.id})`);
      } else {
        console.warn(`  - Set with ID ${set.id} has no code, skipping`);
      }
    });
    
    return setCodeToId;
  } catch (error) {
    console.error('❌ Failed to fetch sets:', error.message);
    process.exit(1);
  }
}

// Main import function
async function importCards() {
  // Dynamically build set code to ID mapping
  const setCodeToId = await fetchAllSets();
  
  // Validate set mapping before proceeding
  if (Object.keys(setCodeToId).length === 0) {
    console.error('❌ No valid sets found in the CMS.');
    console.error('   Please ensure the set enumeration values are configured correctly in Strapi.');
    process.exit(1);
  }
  
  console.log(`\n🚀 Attempting to import ${cards.length} cards...`);

  for (const card of cards) {
    try {
      // Check if card already exists to avoid duplicates
      const existingResponse = await axios.get(`${CARDS_API_URL}?filters[cardId][$eq]=${card.cardId}`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        }
      });
      
      if (existingResponse.data.data.length > 0) {
        console.log(`⏩ Skipping ${card.cardId}: already exists in database`);
        skippedCount++;
        continue;
      }
      
      // Extract setCode from cardId
      const setCode = card.cardId.split('-')[0];
      const matchingSetId = setCodeToId[setCode];

      // Validate that we have a valid set relation
      if (!matchingSetId) {
        console.error(`❌ No matching Set ID found for code: ${setCode} (card: ${card.cardId})`);
        relationErrorCount++;
        failureCount++;
        continue;
      }

      // ✅ Build a clean card object with proper relation format
      const cleanedCard = {
        cardId: card.cardId,
        name: card.name,
        type: card.type,
        power: card.power || null,
        cost: card.cost || null,
        counter: card.counter || null,
        life: card.life || null,
        rarity: card.rarity,
        keywords: card.keywords || [],
        colors: card.colors || [],
        traits: card.traits || [],
        attributes: card.attributes || [],
        effect_description: card.effect_description || null,
        effect_logic: card.effect_logic || [],
        has_trigger: card.has_trigger || false,
        trigger_description: card.trigger_description || null,
        trigger_effect: card.trigger_effect || [],
        images: card.images || [],
        // Corrected Strapi v4 relation format - use direct ID reference
        set: matchingSetId
      };

      // POST to Strapi
      await axios.post(CARDS_API_URL, { data: cleanedCard }, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Successfully imported: ${card.name}`);
      successCount++;
    } catch (error) {
    console.error(`❌ Failed to import: ${card.name} (${card.cardId})`);
    
    // Improved error handling with specific relation error detection
    if (error.response) {
      const errorData = error.response.data;
      const statusCode = error.response.status;
      
      console.error(`  - Status Code: ${statusCode}`);
      
      // Check for common relation error patterns
      if (errorData.error) {
        console.error(`  - Error Message: ${errorData.error.message}`);
        
        // Check for various relation error patterns
        if (errorData.error.message.includes('relation') || 
            errorData.error.message.includes('foreign key') ||
            errorData.error.message.includes('Invalid relation') ||
            errorData.error.message.includes('connect')) {
          console.error(`  - RELATION ERROR: Issue with the set relation for card ${card.cardId}`);
          console.error(`  - Set ID used: ${matchingSetId}`);
          relationErrorCount++;
        } else {
          console.error(`  - Detailed Server Response:`, JSON.stringify(errorData, null, 2));
        }
      } else {
        console.error(`  - Server Response:`, JSON.stringify(errorData, null, 2));
      }
    } else {
      console.error(`  - ${error.message}`);
    }
    
      failureCount++;
    }
  } // End of for loop
}

// Run the import process
// Run the import process
importCards().then(() => {
  console.log(`\n📋 Import Summary:`);
  console.log(`✔ ${successCount} cards imported successfully.`);
  console.log(`⏩ ${skippedCount} cards skipped (already exist).`);
  console.log(`❌ ${failureCount} cards failed.`);
  console.log(`   ↳ ${relationErrorCount} failed due to relation errors.`);
}).catch(error => {
  console.error('\n❌ Fatal error during import process:', error.message);
  process.exit(1);
});
