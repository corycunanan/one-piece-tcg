import axios from 'axios';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const API_URL = `${BASE_URL}/api/sets`;
const AUTH_TOKEN = process.env.STRAPI_API_TOKEN;

// Set release dates and additional information
const setInfo = {
  'OP01': {
    name: 'Romance Dawn',
    release_date: '2022-07-08',
    region: 'EN'
  },
  'OP02': {
    name: 'Paramount War',
    release_date: '2022-09-09',
    region: 'EN'
  },
  'OP03': {
    name: 'Pillars of Strength',
    release_date: '2022-11-11',
    region: 'EN'
  },
  'OP04': {
    name: 'Kingdoms of Intrigue',
    release_date: '2023-01-27',
    region: 'EN'
  },
  'OP05': {
    name: 'Awakening of the New Era',
    release_date: '2023-05-26',
    region: 'EN'
  },
  'OP06': {
    name: 'Rule of the Three Powers',
    release_date: '2023-09-01',
    region: 'EN'
  }
  // Add more sets as needed
};

// Statistics tracking
let totalSets = 0;
let updatedSets = 0;
let updateFailures = 0;
let deletedDuplicates = 0;
let deleteFailures = 0;
let permissionErrors = 0;

// Fetch all sets from Strapi
async function getAllSets() {
  try {
    console.log('📊 Fetching all sets from Strapi...');
    const response = await axios.get(`${API_URL}?pagination[pageSize]=100`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const sets = response.data.data;
    totalSets = sets.length;
    
    console.log(`✅ Successfully fetched ${totalSets} sets.`);
    return sets;
  } catch (error) {
    console.error('❌ Error fetching sets:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Response data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 403) {
        console.error('  - ⚠️ Permission denied. Check your API token and make sure it has the necessary permissions.');
        permissionErrors++;
      }
    }
    process.exit(1);
  }
}

