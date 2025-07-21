# One Piece TCG Deck Creator

A modular deck creation system for the One Piece Trading Card Game.

## Structure

The deck creation system has been broken down into modular components for better maintainability and reusability:

### Core Modules

#### `utils/data-loader.js`
- **Purpose**: Handles data loading and user input
- **Functions**:
  - `loadCardData()`: Loads card data from `db.json`
  - `question(prompt)`: Promise wrapper for readline input
  - `rl`: Readline interface for user interaction

#### `utils/card-display.js`
- **Purpose**: Card display and search functionality
- **Functions**:
  - `displayCard(card, index)`: Displays formatted card information
  - `searchCards(cards, query)`: Searches cards by name or cardId
  - `filterCardsByType(cards, cardType)`: Filters cards by type

#### `utils/deck-validation.js`
- **Purpose**: Deck validation and statistics
- **Functions**:
  - `validateDeck(deck)`: Validates deck according to One Piece TCG rules
  - `getDeckStats(deck)`: Generates deck statistics

#### `utils/deck-builder.js`
- **Purpose**: Interactive deck building
- **Functions**:
  - `selectLeader(cards)`: Interactive leader selection
  - `buildMainDeck(cards, leader)`: Interactive main deck building with bulk import option

#### `utils/bulk-importer.js`
- **Purpose**: Bulk card import functionality
- **Functions**:
  - `parseBulkImport(input)`: Parses quantityxcardId format
  - `validateCards(cards, allCards)`: Validates cards exist in database
  - `bulkImportCards(deck, cardsToAdd, allCards)`: Adds cards to deck
  - `interactiveBulkImport(deck, allCards, question)`: Interactive bulk import

#### `utils/deck-loader.js`
- **Purpose**: Deck file loading and discovery
- **Functions**:
  - `getAvailableDecks()`: Lists all available deck files from `/data/decks`
  - `loadDeckFromFile(filepath)`: Loads deck data from file

#### `utils/deck-categorizer.js`
- **Purpose**: Card categorization by type
- **Functions**:
  - `categorizeCards(deck)`: Categorizes cards by type (Characters, Events, Stages)

#### `utils/deck-display.js`
- **Purpose**: Deck display and statistics
- **Functions**:
  - `displayDeckList(decks)`: Shows numbered list of available decks
  - `displayCategory(categoryName, cards, title)`: Shows cards in a category with frequency
  - `displayDeckStats(deck)`: Shows detailed deck statistics

#### `utils/deck-viewer.js`
- **Purpose**: Main deck viewing orchestration
- **Functions**:
  - `viewDeck()`: Interactive deck viewer

#### `utils/file-operations.js`
- **Purpose**: File system operations
- **Functions**:
  - `saveDeck(deck, deckName)`: Saves deck to `/data/decks` directory

### Main Scripts

#### `create-deck-modular.js`
- Modular version using the separated components
- Provides complete deck creation functionality with better organization
- Includes bulk import option during deck building

#### `view-deck.js`
- Interactive deck viewer and analyzer
- Lists available decks and displays detailed card breakdowns

#### `bulk-import.js`
- Standalone bulk import tool for existing decks
- Allows adding multiple cards at once using quantityxcardId format

## Directory Structure

```
project-root/
├── deck-management/          # Application code
│   ├── utils/               # Modular components
│   ├── create-deck-modular.js
│   ├── view-deck.js
│   └── bulk-import.js
├── data/
│   └── decks/              # Deck storage (JSON files)
│       ├── frontend/       # TypeScript files for browser-based deck builder
│       └── *.json          # Individual deck files
└── db.json                 # Card database
```

## Usage

### Using npm scripts (Recommended)
```bash
# Create a new deck
npm run create

# View existing decks
npm run view

# Bulk import cards into existing decks
npm run bulk-import

# Or use the start script (creates new deck)
npm start
```

### Direct Node.js execution
```bash
# Create a new deck
node create-deck-modular.js

# View existing decks
node view-deck.js

# Bulk import cards
node bulk-import.js
```

## Features

### Deck Creation
- Interactive leader selection
- Card search and filtering
- **Bulk import during deck building** (new!)
- Automatic validation
- Deck statistics
- File export to `/data/decks`

### Deck Viewing
- List all available decks from `/data/decks`
- Detailed card breakdown by type (Characters, Events, Stages)
- Card frequency display
- Cost and color distribution
- Validation status
- Leader information

### Bulk Import (New!)
- **Format**: `quantityxcardId` (e.g., `4xOP05-015`)
- **Integration**: Available during deck creation and as standalone tool
- **Validation**: Checks card existence, quantity limits, deck size limits
- **Flexibility**: Can import into existing decks or during creation
- **Error Handling**: Detailed error messages for invalid cards/quantities

### Bulk Import Examples
```
4xOP05-015    # 4 copies of card OP05-015
1xP-069       # 1 copy of card P-069
2xOP09-108    # 2 copies of card OP09-108
```

## Benefits of Modular Structure

1. **Separation of Concerns**: Each module has a specific responsibility
2. **Reusability**: Individual modules can be imported and used elsewhere
3. **Testability**: Each module can be tested independently
4. **Maintainability**: Easier to locate and modify specific functionality
5. **Readability**: Smaller, focused files are easier to understand
6. **Scalability**: Decks stored in dedicated `/data/decks` directory
7. **Flexibility**: Multiple ways to add cards (individual search, bulk import)

## Module Dependencies

```
create-deck-modular.js
├── utils/data-loader.js
├── utils/card-display.js
├── utils/deck-validation.js
├── utils/deck-builder.js
│   ├── utils/data-loader.js (for question function)
│   ├── utils/card-display.js (for display functions)
│   └── utils/bulk-importer.js (for bulk import)
└── utils/file-operations.js

view-deck.js
├── utils/deck-viewer.js
│   ├── utils/data-loader.js (for question function)
│   ├── utils/card-display.js (for display functions)
│   ├── utils/deck-loader.js (for loading decks)
│   ├── utils/deck-categorizer.js (for categorizing cards)
│   └── utils/deck-display.js (for displaying deck info)

bulk-import.js
├── utils/data-loader.js
├── utils/deck-loader.js
├── utils/deck-display.js
├── utils/bulk-importer.js
└── utils/file-operations.js
```

## Validation Rules

The deck validation follows One Piece TCG rules:
- Exactly 1 leader card
- Exactly 50 cards in main deck
- Main deck can only contain CHARACTER, EVENT, or STAGE cards
- Maximum 4 copies of any card (except OP01-075 which has unlimited copies)
- All cards must match leader's colors 