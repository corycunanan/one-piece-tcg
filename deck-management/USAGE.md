# Deck Creation Script Usage Guide

## Overview

The `create-deck.js` script allows you to interactively create One Piece TCG deck objects with full validation according to official game rules.

## Features

- **Interactive Deck Building**: Step-by-step process to create decks
- **Card Search**: Search cards by name or card ID
- **Automatic Validation**: Ensures decks follow One Piece TCG rules
- **Color Matching**: Only allows cards that match your leader's colors
- **Copy Limits**: Enforces maximum 4 copies per card
- **Deck Statistics**: Shows detailed deck composition
- **File Export**: Saves decks as JSON files

## Prerequisites

1. Make sure `db.json` exists in the project root (contains all card data)
2. Node.js installed on your system

## Usage

### Basic Usage

```bash
# Run the script directly
node deck-management/create-deck.js

# Or if executable permissions are set
./deck-management/create-deck.js
```

### Interactive Process

1. **Enter Deck Name**: Provide a name for your deck
2. **Select Leader**: Search and select a leader card
3. **Build Main Deck**: Add cards to reach exactly 50 cards
4. **Validation**: Script validates the deck automatically
5. **Save**: Deck is saved as a JSON file

## Deck Validation Rules

The script enforces these One Piece TCG rules:

- ✅ **1 Leader Card**: Exactly one leader card required
- ✅ **50 Main Deck Cards**: Must have exactly 50 cards
- ✅ **Card Type Restrictions**: Main deck can only contain CHARACTER, EVENT, or STAGE cards
- ✅ **Copy Limits**: Maximum 4 copies of any given card
- ✅ **Color Matching**: All cards must match at least one color of the leader card

## Example Session

```
🎴 One Piece TCG Deck Creator
==============================

📚 Loading card data...
✅ Loaded 2024 cards

Enter deck name: Straw Hat Aggro

🎯 STEP 1: Select your Leader Card
=====================================
Found 156 leader cards available.

Search for a leader (name or cardId): luffy

Found 8 leader(s):

1. Monkey D. Luffy (ST01-001)
   Type: LEADER | Cost: - | Power: - | Life: 4
   Colors: Red | Traits: Straw Hat Crew

2. Monkey D. Luffy (OP01-001)
   Type: LEADER | Cost: - | Power: - | Life: 4
   Colors: Red | Traits: Straw Hat Crew

Enter the number of the leader you want to select: 1

✅ Selected leader: Monkey D. Luffy (ST01-001)

🃏 STEP 2: Build your Main Deck (50 cards required)
===================================================
Leader colors: Red
You can only include cards that match your leader's colors.

Found 847 cards that match your leader's colors.

📊 Current deck: 0/50 cards

Search for cards to add (50 more needed): zoro

Found 12 card(s):

1. Roronoa Zoro (OP01-025)
   Type: CHARACTER | Cost: 3 | Power: 4000 | Life: -
   Colors: Red | Traits: Straw Hat Crew, Swordsman

2. Roronoa Zoro (ST01-002)
   Type: CHARACTER | Cost: 2 | Power: 2000 | Life: -
   Colors: Red | Traits: Straw Hat Crew

Enter the number of the card to add: 2

How many copies of Roronoa Zoro? (1-4): 4

✅ Added 4 copies of Roronoa Zoro

📊 Current deck: 4/50 cards

Search for cards to add (46 more needed): sanji

[... continues until 50 cards are added ...]

🔍 Validating deck...
✅ Deck is valid!

📊 Deck Statistics:
   Total cards: 50/50
   Card types: CHARACTER: 35, EVENT: 10, STAGE: 5
   Colors: Red: 50
   Cost distribution: 0: 10, 1: 15, 2: 20, 3: 5

💾 Deck saved to: /path/to/Straw_Hat_Aggro_2024-01-15T10-30-45-123Z.json

🎉 Deck creation complete!
📁 File: /path/to/Straw_Hat_Aggro_2024-01-15T10-30-45-123Z.json
✅ Valid: true
```

## Output Format

The script creates a JSON file with the following structure:

```json
{
  "name": "Straw Hat Aggro",
  "description": "",
  "leader": {
    "cardId": "ST01-001",
    "name": "Monkey D. Luffy",
    "cardType": "LEADER",
    "life": 4,
    "colors": [{"color": "Red"}],
    "traits": [{"trait": "Straw Hat Crew"}],
    // ... other card properties
  },
  "mainDeck": [
    {
      "cardId": "ST01-002",
      "name": "Roronoa Zoro",
      "cardType": "CHARACTER",
      "cost": 2,
      "power": 2000,
      "colors": [{"color": "Red"}],
      "traits": [{"trait": "Straw Hat Crew"}],
      "quantity": 4
      // ... other card properties
    }
    // ... more cards
  ],
  "createdAt": "2024-01-15T10:30:45.123Z",
  "updatedAt": "2024-01-15T10:30:45.123Z",
  "isValid": true,
  "validationErrors": []
}
```

## Tips

1. **Search Effectively**: Use partial names or card IDs to find cards quickly
2. **Plan Your Deck**: Think about your strategy before starting
3. **Check Colors**: Make sure your leader's colors support your strategy
4. **Balance Your Deck**: Consider cost distribution and card types
5. **Use Copy Limits**: Don't forget you can have up to 4 copies of each card

## Troubleshooting

### "Error loading card data"
- Make sure `db.json` exists in the project root
- Check that the file contains valid JSON with a `cards` array

### "No cards found matching your search"
- Try different search terms
- Use partial names (e.g., "luffy" instead of "Monkey D. Luffy")
- Use card IDs (e.g., "ST01-001")

### "Invalid selection"
- Make sure to enter a number corresponding to the card you want
- Numbers are shown next to each card in the search results

## Integration

The script exports functions that can be used in other parts of your application:

```javascript
const { createDeck, validateDeck, getDeckStats } = require('./deck-management/create-deck.js');

// Use the validation function
const validation = validateDeck(deckObject);
console.log('Is valid:', validation.isValid);

// Get deck statistics
const stats = getDeckStats(deckObject);
console.log('Total cards:', stats.totalCards);
``` 