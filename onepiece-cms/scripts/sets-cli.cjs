#!/usr/bin/env node

/**
 * Standalone script to reset and recreate sets in Strapi
 * 
 * Run with: NODE_ENV=development node scripts/sets-cli.js
 */

// Import required modules
const path = require('path');

// We can use __dirname directly in CommonJS

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

// Function to manage sets
async function manageSets(strapi) {
  try {
    console.log('\n🔄 Starting Set Management Process...');
    
    // Get the entity service
    const { entityService } = strapi;
    
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
      
      for (const set of existingSetRecords) {
        try {
          console.log(`  - Deleting set: ${set.code} (${set.name}) with ID ${set.id}...`);
          
          // Check if set has cards and handle appropriately
          if (set.cards && set.cards.length > 0) {
            console.log(`    - Set has ${set.cards.length} linked cards. Removing relations...`);
            
            // Disconnect cards from set
            for (const card of set.cards) {
              await entityService.update('api::card.card', card.id, {
                data: {
                  set: null,
                },
              });
            }
          }
          
          // Now delete the set
          await entityService.delete('api::set.set', set.id);
          
          console.log(`  - ✅ Successfully deleted set: ${set.code} (ID: ${set.id})`);
          deletedSets++;
        } catch (error) {
          console.error(`  - ❌ Failed to delete set ${set.code} (ID: ${set.id}):`, error.message);
          failures++;
        }
      }
      
      if (deletedSets === existingSets) {
        console.log('✅ All sets deleted successfully');
      } else {
        console.log(`⚠️ Only ${deletedSets} of ${existingSets} sets were deleted.`);
      }
    } else {
      console.log('🗑️ No existing sets to delete.');
    }
    
    // 3. Create new sets
    console.log('\n🆕 Creating new sets with proper information...');
    
    for (const setData of setsToCreate) {
      try {
        console.log(`  - Creating set: ${setData.code} (${setData.name})...`);
        
        // Create the set
        const createdSet = await entityService.create('api::set.set', {
          data: {
            ...setData,
            publishedAt: new Date(), // Explicitly set published state
          },
        });
        
        console.log(`  - ✅ Successfully created set: ${setData.code} (ID: ${createdSet.id})`);
        createdSets++;
      } catch (error) {
        console.error(`  - ❌ Failed to create set ${setData.code}:`, error.message);
        failures++;
      }
    }
    
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
    
    return { success: failures === 0 };
  } catch (error) {
    console.error('\n❌ Fatal error during process:', error.message);
    console.error(error.stack);
    return { success: false, error };
  }
}

// Main function to run the script
async function run() {
  // Require Strapi - in CommonJS, Strapi itself is the factory function
  let Strapi;
  try {
    // In CommonJS, the module itself is the factory function
    Strapi = require('@strapi/strapi');
    console.log('✅ Successfully loaded Strapi module');
  } catch (error) {
    console.error('Failed to require Strapi module:', error.message);
    process.exit(1);
  }
  
  let strapi = null;
  
  try {
    console.log('🚀 Starting Strapi in development mode...');
    
    // Create Strapi instance with proper configuration
    strapi = Strapi({
      appDir: process.cwd(),
      autoReload: false,
      serveAdminPanel: false,
    });
    
    // Load Strapi
    await strapi.load();
    
    // Start Strapi
    await strapi.start();
    
    console.log('✅ Strapi started successfully!');
    
    // Run the set management process
    const result = await manageSets(strapi);
    
    // Return the success status
    return result.success;
  } catch (error) {
    console.error('Failed to initialize or run Strapi:', error.message);
    console.error(error.stack);
    return false;
  } finally {
    // Always clean up by stopping Strapi
    if (strapi) {
      try {
        console.log('\n🧹 Shutting down Strapi...');
        await strapi.destroy();
        console.log('✅ Strapi shut down successfully!');
      } catch (error) {
        console.error('Error shutting down Strapi:', error.message);
      }
    }
  }
}

// Run the script and handle exit
run()
  .then(success => {
    console.log(success ? '\n✨ Process completed successfully!' : '\n⚠️ Process completed with errors!');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Unhandled error:', error);
    process.exit(1);
  });

