require('dotenv/config');
const axios = require('axios');
const sets = require('./sets.json');

const strapiUrl = 'http://localhost:1337'; // Your Strapi URL
const strapiToken = process.env.STRAPI_ADMIN_TOKEN;

async function createFolder(folderName, parentId = null) {
    try {
      const response = await axios.post(
        `${strapiUrl}/folder-manager/create`, // <-- no `/api/`
        {
          name: folderName,
          parent: parentId,
        },
        {
          headers: {
            Authorization: `Bearer ${strapiToken}`,
          },
        }
      );
      console.log(`Folder created: ${response.data.name}`);
      return response.data.id;
    } catch (error) {
      console.error(`Failed to create folder ${folderName}:`, error.response?.data || error.message);
    }
  }
  

async function createFolders(setName) {
  const cards = sets[setName];

  if (!cards) {
    console.error(`Set ${setName} not found in sets.json`);
    process.exit(1);
  }

  const setFolderId = await createFolder(setName);

  for (const card of cards) {
    const cardFolderName = `${setName}-${card.id} (${card.name})`;
    await createFolder(cardFolderName, setFolderId);
  }
}

const args = process.argv.slice(2);
const setName = args[0];

if (!setName) {
  console.error('Please provide a set name. Example usage: node scripts/createFolders.js OP01');
  process.exit(1);
}

createFolders(setName);