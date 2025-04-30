import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const cleanupScriptPath = path.join(__dirname, 'cleanupCardsJson.js');
const bulkImportCardsPath = path.join(__dirname, 'bulkImportCards.js');

try {
  console.log('🧹 Running cleanupCardsJson.js...');
  execSync(`node ${cleanupScriptPath}`, { stdio: 'inherit' });

  console.log('🚀 Running bulkImportCards.js...');
  execSync(`node ${bulkImportCardsPath}`, { stdio: 'inherit' });

  console.log('✅ Card import process complete!');
} catch (error) {
  console.error('❌ Error during import process:', error);
  process.exit(1);
}
