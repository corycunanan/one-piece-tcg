import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sets = JSON.parse(fs.readFileSync(path.join(__dirname, 'setsUpload.json'), 'utf8'));
// Configuration
const BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const API_URL = `${BASE_URL}/api/sets`;
const AUTH_TOKEN = process.env.STRAPI_API_TOKEN || process.env.STRAPI_ADMIN_TOKEN;

// Validate configuration
if (!AUTH_TOKEN) {
  console.warn('⚠️ Warning: No API token found. Set STRAPI_API_TOKEN or STRAPI_ADMIN_TOKEN in your environment.');
}

// Print configuration for debugging
console.log('🔧 Configuration:');
console.log(`  - Base URL: ${BASE_URL}`);
console.log(`  - API URL: ${API_URL}`);
console.log(`  - API Token: ${AUTH_TOKEN ? '✅ Set' : '❌ Not set'}`);
// Track import statistics
let successCount = 0;
let failureCount = 0;
let skippedCount = 0;
let validationErrorCount = 0;

// Validate set data
function validateSet(set) {
  const errors = [];
  
  if (!set.name) errors.push('Missing required field: name');
  if (!set.code) errors.push('Missing required field: code');
  
  // Validate date format if present
  if (set.release_date && isNaN(Date.parse(set.release_date))) {
    errors.push('Invalid date format for release_date');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Check if set already exists
async function checkSetExists(code) {
  if (!AUTH_TOKEN) {
    console.error('⚠️ Warning: STRAPI_API_TOKEN environment variable is not set.');
    console.error('   Make sure to set it in .env or provide it when running the script.');
    console.error('   Example: STRAPI_API_TOKEN=your_token node scripts/bulkImportSets.js');
  }

  try {
    console.log(`  - Checking if set "${code}" exists...`);
    
    // Properly formatted URL with URL encoding for filter value
    const encodedCode = encodeURIComponent(code);
    const url = `${API_URL}?filters[code][$eq]=${encodedCode}`;
    
    console.log(`  - API URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Validate response data structure
    if (response.data && response.data.data) {
      const exists = response.data.data.length > 0;
      console.log(`  - Response status: ${response.status}`);
      console.log(`  - Set "${code}" ${exists ? 'exists' : 'does not exist'}`);
      
      return exists;
    } else {
      console.error(`  - Unexpected response format:`, JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking if set "${code}" exists:`);
    
    // Enhanced error reporting
    if (error.response) {
      console.error(`  - Status: ${error.response.status}`);
      console.error(`  - Status text: ${error.response.statusText}`);
      
      if (error.response.data && error.response.data.error) {
        console.error(`  - Error: ${error.response.data.error.message}`);
      } else {
        console.error(`  - Response data:`, JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error(`  - No response received. Server might be down or URL incorrect.`);
    } else {
      console.error(`  - Error setting up request: ${error.message}`);
    }
    
    // In case of error checking, assume set doesn't exist
    return false;
  }
}

// Main import function
async function importSets() {
  console.log(`🚀 Preparing to import ${sets.length} sets...`);
  
  for (const set of sets) {
    // Validate set data
    const validation = validateSet(set);
    if (!validation.isValid) {
      console.error(`❌ Validation failed for set with code "${set.code || 'UNKNOWN'}":`);
      validation.errors.forEach(error => console.error(`  - ${error}`));
      validationErrorCount++;
      failureCount++;
      continue;
    }
    
    try {
      // Check for duplicates (only once)
      const exists = await checkSetExists(set.code);
      if (exists) {
        console.log(`⏩ Skipping set "${set.code}: ${set.name}" - already exists`);
        skippedCount++;
        continue;
      }
      
      console.log(`  - Creating set "${set.code}: ${set.name}"...`);
      
      // Prepare set data
      const setData = {
        data: {
          name: set.name,
          code: set.code,
          release_date: set.release_date || null,
          region: set.region || 'EN', // Default to EN if not specified 
          publishedAt: new Date().toISOString() // Explicitly set published state
        }
      };
      
      console.log(`  - Request payload:`, JSON.stringify(setData, null, 2));
      
      // Create set
      const response = await axios.post(API_URL, setData, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`  - Response status: ${response.status}`);
      console.log(`✅ Successfully imported set: ${set.code} (${set.name})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to import set: ${set.code} (${set.name})`);
      
      if (error.response) {
        const errorData = error.response.data;
        console.error(`  - Status: ${error.response.status}`);
        console.error(`  - Status text: ${error.response.statusText}`);
        
        if (errorData.error) {
          console.error(`  - Error: ${errorData.error.message}`);
          
          // Show detailed validation errors if available
          if (errorData.error.details && errorData.error.details.errors) {
            errorData.error.details.errors.forEach(err => {
              console.error(`    - ${err.path.join('.')}: ${err.message}`);
            });
          }
        } else {
          console.error(`  - Server Response:`, JSON.stringify(errorData, null, 2));
        }
      } else if (error.request) {
        console.error(`  - No response received. Server might be down or URL incorrect.`);
        console.error(`  - Request details:`, error.request);
      } else {
        console.error(`  - Error setting up request: ${error.message}`);
      }
      
      failureCount++;
    }
  }
  
  // Display summary
  console.log('\n📋 Set Import Summary:');
  console.log(`✔ ${successCount} sets imported successfully`);
  console.log(`⏩ ${skippedCount} sets skipped (already exist)`);
  console.log(`❌ ${failureCount} sets failed`);
  console.log(`   ↳ ${validationErrorCount} failed due to validation errors`);
  
  // Return success/failure for exit code
  return failureCount === 0;
}

// Run the import process
importSets()
  .then(success => {
    console.log('📚 Set import process complete!');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error during set import process:', error.message);
    process.exit(1);
  });
