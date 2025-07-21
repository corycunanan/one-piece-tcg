import fs from 'fs';
import path from 'path';

// Function to read HTML sources and extract effect/trigger descriptions
function readHtmlSources() {
  const crawlerDir = path.join(process.cwd(), '..', '..', 'optcg-crawler', 'cards');
  
  // Recursively find all HTML files
  function findHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findHtmlFiles(fullPath));
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const htmlFiles = findHtmlFiles(crawlerDir);
  console.log(`📁 Found ${htmlFiles.length} HTML files in crawler directory`);
  
  const cardData = {};
  
  htmlFiles.forEach(filePath => {
    const html = fs.readFileSync(filePath, 'utf8');
    
    // Find all card sections
    const cardSections = html.match(/<dl class="modalCol" id="([^"]+)">([\s\S]*?)<\/dl>/g);
    
    if (cardSections) {
      cardSections.forEach(section => {
        // Extract card ID from the section ID
        const idMatch = section.match(/id="([^"]+)"/);
        if (idMatch) {
          const fullId = idMatch[1];
          const cardId = fullId.replace(/_p\d+$/, ''); // Remove _p1, _p2, etc.
          
          // Extract effect description
          const effectMatch = section.match(/<div\s+class=["']text["']>\s*<h3>Effect<\/h3>([\s\S]*?)<\/div>/i);
          let effectDescription = '';
          if (effectMatch) {
            effectDescription = effectMatch[1]
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
          }
          
          // Extract trigger description
          const triggerMatch = section.match(/<div\s+class=["']trigger["']>\s*<h3>Trigger<\/h3>([\s\S]*?)<\/div>/i);
          let triggerDescription = '';
          if (triggerMatch) {
            triggerDescription = triggerMatch[1]
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim();
          }
          
          // Store data for base card (including from variants)
          if (effectDescription || triggerDescription) {
            // Use the base cardId (without variant suffix) as the key
            cardData[cardId] = {
              effect_description: effectDescription,
              trigger_description: triggerDescription
            };
            
            // Debug: Print for ST01-007
            if (cardId === 'ST01-007') {
              console.log(`DEBUG: Storing ST01-007 data from ${fullId}:`, cardData[cardId]);
            }
          }
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(cardData).length} cards with effect/trigger descriptions from HTML sources`);
  
  return cardData;
}

const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

function getSetNameFromFile(file) {
  // e.g. st01-straw-hat-crew.json -> ST01 - Straw Hat Crew
  const match = file.match(/^(st\d+)-(.*)\.json$/i);
  if (!match) return null;
  const code = match[1].toUpperCase();
  const name = match[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `${code} - ${name}`;
}

const REQUIRED_FIELDS = [
  'effect_description',
  'trigger_description',
  'rarity',
  'set',
  'images',
  'cardId',
  'name',
  'cardType',
  'colors',
  'traits',
  'attributes'
];

let totalCardsFixed = 0;
let totalFilesChanged = 0;

// Read HTML sources first
console.log('📖 Reading HTML sources for effect/trigger descriptions...');
const htmlCardData = readHtmlSources();

// Debug: Check if ST01-007 is in HTML data
if (htmlCardData['ST01-007']) {
  console.log(`DEBUG: ST01-007 found in HTML data:`, htmlCardData['ST01-007']);
} else {
  console.log(`DEBUG: ST01-007 NOT found in HTML data`);
}

cardFiles.forEach(file => {
  const filePath = path.join(dataDir, file);
  const setData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const setName = getSetNameFromFile(file);
  if (!setName) return;
  let changed = false;

  setData.cards.forEach(card => {
    // Ensure required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!(field in card)) {
        card[field] = (field === 'set' || field === 'images' || field === 'colors' || field === 'traits' || field === 'attributes') ? [] : '';
        changed = true;
        console.log(`🛠️  Added missing field '${field}' to ${card.cardId} in ${file}`);
      }
    });
    
    // Update effect and trigger descriptions from HTML if available
    if (htmlCardData[card.cardId]) {
      const htmlData = htmlCardData[card.cardId];
      
      if (htmlData.effect_description && (!card.effect_description || card.effect_description === '')) {
        card.effect_description = htmlData.effect_description;
        changed = true;
        console.log(`📝 Updated effect for ${card.cardId}: ${htmlData.effect_description.substring(0, 50)}...`);
      }
      
      if (htmlData.trigger_description && (!card.trigger_description || card.trigger_description === '')) {
        card.trigger_description = htmlData.trigger_description;
        changed = true;
        console.log(`📝 Updated trigger for ${card.cardId}: ${htmlData.trigger_description.substring(0, 50)}...`);
      }
    }
    
    // Ensure set assignment
    if (Array.isArray(card.set)) {
      const hasCorrectSet = card.set.some(s => s.set === setName && s.is_default === true);
      if (!hasCorrectSet) {
        card.set.push({ set: setName, is_default: true });
        changed = true;
        console.log(`🛠️  Added set assignment '${setName}' to ${card.cardId} in ${file}`);
      }
    }
  });

  if (changed) {
    setData.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(setData, null, 2));
    totalFilesChanged++;
    totalCardsFixed += setData.cards.length;
    console.log(`✅ Updated ${file}`);
  }
});

console.log(`\nSummary: Fixed ${totalCardsFixed} cards in ${totalFilesChanged} files.`); 