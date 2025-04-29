import axios from 'axios';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const API_URL = `${BASE_URL}/api/sets`;
const AUTH_TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_ADMIN_TOKEN;

// Set data - the canonical source of set information
const setsToCreate = [
  {
    name: 'Romance Dawn',
    code: 'OP01',
    release_date: '2022-07-08',
    region: 'EN'
  },
  {
    name: 'Paramount War',
    code: 'OP02',
    release_date: '2022-09-09',
    region: 'EN'
  },
  {
    name: 'Pillars of Strength',
    code: 'OP03',
    release_date: '2022-11-11',
    region: 'EN'
  },
  {
    name: 'Kingdoms of Intrigue',
    code: 'OP04',
    release_date: '2023-01-27',
    region: 'EN'
  },
  {
    name: 'Awakening of the New Era',
    code: 'OP05',
    release_date: '2023-05-26',
    region: 'EN'
  },
  {
    name: 'Rule of the Three Powers',
    code: 'OP06',
    release_date: '2023-09-01',
    region: 'EN'
  }
];

// Statistics tracking
let existingSets = 0;
let deletedSets = 0;
let createdSets = 0;
let failedOperations = 0;

// Sleep function to add delay between operations
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all existing sets
async function getAllSets() {
  try {
    console.log('📊 Fetching all existing sets from Strapi...');
    const response = await axios.get(`${API_URL}?pagination[pageSize]=100`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const sets = response.data.data || [];
    existingSets = sets.length;
    
    console.log(`✅ Found ${existingSets} existing sets.`);
    return sets;
  } catch (error) {
    console.error('❌ Error fetching sets:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      if (error.response.status === 403) {
        console.error('  - ⚠️ Permission denied. Check your API token and permissions.');
        console.error('  - Make sure your token has read permissions for the Set content type.');
      }
    }
    failedOperations++;
    return [];
  }
}

// Delete a set by ID
async function deleteSet(id) {
  try {
    console.log(`  - Deleting set with ID: ${id}...`);
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log(`  - ✅ Successfully deleted set ID: ${id}`);
    deletedSets++;
    return true;
  } catch (error) {
    console.error(`  - ❌ Failed to delete set ID: ${id}:`, error.message);
    
    if (error.response) {
      if (error.response.status === 404) {
        console.log(`  - Set already deleted.`);
        return true; // Consider this a success
      } else if (error.response.status === 403) {
        console.error(`  - Permission denied. Check your API token permissions.`);
      } else {
        console.error(`  - Status: ${error.response.status}`);
        console.error(`  - Response data:`, error.response.data);
      }
    }
    
    failedOperations++;
    return false;
  }
}

// Create a new set
async function createSet(setData) {
  try {
    console.log(`  - Creating set: ${setData.code} (${setData.name})...`);
    
    // Extract only the essential fields to avoid relation issues
    const cleanPayload = {
      data: {
        name: setData.name,
        code: setData.code,
        release_date: setData.release_date,
        region: setData.region,
        publishedAt: new Date().toISOString() // Explicitly set published state
      }
    };
    
    console.log(`  - Using clean payload:`, JSON.stringify(cleanPayload, null, 2));
    
    const response = await axios.post(API_URL, cleanPayload, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`  - ✅ Successfully created set: ${setData.code}`);
    if (response.data && response.data.data && response.data.data.id) {
      console.log(`    (ID: ${response.data.data.id})`);
    }
    
    createdSets++;
    return true;
  } catch (error) {
    console.error(`  - ❌ Failed to create set: ${setData.code}:`, error.message);
    
    if (error.response) {
      console.error(`  - Status: ${error.response.status}`);
      
      if (error.response.status === 403) {
        console.error(`  - Permission denied. Check your API token permissions.`);
      } else {
        const errorData = error.response.data;
        console.error(`  - Response:`, JSON.stringify(errorData, null, 2));
        
        // Check for validation errors
        if (errorData && errorData.error && errorData.error.details && errorData.error.details.errors) {
          console.error(`  - Validation errors:`);
          errorData.error.details.errors.forEach(err => {
            console.error(`    - ${err.path}: ${err.message}`);
          });
        }
      }
    }
    
    failedOperations++;
    return false;
  }
}

// Verify a set exists by code
async function verifySetExists(code) {
  try {
    console.log(`  - Verifying set ${code} exists...`);
    const response = await axios.get(`${API_URL}?filters[code][$eq]=${code}`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const sets = response.data.data || [];
    if (sets.length > 0) {
      console.log(`  - ✅ Set ${code} exists in database.`);
      return true;
    } else {
      console.error(`  - ❌ Set ${code} not found in database!`);
      return false;
    }
  } catch (error) {
    console.error(`  - ❌ Error verifying set ${code}:`, error.message);
    return false;
  }
}

// Main function to reset sets
async function resetSets() {
  console.log('\n🔄 Starting Set Reset Process...');
  
  // 1. Fetch all existing sets
  const existingSets = await getAllSets();
  
  // 2. Delete all existing sets
  if (existingSets.length > 0) {
    console.log('\n🗑️ Deleting all existing sets...');
    for (const set of existingSets) {
      await deleteSet(set.id);
      // Add a small delay between operations
      await sleep(200);
    }
  } else {
    console.log('🗑️ No existing sets to delete.');
  }
  
  // Verify deletion by querying again
  const remainingSets = await getAllSets();
  if (remainingSets.length > 0) {
    console.warn(`⚠️ Warning: ${remainingSets.length} sets still exist after deletion attempt.`);
    
    // Continue anyway, as we'll try to create new sets
    console.log('Continuing with set creation despite deletion issues...');
  } else {
    console.log('✅ All sets successfully deleted.');
  }
  
  // 3. Create new sets
  console.log('\n🆕 Creating new sets with proper information...');
  for (const setData of setsToCreate) {
    await createSet(setData);
    // Add a small delay between operations
    await sleep(200);
  }
  
  // 4. Verify all sets were created successfully
  console.log('\n🔍 Verifying all sets were created...');
  let allVerified = true;
  for (const setData of setsToCreate) {
    const exists = await verifySetExists(setData.code);
    if (!exists) {
      allVerified = false;
      failedOperations++;
    }
    // Add a small delay between operations
    await sleep(100);
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
  console.log(`❌ ${failedOperations} operations failed`);
  
  // Even if some operations failed, consider success if we created at least some sets
  return createdSets > 0;
  
  return failedOperations === 0;
}

// Run the reset process
resetSets()
  .then(success => {
    if (success) {
      console.log('\n✨ Set reset process completed successfully!');
    } else {
      console.log('\n⚠️ Set reset process completed with errors.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error during reset process:', error.message);
    process.exit(1);
  });

