# Data Management

This directory contains scripts for managing and maintaining the card database structure.

## Scripts

### Database Management
- **`update-db-json.js`** - Sync individual JSON files to db.json for JSON Server
- **`assign-cards-to-sets-from-html.js`** - Assign cards to sets based on HTML sources
- **`create-missing-set-files.js`** - Create missing set files
- **`migrate-card-sets-to-repeatable.js`** - Migrate card sets to repeatable format

### Data Consolidation
- **`consolidate-art-variants.js`** - Consolidate art variants and clean up duplicates
- **`consolidate-duplicate-cards.js`** - Consolidate duplicate card entries
- **`consolidate-duplicate-set-files.js`** - Consolidate duplicate set files
- **`fix-duplicate-set-files.js`** - Fix duplicate set files and ensure consistent naming

### Variant Management
- **`add-missing-variants.js`** - Add missing art variants
- **`check-missing-variants.js`** - Check for missing variants in the database

## Usage

Update the database:
```bash
cd data-management
node update-db-json.js
```

Add missing variants:
```bash
cd data-management
node add-missing-variants.js
```

Fix duplicate set files:
```bash
cd data-management
node fix-duplicate-set-files.js
``` 