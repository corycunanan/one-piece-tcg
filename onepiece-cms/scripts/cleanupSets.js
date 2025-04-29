import axios from 'axios';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
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
let duplicatesRemoved = 0;
let setsUpdated = 0;
let errorCount = 0;

// Function to log object structure for debugging
function logObjectStructure(obj, label = 'Object') {
  console.log(`\n🔍 Debugging ${label} structure:`);
  console.log(`  - Type: ${typeof obj}`);
  
  if (obj === null) {
    console.log('  - Value: null');
    return;
  }
  
  if (Array.isArray(obj)) {
    console.log(`  - Is Array with ${obj.length} items`);
    if (obj.length > 0) {
      console.log('  - First item properties:', Object.keys(obj[0]));
    }
  } else if (typeof obj === 'object') {
    console.log('  - Properties:', Object.keys(obj));
  } else {
    console.log(`  - Value: ${obj}`);
  }
}

// Fetch all sets from Strapi
async function getAllSets() {
  try {
    console.log('📊 Fetching all sets from Strapi...');
    const response = await axios.get(`${API_URL}?pagination[pageSize]=100`, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`
      }
    });
    
    // Debug response structure
    console.log('\n🔍 API Response structure:');
    if (response.data) {
      console.log('  - Response data properties:', Object.keys(response.data));
      
      if (response.data.data) {
        const data = response.data.data;
        totalSets = data.length;
        console.log(`✅ Successfully fetched ${totalSets} sets.`);
        
        // Examine the first set to understand structure
        if (totalSets > 0) {
          const firstSet = data[0];
          console.log('  - First set properties:', Object.keys(firstSet));
          
          // Check for attributes structure
          if (firstSet.attributes) {
            console.log('  - First set attributes:', Object.keys(firstSet.attributes));
          }
        }
        
        return data;
      } else {
        console.error('❌ No data array found in response');
        console.log('  - Full response:', JSON.stringify(response.data, null, 2));
        process.exit(1);
      }
    } else {
      console.error('❌ No data in response');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error fetching sets:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Response data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Delete a set by ID with verification and retry
async function deleteSet(id, maxRetries = 2) {
  console.log(`  - Attempting to delete set with ID: ${id}`);
  
  // Ensure we're using the correct endpoint format
  const deleteUrl = `${BASE_URL}/api/sets/${id}`;
  console.log(`  - Using delete URL: ${deleteUrl}`);
  
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      // Perform the delete operation
      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`
        }
      });
      
      console.log(`  - Delete request successful. Status: ${response.status}`);
      
      // Verify the delete was successful by trying to fetch the set
      try {
        const checkResponse = await axios.get(`${BASE_URL}/api/sets/${id}`, {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`
          }
        });
        
        // If we get here, the set still exists
        console.warn(`  - ⚠️ Set still exists after delete operation. Status: ${checkResponse.status}`);
        
        if (retries < maxRetries) {
          retries++;
          console.log(`  - Retry attempt ${retries}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        } else {
          console.error(`  - ❌ Failed to delete after ${maxRetries} retries.`);
          errorCount++;
          return false;
        }
      } catch (checkError) {
        // If we get a 404, the delete was successful
        if (checkError.response && checkError.response.status === 404) {
          console.log(`  - ✅ Verified set with ID ${id} was deleted successfully.`);
          duplicatesRemoved++;
          return true;
        } else {
          console.error(`  - ❓ Unexpected error checking delete status:`, checkError.message);
          // Continue with retry logic
          if (retries < maxRetries) {
            retries++;
            console.log(`  - Retry attempt ${retries}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error(`  - ❌ Failed to verify delete after ${maxRetries} retries.`);
            errorCount++;
            return false;
          }
        }
      }
    } catch (error) {
      // Handle specific error scenarios
      console.error(`  - Failed to delete set with ID ${id}:`, error.message);
      
      if (error.response) {
        const status = error.response.status;
        console.error(`  - Status: ${status}`);
        
        if (status === 403) {
          console.error(`  - ❌ Permission denied. Check your API token and permissions.`);
          console.error(`  - Make sure your token has delete permissions for the Set content type.`);
          errorCount++;
          return false; // Don't retry permission issues
        } else if (status === 404) {
          console.log(`  - Set already deleted or doesn't exist.`);
          duplicatesRemoved++;
          return true; // Count as success
        }
      }
      
      // Retry logic
      if (retries < maxRetries) {
        retries++;
        console.log(`  - Retry attempt ${retries}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error(`  - ❌ Failed to delete after ${maxRetries} retries.`);
        errorCount++;
        return false;
      }
    }
  }
  
  return false; // Should never reach here
}

// Update a set with complete information
async function updateSet(id, data) {
  try {
    console.log(`  - Updating set with ID ${id}...`);
    
    // Make sure we're using the correct endpoint for Strapi v4
    // Format: /api/{contentType}/{id}
    const updateUrl = `${BASE_URL}/api/sets/${id}`;
    console.log(`  - Using update URL: ${updateUrl}`);
    
    // Log the update payload
    console.log(`  - Update payload:`, JSON.stringify({ data }, null, 2));
    
    const response = await axios.put(updateUrl, {
      data: data
    }, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log successful response
    console.log(`  - Update successful. Status: ${response.status}`);
    console.log(`  - Updated set: ${data.code} (${data.name})`);
    setsUpdated++;
    return true;
  } catch (error) {
    console.error(`  - Failed to update set with ID ${id}:`, error.message);
    
    // Enhanced error logging
    if (error.response) {
      console.error(`  - Status: ${error.response.status}`);
      console.error(`  - Status text: ${error.response.statusText}`);
      console.error(`  - Response data:`, JSON.stringify(error.response.data, null, 2));
      
      // Check if there are specific error details for debugging
      if (error.response.data?.error?.details) {
        console.error(`  - Error details:`, JSON.stringify(error.response.data.error.details, null, 2));
      }
    }
    
    // Check for network or configuration issues
    if (error.request && !error.response) {
      console.error(`  - No response received. This could be a network issue or incorrect endpoint.`);
    }
    
    errorCount++;
    return false;
  }
}

// Get code and name safely from set data
function getSetInfo(set) {
  // Depending on API response structure, handle both formats
  if (set.attributes && set.attributes.code) {
    // Standard Strapi v4 format
    return {
      code: set.attributes.code,
      name: set.attributes.name || 'Unnamed Set',
      createdAt: set.attributes.createdAt
    };
  } else if (set.code) {
    // Direct access format
    return {
      code: set.code,
      name: set.name || 'Unnamed Set',
      createdAt: set.createdAt
    };
  } else {
    // Log the issue but return a placeholder
    console.error('⚠️ Could not find code in set:', JSON.stringify(set, null, 2));
    return {
      code: null,
      name: set.name || set.attributes?.name || 'Unknown Set',
      createdAt: set.createdAt || set.attributes?.createdAt || new Date().toISOString()
    };
  }
}

// Main cleanup function
async function cleanupSets() {
  // Fetch all sets
  const sets = await getAllSets();
  
  // Debug first few sets to understand structure
  if (sets.length > 0) {
    console.log('\n🔍 Examining first set in detail:');
    console.log(JSON.stringify(sets[0], null, 2));
  }
  
  // Group sets by code
  const setsByCode = {};
  let setsWithoutCode = 0;
  
  sets.forEach(set => {
    const { code, name } = getSetInfo(set);
    
    if (!code) {
      setsWithoutCode++;
      return; // Skip sets without a code
    }
    
    console.log(`  - Processing set: ${code} (${name})`);
    
    if (!setsByCode[code]) {
      setsByCode[code] = [];
    }
    setsByCode[code].push(set);
  });
  
  if (setsWithoutCode > 0) {
    console.warn(`⚠️ Found ${setsWithoutCode} sets without a code - these will be skipped.`);
  }
  
  console.log('\n🧹 Starting duplicate cleanup and set updates...');
  
  // Process each group
  for (const [code, setGroup] of Object.entries(setsByCode)) {
    console.log(`\n📦 Processing set code: ${code}`);
    
    if (setGroup.length > 1) {
      console.log(`  - Found ${setGroup.length} duplicates for code ${code}`);
      
      // Sort by creation date (newest first)
      setGroup.sort((a, b) => {
        const dateA = a.attributes?.createdAt || a.createdAt || '1970-01-01';
        const dateB = b.attributes?.createdAt || b.createdAt || '1970-01-01';
        return new Date(dateB) - new Date(dateA);
      });
      
      // Keep the newest, delete the rest
      const [newest, ...duplicates] = setGroup;
      const setId = newest.id;
      
      if (!setId) {
        console.error(`❌ Missing ID for set with code ${code}`);
        console.error(JSON.stringify(newest, null, 2));
        continue;
      }
      
      console.log(`  - Keeping newest set with ID: ${setId}`);
      
      // Delete duplicates
      for (const dup of duplicates) {
        if (dup.id) {
          await deleteSet(dup.id);
        } else {
          console.error(`❌ Missing ID for duplicate set with code ${code}`);
        }
      }
      
      // Update the kept set with complete information
      if (setInfo[code]) {
        await updateSet(setId, {
          ...setInfo[code],
          code: code
        });
      }
    } else {
      console.log(`  - No duplicates found for code ${code}`);
      
      // Update with complete information
      if (setInfo[code]) {
        const setId = setGroup[0].id;
        
        if (!setId) {
          console.error(`❌ Missing ID for set with code ${code}`);
          console.error(JSON.stringify(setGroup[0], null, 2));
          continue;
        }
        
        await updateSet(setId, {
          ...setInfo[code],
          code: code
        });
      }
    }
  }
  
  // Display summary
  console.log('\n📋 Cleanup Summary:');
  console.log(`✔ ${totalSets} total sets found`);
  console.log(`🗑️ ${duplicatesRemoved} duplicate sets removed`);
  console.log(`📝 ${setsUpdated} sets updated with complete information`);
  console.log(`❌ ${errorCount} errors encountered`);
}

// Run the cleanup process
cleanupSets()
  .then(() => {
    console.log('\n✨ Set cleanup process complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Fatal error during cleanup process:', error.message);
    process.exit(1);
  });

