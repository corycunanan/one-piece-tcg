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
          
          // Debug: Print for ST01-007
          if (cardId === 'ST01-007' || fullId.includes('ST01-007')) {
            console.log(`DEBUG: fullId: "${fullId}", cardId: "${cardId}"`);
          }
          
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
          
          // Store data for base card (not variants)
          if (fullId === cardId) {
            console.log(`DEBUG: Processing ${cardId}, effectDescription: "${effectDescription}", triggerDescription: "${triggerDescription}"`);
            if (effectDescription || triggerDescription) {
              cardData[cardId] = {
                effect_description: effectDescription,
                trigger_description: triggerDescription
              };
              
              // Debug: Print for ST01-007
              if (cardId === 'ST01-007') {
                console.log(`DEBUG: Storing ST01-007 data:`, cardData[cardId]);
              }
            } else {
              console.log(`DEBUG: Skipping ${cardId} - no effect or trigger description`);
            }
          }
          
          // Debug: Print for ST01-007
          if (cardId === 'ST01-007') {
            console.log(`DEBUG: Found ST01-007 in ${filePath}`);
            console.log(`DEBUG: Effect match: ${effectMatch ? 'YES' : 'NO'}`);
            console.log(`DEBUG: Effect description: "${effectDescription}"`);
            console.log(`DEBUG: Trigger match: ${triggerMatch ? 'YES' : 'NO'}`);
            console.log(`DEBUG: Trigger description: "${triggerDescription}"`);
          }
        }
      });
    }
  });
  
  console.log(`📊 Found ${Object.keys(cardData).length} cards with effect/trigger descriptions from HTML sources`);
  
  // Debug: Show ST01-007 data
  if (cardData['ST01-007']) {
    console.log(`DEBUG: ST01-007 data:`, cardData['ST01-007']);
  } else {
    console.log(`DEBUG: ST01-007 not found in cardData`);
  }
  
  return cardData;
}

// Run the debug
console.log('🔍 Debugging HTML parsing...');
const htmlCardData = readHtmlSources(); 