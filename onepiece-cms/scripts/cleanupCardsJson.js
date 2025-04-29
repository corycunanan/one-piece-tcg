import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your raw cards.json (relative to this script's location)
const inputPath = path.join(__dirname, 'cards.json');
// Path where you want the fixed version to save
const outputPath = path.join(__dirname, 'cards.cleaned.json');

const cards = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const cleanedCards = cards.map(card => {
  const fixedCard = { ...card };

  // 1. Fix trigger_effect
  if (!fixedCard.trigger_effect || !Array.isArray(fixedCard.trigger_effect)) {
    fixedCard.trigger_effect = [{ effect_data: null }];
  } else if (fixedCard.trigger_effect.length === 0) {
    fixedCard.trigger_effect.push({ effect_data: null });
  } else {
    fixedCard.trigger_effect = fixedCard.trigger_effect.map(effect => ({
      effect_data: effect.effect_data ?? null
    }));
  }

  // 2. Ensure keywords exists as object
  if (!fixedCard.keywords || typeof fixedCard.keywords !== 'object') {
    fixedCard.keywords = {};
  }

  // 3. Warn if effect_logic is missing
  if (!fixedCard.effect_logic) {
    console.warn(`⚠️  Warning: Card ${fixedCard.name} is missing effect_logic`);
  }

  return fixedCard;
});

fs.writeFileSync(outputPath, JSON.stringify(cleanedCards, null, 2));
console.log(`✅ Cards cleaned and saved to ${outputPath}`);
