require('dotenv/config');
const axios = require('axios');

const strapiUrl = process.env.STRAPI_BASE_URL || 'http://localhost:1337'; // Your Strapi URL
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

// Function to fetch cards by set code
async function fetchCardsBySet(setCode) {
  try {
    console.log(`Fetching cards for set "${setCode}"...`);
    
    // Use the Strapi API to fetch cards filtered by set
    const response = await axios.get(
      `${strapiUrl}/api/cards?filters[set][code][$eq]=${setCode}&pagination[pageSize]=500`,
      {
        headers: {
          Authorization: `Bearer ${strapiToken}`,
        }
      }
    );
    
    // Extract card data from the response
    const cards = response.data.data || [];
    console.log(`Found ${cards.length} cards for set "${setCode}"`);
    
    // Transform the data to match the expected format
    return cards.map(card => ({
      id: card.attributes.cardId.split('-')[1] || card.attributes.cardId,
      name: card.attributes.name
    }));
  } catch (error) {
    console.error(`Failed to fetch cards for set "${setCode}":`, error.message);
    if (error.response?.data?.error) {
      console.error('Server response:', error.response.data.error);
    }
    return null;
  }
}

async function createFolders(setCode) {
  // Fetch cards by set code from the Strapi API
  const cards = await fetchCardsBySet(setCode);

  if (!cards || cards.length === 0) {
    console.error(`No cards found for set "${setCode}". Please check the set code or ensure cards are imported.`);
    process.exit(1);
  }

  const setFolderId = await createFolder(setCode);
  
  if (!setFolderId) {
    console.error(`Failed to create parent folder for set "${setName}". Aborting card folder creation.`);
    process.exit(1);
  }

  let successCount = 0;
  let failureCount = 0;

  for (const card of cards) {
    const cardFolderName = `${setCode}-${card.id} (${card.name})`;
    const result = await createFolder(cardFolderName, setFolderId);
    
    if (result) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  console.log(`\nSummary for set "${setCode}":`);
  console.log(`  - Successfully created: ${successCount} card folders`);
  console.log(`  - Failed to create: ${failureCount} card folders`);
}

const args = process.argv.slice(2);
const setCode = args[0];

if (!setCode) {
  console.error('Please provide a set code. Example usage: node scripts/createFolders.js OP01');
  process.exit(1);
}

createFolders(setCode);
