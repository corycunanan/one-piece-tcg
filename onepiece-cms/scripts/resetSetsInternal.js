/**
 * Script to reset and recreate sets using Strapi's entity service directly.
 * This script must be executed within Strapi's context.
 * 
 * Run with: NODE_ENV=development node scripts/resetSetsInternal.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createRequire } from 'module';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = process.cwd();

// We'll load Strapi dynamically in the bootstrap function

// Set data - canonical source of set information
const setsToCreate = [
  {
    name: 'Romance Dawn',
    code: 'OP01',
    release_date: '2022-07-08',
    region: 'EN',
  },
  {
    name: 'Paramount War',
    code: 'OP02',
    release_date: '2022-09-09',
    region: 'EN',
  },
  {
    name: 'Pillars of Strength',
    code: 'OP03',
    release_date: '2022-11-11',
    region: 'EN',
  },
  {
    name: 'Kingdoms of Intrigue',
    code: 'OP04',
    release_date: '2023-01-27',
    region: 'EN',
  },
  {
    name: 'Awakening of the New Era',
    code: 'OP05',
    release_date: '2023-05-26',
    region: 'EN',
  },
  {
    name: 'Rule of the Three Powers',
    code: 'OP06',
    release_date: '2023-09-01',
    region: 'EN',
  }
];

// Statistics tracking
let existingSets = 0;
let deletedSets = 0;
let createdSets = 0;
let failures = 0;

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to reset sets
async function resetSets(strapi) {
  try {
    console.log('\n🔄 Starting Set Reset Process using Strapi Entity Service...');

    // Get the entity service
    const entityService = strapi.entityService;
    
    // 1. Find all existing sets
    console.log('📊 Finding all existing sets...');
    const existingSetRecords = await entityService.findMany('api::set.set', {
      fields: ['id', 'name', 'code'],
      populate: { cards: true },
    });
    
    existingSets = existingSetRecords.length;
    console.log(`✅ Found ${existingSets} existing sets.`);
    
    // 2. Delete all existing sets
    if (existingSets > 0) {
      console.log('\n🗑️ Deleting all existing sets...');
      
      // Use a transaction to ensure all-or-nothing behavior
      await strapi.db.transaction(async ({ trx }) => {
        for (const set of existingSetRecords) {
          try {
            console.log(`  - Deleting set: ${set.code} (${set.name}) with ID ${set.id}...`);
            
            // Check if set has cards and handle appropriately
            if (set.cards && set.cards.length > 0) {
              console.log(`    - Set has ${set.cards.length} linked cards. Updating card relations...`);
              
              // Option 1: Disconnect cards from set
              for (const card of set.cards) {
                await entityService.update('api::card.card', card.id, {
                  data: {
                    set: null,
                  },
                  // Pass transaction context
                  populate: false,
                });
              }
            }
            
            // Now delete the set
            await entityService.delete('api::set.set', set.id, {
              // Pass simpler options
              populate: false,
            });
            
            console.log(`  - ✅ Successfully deleted set: ${set.code} (ID: ${set.id})`);
            deletedSets++;
          } catch (error) {
            console.error(`  - ❌ Failed to delete set ${set.code} (ID: ${set.id}):`, error.message);
            failures++;
            throw error; // Rollback transaction
          }
        }
      });
      
      console.log('✅ All sets deleted successfully');
    } else {
      console.log('🗑️ No existing sets to delete.');
    }
    
    // 3. Create new sets
    console.log('\n🆕 Creating new sets with proper information...');
    
    // Use a transaction to ensure all-or-nothing behavior
    await strapi.db.transaction(async ({ trx }) => {
      for (const setData of setsToCreate) {
        try {
          console.log(`  - Creating set: ${setData.code} (${setData.name})...`);
          
          // Clean data for creation
          const cleanData = {
            ...setData,
            publishedAt: new Date(), // Explicitly set published state
          };
          
          // Create the set
          const createdSet = await entityService.create('api::set.set', {
            data: cleanData,
            // Simpler options
            populate: true,
          });
          
          console.log(`  - ✅ Successfully created set: ${setData.code} (ID: ${createdSet.id})`);
          createdSets++;
        } catch (error) {
          console.error(`  - ❌ Failed to create set ${setData.code}:`, error.message);
          failures++;
          throw error; // Rollback transaction
        }
      }
    });
    
    // 4. Verify all sets were created successfully
    console.log('\n🔍 Verifying all sets were created...');
    let allVerified = true;
    
    for (const setData of setsToCreate) {
      try {
        console.log(`  - Verifying set ${setData.code} exists...`);
        
        const foundSets = await entityService.findMany('api::set.set', {
          filters: { code: setData.code },
          fields: ['id', 'name', 'code', 'release_date', 'region'],
        });
        
        if (foundSets && foundSets.length > 0) {
          console.log(`  - ✅ Set ${setData.code} exists in database. (ID: ${foundSets[0].id})`);
        } else {
          console.error(`  - ❌ Set ${setData.code} not found in database!`);
          allVerified = false;
          failures++;
        }
      } catch (error) {
        console.error(`  - ❌ Error verifying set ${setData.code}:`, error.message);
        allVerified = false;
        failures++;
      }
    }
    
    if (allVerified) {
      console.log('✅ All sets were created and verified successfully!');
    } else {
      console.error('❌ Some sets could not be verified.');
    }
    
    // Display summary
    console.log('\n📋 Process Summary:');
    console.log(`🔍 ${existingSets} existing sets found at start`);
    console.log(`🗑️ ${deletedSets} sets deleted`);
    console.log(`🆕 ${createdSets} new sets created`);
    console.log(`❌ ${failures} failures encountered`);
    
    return failures === 0;
  } catch (error) {
    console.error('\n❌ Fatal error during reset process:', error.message);
    return false;
  }
}

// Bootstrap Strapi and run the script
async function bootstrap() {
  let strapi = null;
  
  try {
    // Initialize Strapi
    console.log('🚀 Initializing Strapi...');
    
    // Dynamic import of Strapi
    console.log('  - Loading Strapi package...');
    const { default: createStrapi } = await import('@strapi/strapi');
    
    // Create and initialize Strapi instance
    console.log('  - Creating Strapi instance...');
    strapi = createStrapi();
    
    console.log('  - Loading Strapi configuration...');
    await strapi.load();
    
    console.log('  - Starting Strapi services...');
    await strapi.start();
    
    console.log('✅ Strapi started successfully.');
    
    // Run the reset function
    const success = await resetSets(strapi);
    
    // Exit with proper status
    if (success) {
      console.log('\n✨ Set reset process completed successfully!');
    } else {
      console.log('\n⚠️ Set reset process completed with errors.');
    }
    
    return success ? 0 : 1;
  } catch (error) {
    console.error('❌ Error bootstrapping Strapi:', error);
    console.error(error.stack || '(No stack trace available)');
    return 1;
  } finally {
    // Always clean up Strapi instance if it was created
    if (strapi) {
      try {
        console.log('🧹 Shutting down Strapi...');
        await strapi.destroy();
      } catch (err) {
        console.error('Error shutting down Strapi:', err.message);
      }
    }
  }
}

// Run the script and handle process exit
bootstrap()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

