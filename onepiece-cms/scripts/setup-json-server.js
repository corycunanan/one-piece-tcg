import fs from 'fs';
import path from 'path';

// Create a db.json file for JSON Server
function createDbJson() {
  const dataDir = path.join(process.cwd(), '..', 'data');
  const dbPath = path.join(process.cwd(), '..', 'db.json');
  
  if (!fs.existsSync(dataDir)) {
    console.log('❌ Data directory not found. Please create data directory first.');
    return;
  }
  
  const db = {
    cards: [],
    sets: [],
    metadata: {}
  };
  
  // Read all card files
  const cardsDir = path.join(dataDir, 'cards');
  if (fs.existsSync(cardsDir)) {
    const cardFiles = fs.readdirSync(cardsDir).filter(f => f.endsWith('.json'));
    
    cardFiles.forEach(file => {
      const filePath = path.join(cardsDir, file);
      const cardData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      db.cards.push(...cardData.cards);
    });
  }
  
  // Read sets
  const setsPath = path.join(dataDir, 'sets', 'sets.json');
  if (fs.existsSync(setsPath)) {
    const setsData = JSON.parse(fs.readFileSync(setsPath, 'utf8'));
    db.sets = setsData.sets;
  }
  
  // Read metadata
  const metadataPath = path.join(dataDir, 'metadata', 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    db.metadata = metadata;
  }
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  console.log('✅ Created db.json for JSON Server');
  console.log(`📊 Total cards: ${db.cards.length}`);
  console.log(`📊 Total sets: ${db.sets.length}`);
}

// Create package.json for JSON Server
function createPackageJson() {
  const packagePath = path.join(process.cwd(), '..', 'package.json');
  
  const packageJson = {
    "name": "one-piece-tcg-data",
    "version": "1.0.0",
    "description": "One Piece TCG Data Management",
    "scripts": {
      "start": "json-server --watch db.json --port 3001",
      "dev": "json-server --watch db.json --port 3001 --host 0.0.0.0"
    },
    "dependencies": {
      "json-server": "^0.17.4"
    }
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Created package.json');
}

// Create README with instructions
function createReadme() {
  const readmePath = path.join(process.cwd(), '..', 'README.md');
  
  const readme = `# One Piece TCG Data Management

## Quick Start

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start JSON Server:**
   \`\`\`bash
   npm start
   \`\`\`

3. **View your data:**
   - Cards: http://localhost:3001/cards
   - Sets: http://localhost:3001/sets
   - Metadata: http://localhost:3001/metadata

## API Endpoints

- \`GET /cards\` - Get all cards
- \`GET /cards/:id\` - Get specific card
- \`POST /cards\` - Add new card
- \`PUT /cards/:id\` - Update card
- \`DELETE /cards/:id\` - Delete card
- \`GET /sets\` - Get all sets
- \`GET /metadata\` - Get metadata

## Features

- ✅ REST API from JSON files
- ✅ Real-time updates
- ✅ Search and filtering
- ✅ Pagination
- ✅ Full CRUD operations
- ✅ No database required
- ✅ Direct HTML to JSON updates

## File Structure

\`\`\`
data/
├── cards/
│   ├── op01-romance-dawn.json
│   └── eb01-memorial-collection.json
├── sets/
│   └── sets.json
└── metadata/
    └── metadata.json
\`\`\`

## Git Workflow

\`\`\`bash
# Make changes via API or edit files directly
git add data/
git commit -m "Add new cards"
git push
\`\`\`

## Bulk Updates

Use the scripts in \`onepiece-cms/scripts/\` to update data directly from HTML sources:

- \`bulk-update-rarities.js\` - Update rarities from HTML
- \`bulk-update-power.js\` - Update power values from HTML
- \`bulk-update-generic.js\` - Generic bulk updates from HTML
- \`check-missing-variants.js\` - Check for missing variants
- \`consolidate-art-variants.js\` - Consolidate art variants
- \`add-missing-variants.js\` - Add missing variants
`;
  
  fs.writeFileSync(readmePath, readme);
  console.log('✅ Created README.md');
}

// Main setup function
function setup() {
  console.log('🚀 Setting up JSON Server...');
  
  createDbJson();
  createPackageJson();
  createReadme();
  
  console.log('\n🎉 Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. cd .. && npm install');
  console.log('2. npm start');
  console.log('3. Visit http://localhost:3001');
}

setup(); 