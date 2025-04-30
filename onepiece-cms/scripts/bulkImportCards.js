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
const AUTH_TOKEN = process.env.STRAPI_API_TOKEN;

// Debug logging for environment variables
console.log('🔐 Authentication configuration:');
console.log(`  - Base URL: ${BASE_URL}`);
console.log(`  - API Token: ${AUTH_TOKEN ? '✅ Set (starts with: ' + AUTH_TOKEN.substring(0, 8) + '...)' : '❌ Not set'}`);
console.log(`  - API Token length: ${AUTH_TOKEN ? AUTH_TOKEN.length : 0} characters`);
console.log(`  - Cards API URL: ${CARDS_API_URL}`);

let successCount = 0;
let failureCount = 0;
let skippedCount = 0;
let relationErrorCount = 0;

// Map of set codes to their full enum values
const SET_CODE_TO_ENUM = {
  'OP01': 'OP01 - Romance Dawn',
  'OP02': 'OP02 - Paramount War',
  'OP03': 'OP03 - Pillars of Strength',
  'OP04': 'OP04 - Kingdoms of Intrigue',
  'OP05': 'OP05 - Awakening of the New Era',
  'OP06': 'OP06 - Wings of the Captain',
  'OP07': 'OP07 - 500 Years in the Future',
  'OP08': 'OP08 - Two Legends',
  'OP09': 'OP09 - Emperors in the New World',
  'OP10': 'OP10 - Royal Blood',
  'OP11': 'OP11 - A Fist of Divine Speed',
  'EB01': 'EB01 - Memorial Collection',
  'EB02': 'EB02 - Anime 25th Collection',
  'PRB01': 'PRB01 - One Piece The Best',
  'ST01': 'ST01 - Straw Hat Crew',
  'ST02': 'ST02 - Worst Generation',
  'ST03': 'ST03 - The Seven Warlords of the Sea',
  'ST04': 'ST04 - Animal Kingdom Pirates',
  'ST05': 'ST05 - One Piece Film Edition',
  'ST06': 'ST06 - Absolute Justice',
  'ST07': 'ST07 - Big Mom Pirates',
  'ST08': 'ST08 - Monkey D. Luffy',
  'ST09': 'ST09 - Yamato',
  'ST10': 'ST10 - The Three Captains',
  'ST11': 'ST11 - Uta',
  'ST12': 'ST12 - Zoro & Sanji',
  'ST13': 'ST13 - The Three Brothers',
  'ST14': 'ST14 - 3D2Y',
  'ST15': 'ST15 - Edward Newgate',
  'ST16': 'ST16 - Uta',
  'ST17': 'ST17 - Donquixote Doflamingo',
  'ST18': 'ST18 - Monkey D. Luffy',
  'ST19': 'ST19 - Smoker',
  'ST20': 'ST20 - Charlotte Katakuri',
  'ST21': 'ST21 - Gear 5',
  'ST22': 'ST22 - Ace & Newgate'
};

// Main import function
async function importCards() {
  console.log(`📋 Using set enum values from CMS configuration`);
  console.log(`✅ Found ${Object.keys(SET_CODE_TO_ENUM).length} set mappings.`);
  
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
      const matchingSetEnum = SET_CODE_TO_ENUM[setCode];

      // Validate that we have a valid set enum value
      if (!matchingSetEnum) {
        console.error(`❌ No matching set enum value found for code: ${setCode} (card: ${card.cardId})`);
        console.error(`   This set code may not be configured in the CMS schema.`);
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
        // Use the set enum value directly
        set: matchingSetEnum,
        publishedAt: new Date().toISOString(),
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
        
        // Check for validation errors related to the set field
        if (errorData.error.message.includes('set')) {
          console.error(`  - SET ERROR: Issue with the set field for card ${card.cardId}`);
          console.error(`  - Set value used: ${matchingSetEnum}`);
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
