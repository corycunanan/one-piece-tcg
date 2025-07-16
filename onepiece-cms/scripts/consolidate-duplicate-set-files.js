import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, '..', '..', 'data', 'cards');

// Define the duplicates to remove (empty files) and keep (files with data)
const duplicatesToRemove = [
  'st15-edwardnewgate.json',
  'st18-monkeydluffy.json', 
  'st21-ex-gear5.json'
];

console.log('🧹 Consolidating duplicate set files...');

let removedCount = 0;
duplicatesToRemove.forEach(filename => {
  const filePath = path.join(CARDS_DIR, filename);
  
  if (fs.existsSync(filePath)) {
    // Check if file is empty (just has empty cards array)
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileData = JSON.parse(fileContent);
    
    if (fileData.cards.length === 0 && fileData.totalCards === 0) {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Removed empty duplicate: ${filename}`);
      removedCount++;
    } else {
      console.log(`⚠️  Skipped ${filename} - contains data`);
    }
  } else {
    console.log(`⏭️  File not found: ${filename}`);
  }
});

console.log(`\n📊 Summary: Removed ${removedCount} empty duplicate files`);
console.log('✅ Kept files with correct naming conventions:');
console.log('   - st15-edward-newgate.json');
console.log('   - st18-monkey-d-luffy.json'); 
console.log('   - st21-gear-5.json'); 