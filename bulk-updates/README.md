# Bulk Updates

This directory contains scripts for bulk updating card data from HTML sources.

## Scripts

### Core Update Scripts
- **`run-all-bulk-updates.js`** - Main orchestrator that runs all bulk update scripts
- **`update-all.js`** - Wrapper script for running the complete bulk update process
- **`bulk-update-all.js`** - Alternative entry point

### Data Update Scripts
- **`bulk-update-rarities.js`** - Update card rarities from HTML sources
- **`bulk-update-power.js`** - Update power values and fix invalid power on stage/event cards
- **`bulk-update-effects.js`** - Update card effects from HTML sources
- **`bulk-update-triggers.js`** - Update card triggers from HTML sources
- **`bulk-update-image-labels.js`** - Update image labels and metadata
- **`bulk-update-generic.js`** - Generic updater for various card properties
- **`bulk-fix-missing-fields.js`** - Ensure all cards have required fields and correct set assignments

## Usage

Run the complete bulk update process:
```bash
node update-all.js
```

Or run individual scripts:
```bash
cd bulk-updates
node bulk-update-effects.js
``` 