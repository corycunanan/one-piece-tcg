import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETS_FILE = path.join(__dirname, '..', '..', '..', 'data', 'sets', 'sets.json');
const CARDS_DIR = path.join(__dirname, '..', '..', '..', 'data', 'cards');

// Load sets data
const setsData = JSON.parse(fs.readFileSync(SETS_FILE, 'utf8'));

// Get existing card files
const existingFiles = fs.readdirSync(CARDS_DIR)
  .filter(file => file.endsWith('.json'))
  .map(file => file.replace('.json', ''));

console.log('Existing card files:', existingFiles);

// Create missing set files
let createdCount = 0;
setsData.sets.forEach(set => {
  // Convert set name to filename format
  // Note: This removes dots and other special characters to ensure consistent naming
  const filename = set.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters (including dots)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  const filePath = path.join(CARDS_DIR, `${filename}.json`);
  
  if (!fs.existsSync(filePath)) {
    const emptySetData = {
      "totalCards": 0,
      "cards": []
    };
    
    fs.writeFileSync(filePath, JSON.stringify(emptySetData, null, 2));
    console.log(`✅ Created: ${filename}.json`);
    createdCount++;
  } else {
    console.log(`⏭️  Skipped: ${filename}.json (already exists)`);
  }
});

console.log(`\n📊 Summary: Created ${createdCount} new set files`); 