# One Piece TCG Data Management

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Export data from Strapi:**
   ```bash
   npm run export
   ```

3. **Start JSON Server:**
   ```bash
   npm start
   ```

4. **View your data:**
   - Cards: http://localhost:3001/cards
   - Sets: http://localhost:3001/sets
   - Metadata: http://localhost:3001/metadata

## API Endpoints

- `GET /cards` - Get all cards
- `GET /cards/:id` - Get specific card
- `POST /cards` - Add new card
- `PUT /cards/:id` - Update card
- `DELETE /cards/:id` - Delete card
- `GET /sets` - Get all sets
- `GET /metadata` - Get metadata

## Features

- ✅ REST API from JSON files
- ✅ Real-time updates
- ✅ Search and filtering
- ✅ Pagination
- ✅ Full CRUD operations
- ✅ No database required

## File Structure

```
data/
├── cards/
│   ├── op01-romance-dawn.json
│   └── eb01-memorial-collection.json
├── sets/
│   └── sets.json
└── metadata/
    └── metadata.json
```

## Git Workflow

```bash
# Make changes via API or edit files directly
git add data/
git commit -m "Add new cards"
git push
```