// Check Strapi permissions
async function checkPermissions() {
  try {
    console.log('🔐 Checking Strapi permissions...');
    
    // Try a simple GET request first
    await axios.get(`${API_URL}?pagination[pageSize]=1`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('  - ✅ Read permissions confirmed.');
    
    // Check update permissions by attempting to create a test set
    // We'll try a dummy operation and check for 403 errors
    try {
      console.log('  - Checking write permissions...');
      const testPayload = {
        data: {
          name: 'Permission Test',
          code: 'TEST',
          region: 'TEST'
        }
      };
      
      const response = await axios.post(API_URL, testPayload, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If we get here, we have create permissions - let's delete this test set
      console.log('  - ✅ Create permissions confirmed.');
      
      if (response.data && response.data.data && response.data.data.id) {
        const testId = response.data.data.id;
        
        try {
          await axios.delete(`${API_URL}/${testId}`, {
            headers: {
              Authorization: `Bearer ${AUTH_TOKEN}`
            }
          });
          console.log('  - ✅ Delete permissions confirmed.');
        } catch (deleteError) {
          if (deleteError.response && deleteError.response.status === 403) {
            console.warn('  - ⚠️ No delete permissions. Duplicate cleanup will not be possible.');
            permissionErrors++;
          } else {
            console.log('  - ❓ Unable to verify delete permissions. Proceeding anyway.');
          }
        }
      }
    } catch (writeError) {
      if (writeError.response && writeError.response.status === 403) {
        console.error('  - ❌ No write permissions. Cannot update sets.');
        permissionErrors++;
      } else {
        console.log('  - ❓ Unable to verify write permissions. Proceeding anyway.');
      }
    }
    
    return permissionErrors === 0;
  } catch (error) {
    console.error('❌ Error checking permissions:', error.message);
    return false;
  }
}

// Update a set with complete information
async function updateSet(set) {
  const setId = set.id;
  const code = set.code;
  
  // Skip if we don't have set info for this code
  if (!setInfo[code]) {
    console.log(`  - Skipping update for ${code}: No information available`);
    return false;
  }
  
  console.log(`\n📝 Updating set ${code} (ID: ${setId})...`);
  
  try {
    const updateUrl = `${API_URL}/${setId}`;
    const updateData = {
      data: {
        ...setInfo[code],
        code: code // Ensure code is preserved
      }
    };
    
    console.log(`  - Using update URL: ${updateUrl}`);
    console.log(`  - Payload:`, JSON.stringify(updateData, null, 2));
    
    const response = await axios.put(updateUrl, updateData, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`  - ✅ Update successful. Status: ${response.status}`);
    updatedSets++;
    return true;
  } catch (error) {
    console.error(`  - ❌ Failed to update set ${code} (ID: ${setId}):`, error.message);
    
    if (error.response) {
      console.error(`  - Status: ${error.response.status}`);
      
      if (error.response.status === 403) {
        console.error(`  - Permission denied. Check your API token permissions.`);
        permissionErrors++;
      } else if (error.response.status === 404) {
        console.error(`  - Set not found. It may have been deleted.`);
      } else {
        console.error(`  - Response data:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    
    updateFailures++;
    return false;
  }
}

// Delete a set
async function deleteSet(setId, setCode) {
  console.log(`\n🗑️ Attempting to delete duplicate set ${setCode} (ID: ${setId})...`);
  
  try {
    const deleteUrl = `${API_URL}/${setId}`;
    console.log(`  - Using delete URL: ${deleteUrl}`);
    
    const response = await axios.delete(deleteUrl, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log(`  - ✅ Successfully deleted. Status: ${response.status}`);
    deletedDuplicates++;
    return true;
  } catch (error) {
    console.error(`  - ❌ Failed to delete set (ID: ${setId}):`, error.message);
    
    if (error.response) {
      console.error(`  - Status: ${error.response.status}`);
      
      if (error.response.status === 403) {
        console.error(`  - Permission denied. Check your API token permissions.`);
        permissionErrors++;
      } else if (error.response.status === 404) {
        console.error(`  - Set not found. It may have already been deleted.`);
        // Count as success if already deleted
        deletedDuplicates++;
        return true;
      } else {
        console.error(`  - Response data:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    
    deleteFailures++;
    return false;
  }
}

// Main function to update sets and handle duplicates
async function updateAndCleanupSets() {
  console.log('\n🔄 Starting Set Management Process...');
  
  // First check permissions
  const hasPermissions = await checkPermissions();
  if (!hasPermissions) {
    console.warn('\n⚠️ Permission issues detected. Some operations may fail.');
  }
  
  // Fetch all sets
  const sets = await getAllSets();
  
  // Group by code for duplicate handling
  const setsByCode = {};
  sets.forEach(set => {
    const code = set.code;
    if (!code) return; // Skip sets without a code
    
    if (!setsByCode[code]) {
      setsByCode[code] = [];
    }
    setsByCode[code].push(set);
  });
  
  // First, update all sets
  console.log('\n🔄 First phase: Updating all sets with correct information...');
  
  for (const [code, setGroup] of Object.entries(setsByCode)) {
    console.log(`\n📦 Processing set code: ${code} (${setGroup.length} instances)`);
    
    for (const set of setGroup) {
      await updateSet(set);
    }
  }
  
  // Then handle duplicates if we have delete permissions
  if (permissionErrors === 0) {
    console.log('\n🔄 Second phase: Removing duplicate sets...');
    
    for (const [code, setGroup] of Object.entries(setsByCode)) {
      if (setGroup.length > 1) {
        console.log(`\n📦 Processing duplicates for set code: ${code}`);
        console.log(`  - Found ${setGroup.length} instances of ${code}`);
        
        // Sort by creation date (newest first)
        setGroup.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Keep the newest, delete the rest
        const [newest, ...duplicates] = setGroup;
        console.log(`  - Keeping newest set: ID ${newest.id}, created ${newest.createdAt}`);
        
        // Delete duplicates
        for (const dup of duplicates) {
          await deleteSet(dup.id, code);
        }
      } else {
        console.log(`\n📦 Set code ${code} has no duplicates.`);
      }
    }
  } else {
    console.warn('\n⚠️ Skipping duplicate removal due to permission issues.');
  }
  
  // Display summary
  console.log('\n📋 Process Summary:');
  console.log(`✔ ${totalSets} total sets found`);
  console.log(`📝 ${updatedSets} sets updated successfully`);
  console.log(`❌ ${updateFailures} update failures`);
  
  if (permissionErrors === 0) {
    console.log(`🗑️ ${deletedDuplicates} duplicate sets deleted`);
    console.log(`❌ ${deleteFailures} delete failures`);
  } else {
    console.log(`⚠️ Duplicate removal skipped due to ${permissionErrors} permission errors`);
  }
}

// Run the script
updateAndCleanupSets()
  .then(() => {
    console.log('\n✨ Set update and cleanup process complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error during process:', error.message);
    process.exit(1);
  });

