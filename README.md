# One Piece TCG Scripts

This directory contains organized scripts for managing the One Piece TCG database and system.

## Directory Structure

### 📁 `bulk-updates/`
Scripts for bulk updating card data from HTML sources.
- **`update-all.js`** - Main entry point for running all bulk updates
- **`run-all-bulk-updates.js`** - Orchestrator for bulk update scripts
- Various `bulk-update-*.js` scripts for specific data types

### 📁 `data-management/`
Scripts for managing database structure and data integrity.
- **`update-db-json.js`** - Sync JSON files to db.json
- **`consolidate-*.js`** - Data consolidation scripts
- **`add-missing-variants.js`** - Add missing card variants

### 📁 `deck-management/`
Scripts for deck management functionality (future).
- Ready for deck building, validation, and analysis scripts

### 📁 `setup/`
Scripts for initial system setup and configuration.
- **`setup-json-server.js`** - Set up JSON Server
- **`create-admin-panel.js`** - Create admin interface

### 📁 `debug/`
Debugging and troubleshooting scripts.
- **`debug-html-parsing.js`** - Debug HTML parsing

## Quick Start

### Run Complete Bulk Update
```bash
node update-all.js
```

### Run Individual Updates
```bash
cd bulk-updates
node bulk-update-effects.js
```

### Update Database
```bash
cd data-management
node update-db-json.js
```

### Debug HTML Parsing
```bash
cd debug
node debug-html-parsing.js
```

## Adding New Scripts

When adding new scripts, place them in the appropriate directory:
- **Bulk updates**: `bulk-updates/`
- **Data management**: `data-management/`
- **Deck management**: `deck-management/`
- **Setup/configuration**: `setup/`
- **Debugging**: `debug/`

Update the relevant README files to document new scripts.
