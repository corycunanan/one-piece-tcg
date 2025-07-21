// Configuration for all bulk update scripts
const BULK_UPDATE_SCRIPTS = [
  {
    name: 'Rarities',
    script: 'bulk-update-rarities.js',
    description: 'Update card rarities from HTML sources',
    critical: true
  },
  {
    name: 'Power Values',
    script: 'bulk-update-power.js',
    description: 'Update power values and fix invalid power on stage/event cards',
    critical: true
  },
  {
    name: 'Effects',
    script: 'bulk-update-effects.js',
    description: 'Update card effects from HTML sources',
    critical: false
  },
  {
    name: 'Triggers',
    script: 'bulk-update-triggers.js',
    description: 'Update card triggers from HTML sources',
    critical: false
  },
  {
    name: 'Image Labels',
    script: 'bulk-update-image-labels.js',
    description: 'Update image labels and metadata',
    critical: false
  },
  {
    name: 'Missing Variants',
    script: '../data-management/add-missing-variants.js',
    description: 'Add missing art variants',
    critical: false
  },
  {
    name: 'Cost Values',
    script: 'bulk-update-generic.js',
    description: 'Update card cost values using generic updater',
    critical: true,
    args: ['cost']
  },
  {
    name: 'Consolidate Variants',
    script: '../data-management/consolidate-art-variants.js',
    description: 'Consolidate art variants and clean up duplicates',
    critical: false
  },
  {
    name: 'Consolidate Duplicate Cards',
    script: '../data-management/consolidate-duplicate-cards.js',
    description: 'Consolidate duplicate card entries and clean up database',
    critical: false
  },
  {
    name: 'Fix Duplicate Set Files',
    script: '../data-management/fix-duplicate-set-files.js',
    description: 'Fix duplicate set files and ensure consistent naming',
    critical: false
  },
  {
    name: 'Fix Missing Fields and Sets',
    script: 'bulk-fix-missing-fields.js',
    description: 'Ensure all cards have required fields and correct set assignments',
    critical: true
  },
  {
    name: 'Update Database',
    script: '../data-management/update-db-json.js',
    description: 'Sync individual JSON files to db.json for JSON Server',
    critical: true
  }
]; 