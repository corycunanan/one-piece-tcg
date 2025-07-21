# One Piece TCG Deck Management System

This document describes the backend deck management system for the One Piece TCG game.

## Overview

The deck system allows players to create, manage, and validate decks according to One Piece TCG rules. Each deck consists of:
- **1 Leader card** (required)
- **50 main deck cards** (Character, Event, or Stage cards)
- All cards must match at least one color of the leader card
- Maximum 4 copies of any given card

## Database Schema

### Deck Model (`models/Deck.js`)

```javascript
{
  name: String,                    // Deck name (required)
  description: String,             // Optional description
  leader: LeaderCardSchema,        // Leader card (required)
  mainDeck: [DeckCardSchema],     // Main deck cards (required)
  isValid: Boolean,                // Validation status
  validationErrors: [String],      // Validation error messages
  createdBy: String,               // Creator username
  isPublic: Boolean,               // Public/private visibility
  tags: [String],                  // Deck tags
  createdAt: Date,                 // Creation timestamp
  updatedAt: Date                  // Last update timestamp
}
```

### Leader Card Schema

```javascript
{
  cardId: String,                  // Unique card ID
  name: String,                    // Card name
  cardType: "LEADER",             // Must be LEADER
  life: Number,                    // Leader life points
  colors: [{ color: String }],     // Leader colors
  // ... other card properties
}
```

### Deck Card Schema

```javascript
{
  cardId: String,                  // Unique card ID
  name: String,                    // Card name
  cardType: String,                // CHARACTER, EVENT, or STAGE
  cost: Number,                    // Card cost
  power: Number,                   // Card power
  colors: [{ color: String }],     // Card colors
  quantity: Number,                // Number of copies (1-4)
  // ... other card properties
}
```

## API Endpoints

### Deck Management

#### GET `/decks`
Get all decks with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or description
- `isValid` (boolean): Filter by validation status
- `isPublic` (boolean): Filter by visibility
- `leaderId` (string): Filter by leader card
- `tags` (string): Comma-separated tags

**Response:**
```json
{
  "decks": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### GET `/decks/:id`
Get a specific deck by ID.

#### POST `/decks`
Create a new deck.

**Request Body:**
```json
{
  "name": "Deck Name",
  "description": "Optional description",
  "leader": { /* leader card object */ },
  "mainDeck": [ /* array of deck cards */ ],
  "tags": ["tag1", "tag2"],
  "isPublic": false
}
```

#### PUT `/decks/:id`
Update an existing deck.

#### DELETE `/decks/:id`
Delete a deck.

### Deck Validation

#### POST `/decks/:id/validate`
Validate a deck and return validation results.

**Response:**
```json
{
  "isValid": true,
  "errors": [],
  "stats": {
    "totalCards": 50,
    "cardTypeCounts": { "CHARACTER": 30, "EVENT": 15, "STAGE": 5 },
    "colorCounts": { "Red": 50 },
    "costDistribution": { "0": 10, "1": 15, "2": 20, "3": 5 }
  }
}
```

#### GET `/decks/:id/stats`
Get deck statistics.

### Card Management

#### POST `/decks/:id/add-card`
Add a card to the deck.

**Request Body:**
```json
{
  "cardId": "ST01-001",
  "quantity": 1
}
```

#### DELETE `/decks/:id/remove-card/:cardId`
Remove a card from the deck.

**Query Parameters:**
- `quantity` (number): Number of copies to remove (default: 1)

### Deck Operations

#### POST `/decks/:id/duplicate`
Duplicate a deck.

**Request Body:**
```json
{
  "newName": "Copied Deck Name"
}
```

### Statistics

#### GET `/decks/stats/overview`
Get overall deck statistics.

**Response:**
```json
{
  "totalDecks": 100,
  "validDecks": 85,
  "invalidDecks": 15,
  "publicDecks": 30,
  "leaderStats": [
    { "_id": "ST01-001", "count": 25, "leaderName": "Monkey D. Luffy" }
  ],
  "creationStats": [
    { "_id": { "year": 2024, "month": 1 }, "count": 10 }
  ]
}
```

## Validation Rules

The deck system enforces the following One Piece TCG rules:

1. **Leader Card**: Must have exactly one leader card of type LEADER
2. **Deck Size**: Main deck must contain exactly 50 cards
3. **Card Types**: Main deck can only contain CHARACTER, EVENT, or STAGE cards
4. **Copy Limits**: Maximum 4 copies of any given card
5. **Color Matching**: All cards must match at least one color of the leader card
6. **Card Data**: All cards must have valid card data

## Usage Examples

### Creating a Deck

```javascript
const deckData = {
  name: "Straw Hat Aggro",
  description: "Fast aggro deck with Straw Hat Crew",
  leader: leaderCard,
  mainDeck: [
    { ...card1, quantity: 4 },
    { ...card2, quantity: 3 },
    // ... more cards to reach 50 total
  ],
  tags: ["aggro", "straw-hat"],
  isPublic: true
};

const response = await fetch('http://localhost:5001/decks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(deckData)
});
```

### Validating a Deck

```javascript
const response = await fetch('http://localhost:5001/decks/123/validate', {
  method: 'POST'
});

const validation = await response.json();
if (validation.isValid) {
  console.log('Deck is valid!');
} else {
  console.log('Validation errors:', validation.errors);
}
```

### Getting Deck Statistics

```javascript
const response = await fetch('http://localhost:5001/decks/123/stats');
const stats = await response.json();
console.log(`Deck has ${stats.totalCards}/50 cards`);
```

## Testing

Run the test script to verify the API:

```bash
cd backend
node test-decks.js
```

## Admin Panel

Access the deck management interface at:
- **Cards**: `http://localhost:3000/admin-panel/index.html`
- **Decks**: `http://localhost:3000/admin-panel/decks.html`

The admin panel provides:
- Deck listing with search and filters
- Deck creation with leader selection
- Deck validation and statistics
- Deck duplication and deletion
- Overview statistics

## Integration with Frontend

The frontend deck builder can be integrated with this backend by:

1. **Loading Cards**: Fetch cards from `/cards` endpoint
2. **Creating Decks**: POST to `/decks` endpoint
3. **Validating Decks**: POST to `/decks/:id/validate` endpoint
4. **Saving Decks**: PUT to `/decks/:id` endpoint
5. **Loading Decks**: GET from `/decks` endpoint

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a `message` field with details about the error.

## Future Enhancements

- **Deck Import/Export**: Support for deck sharing formats
- **Deck Templates**: Pre-built deck templates
- **Deck Analytics**: Advanced statistics and analysis
- **Deck Sharing**: Social features for sharing decks
- **Tournament Support**: Tournament-legal deck validation
- **Card Recommendations**: AI-powered deck suggestions 