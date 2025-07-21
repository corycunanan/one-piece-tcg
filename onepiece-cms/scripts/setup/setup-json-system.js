import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up JSON-based data management system...\n');

// Step 1: Setup JSON Server
console.log('🔧 Step 1: Setting up JSON Server...');
try {
  execSync('node scripts/setup-json-server.js', { stdio: 'inherit' });
  console.log('✅ JSON Server setup complete\n');
} catch (error) {
  console.log('❌ JSON Server setup failed:', error.message);
}

// Step 2: Create admin panel
console.log('🎨 Step 2: Creating admin panel...');
try {
  execSync('node scripts/create-admin-panel.js', { stdio: 'inherit' });
  console.log('✅ Admin panel created\n');
} catch (error) {
  console.log('❌ Admin panel creation failed:', error.message);
}

// Step 3: Create Git setup
console.log('📝 Step 3: Setting up Git tracking...');
const dataDir = path.join(process.cwd(), '..', 'data');
const gitignorePath = path.join(process.cwd(), '..', '.gitignore');

if (fs.existsSync(dataDir)) {
  // Add data directory to .gitignore if it doesn't exist
  let gitignore = '';
  if (fs.existsSync(gitignorePath)) {
    gitignore = fs.readFileSync(gitignorePath, 'utf8');
  }
  
  if (!gitignore.includes('data/')) {
    gitignore += '\n# Data files (uncomment to ignore)\n# data/\n';
    fs.writeFileSync(gitignorePath, gitignore);
    console.log('✅ Updated .gitignore');
  }
  
  console.log('✅ Data directory ready for Git tracking');
} else {
  console.log('⚠️ Data directory not found. Please create data directory first.');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. cd .. && npm install');
console.log('2. npm start (starts JSON Server)');
console.log('3. Open admin-panel/index.html in your browser');
console.log('4. Or visit http://localhost:3001 for API access');
console.log('\n📁 Your data is now managed with:');
console.log('   - JSON files (reliable, fast)');
console.log('   - Git version control (track changes)');
console.log('   - JSON Server (REST API)');
console.log('   - Admin panel (web interface)');
console.log('   - Direct HTML to JSON updates'); 