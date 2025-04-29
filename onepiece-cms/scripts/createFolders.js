require('dotenv/config');
const axios = require('axios');
const sets = require('./sets.json');

const strapiUrl = 'http://localhost:1337'; // Your Strapi URL
const strapiToken = process.env.STRAPI_ADMIN_TOKEN;

async function createFolder(folderName, parentId = null) {
    try {
      // Build proper request body with data wrapper
      const requestData = {
        data: {
          name: folderName,
          // Only include parent if it's not null
          ...(parentId && { parent: parentId })
        }
      };

      // Use the correct Strapi v4 API endpoint format
      const response = await axios.post(
        `${strapiUrl}/api/folder-managers`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${strapiToken}`,
            'Content-Type': 'application/json'
          },
        }
      );

      // Handle the response with the new data structure
      console.log(`Folder created: ${response.data.data.attributes.name}`);
      return response.data.data.id;
    } catch (error) {
      // Improved error handling for relation constraints
      if (error.response?.data?.error?.message) {
        console.error(`Failed to create folder "${folderName}":`, error.response.data.error.message);
        
        // Check for relation constraint errors
        if (error.response.data.error.message.includes('parent') && parentId) {
          console.error(`  - Parent folder with ID ${parentId} might not exist or has an invalid relation.`);
        }
      } else {
        console.error(`Failed to create folder "${folderName}":`, error.message);
      }
      return null; // Return null to indicate failure
    }
  }
  

async function createFolders(setName) {
  const cards = sets[setName];

  if (!cards) {
    console.error(`Set ${setName} not found in sets.json`);
    process.exit(1);
  }

  const setFolderId = await createFolder(setName);
  
  if (!setFolderId) {
    console.error(`Failed to create parent folder for set "${setName}". Aborting card folder creation.`);
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  for (const card of cards) {
    const cardFolderName = `${setName}-${card.id} (${card.name})`;
    const result = await createFolder(cardFolderName, setFolderId);
    
    if (result) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  console.log(`\nSummary for set "${setName}":`);
  console.log(`  - Successfully created: ${successCount} card folders`);
  console.log(`  - Failed to create: ${failureCount} card folders`);
}

const args = process.argv.slice(2);
const setName = args[0];

if (!setName) {
  console.error('Please provide a set name. Example usage: node scripts/createFolders.js OP01');
  process.exit(1);
}

createFolders(setName);