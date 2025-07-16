#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

// Simple wrapper to run the comprehensive bulk update script
async function runUpdateAll() {
  const scriptPath = path.join(process.cwd(), 'run-all-bulk-updates.js');
  
  console.log('🎯 Running comprehensive bulk update for new set...');
  console.log('📋 This will update:');
  console.log('   ✅ Card rarities');
  console.log('   ✅ Power values');
  console.log('   ✅ Cost values');
  console.log('   ✅ Card effects');
  console.log('   ✅ Card triggers');
  console.log('   ✅ Image labels');
  console.log('   ✅ Missing variants');
  console.log('   ✅ Art variant consolidation');
  console.log('');
  
  const child = spawn('node', [scriptPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n🎉 All bulk updates completed successfully!');
      console.log('✅ Your card database is now up to date.');
    } else {
      console.log(`\n❌ Bulk update process failed with exit code ${code}`);
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    console.error('❌ Failed to start bulk update process:', error.message);
    process.exit(1);
  });
}

// Run the script
runUpdateAll(); 