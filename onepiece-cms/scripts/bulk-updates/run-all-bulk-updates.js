import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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
    script: 'add-missing-variants.js',
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
    script: 'consolidate-art-variants.js',
    description: 'Consolidate art variants and clean up duplicates',
    critical: false
  },
  {
    name: 'Consolidate Duplicate Cards',
    script: 'consolidate-duplicate-cards.js',
    description: 'Consolidate duplicate card entries and clean up database',
    critical: false
  },
  {
    name: 'Fix Duplicate Set Files',
    script: 'fix-duplicate-set-files.js',
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
    script: 'update-db-json.js',
    description: 'Sync individual JSON files to db.json for JSON Server',
    critical: true
  }
];

// Function to run a single script
async function runScript(scriptConfig) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), scriptConfig.script);
    
    console.log(`\n🚀 Running ${scriptConfig.name}...`);
    console.log(`📝 ${scriptConfig.description}`);
    
    const args = scriptConfig.args || [];
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptConfig.name} completed successfully`);
        resolve({ success: true, output, errorOutput });
      } else {
        console.log(`❌ ${scriptConfig.name} failed with exit code ${code}`);
        reject({ 
          success: false, 
          code, 
          output, 
          errorOutput, 
          script: scriptConfig.name 
        });
      }
    });
    
    child.on('error', (error) => {
      console.log(`❌ ${scriptConfig.name} failed to start: ${error.message}`);
      reject({ 
        success: false, 
        error: error.message, 
        script: scriptConfig.name 
      });
    });
  });
}

// Function to check if scripts exist
function validateScripts() {
  const missingScripts = [];
  
  BULK_UPDATE_SCRIPTS.forEach(scriptConfig => {
    const scriptPath = path.join(process.cwd(), scriptConfig.script);
    if (!fs.existsSync(scriptPath)) {
      missingScripts.push(scriptConfig.script);
    }
  });
  
  if (missingScripts.length > 0) {
    console.log('❌ Missing scripts:');
    missingScripts.forEach(script => {
      console.log(`   - ${script}`);
    });
    return false;
  }
  
  return true;
}

// Function to check if crawler data exists
function checkCrawlerData() {
  const crawlerDir = path.join(process.cwd(), '..', '..', 'optcg-crawler', 'cards');
  
  if (!fs.existsSync(crawlerDir)) {
    console.log('❌ Crawler directory not found:', crawlerDir);
    return false;
  }
  
  // Check if there are HTML files
  function countHtmlFiles(dir) {
    let count = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        count += countHtmlFiles(fullPath);
      } else if (item.endsWith('.html')) {
        count++;
      }
    }
    
    return count;
  }
  
  const htmlCount = countHtmlFiles(crawlerDir);
  console.log(`📁 Found ${htmlCount} HTML files in crawler directory`);
  
  if (htmlCount === 0) {
    console.log('❌ No HTML files found in crawler directory');
    return false;
  }
  
  return true;
}

// Function to check if data directory exists
function checkDataDirectory() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data', 'cards');
  
  if (!fs.existsSync(dataDir)) {
    console.log('❌ Data directory not found:', dataDir);
    return false;
  }
  
  const cardFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
  console.log(`📊 Found ${cardFiles.length} card set files in data directory`);
  
  if (cardFiles.length === 0) {
    console.log('❌ No card set files found in data directory');
    return false;
  }
  
  return true;
}

// Main function
async function runAllBulkUpdates() {
  const startTime = Date.now();
  const results = {
    successful: [],
    failed: [],
    critical: {
      successful: [],
      failed: []
    }
  };
  
  try {
    console.log('🎯 Starting comprehensive bulk update process...');
    console.log('=' .repeat(60));
    
    // Pre-flight checks
    console.log('\n🔍 Running pre-flight checks...');
    
    if (!validateScripts()) {
      console.log('❌ Script validation failed. Please ensure all scripts exist.');
      return;
    }
    
    if (!checkCrawlerData()) {
      console.log('❌ Crawler data check failed. Please ensure crawler data is available.');
      return;
    }
    
    if (!checkDataDirectory()) {
      console.log('❌ Data directory check failed. Please ensure data directory exists.');
      return;
    }
    
    console.log('✅ All pre-flight checks passed!\n');
    
    // Run scripts
    console.log('🔄 Starting bulk update scripts...\n');
    
    for (const scriptConfig of BULK_UPDATE_SCRIPTS) {
      try {
        const result = await runScript(scriptConfig);
        results.successful.push(scriptConfig.name);
        
        if (scriptConfig.critical) {
          results.critical.successful.push(scriptConfig.name);
        }
        
      } catch (error) {
        console.log(`❌ ${scriptConfig.name} failed:`, error.error || `Exit code ${error.code}`);
        results.failed.push(scriptConfig.name);
        
        if (scriptConfig.critical) {
          results.critical.failed.push(scriptConfig.name);
        }
        
        // If it's a critical script, ask user if they want to continue
        if (scriptConfig.critical) {
          console.log(`⚠️  ${scriptConfig.name} is a critical script. Do you want to continue with the remaining scripts? (y/n)`);
          // In a real implementation, you might want to add user input handling here
          // For now, we'll continue but log the warning
          console.log('⚠️  Continuing with remaining scripts...');
        }
      }
    }
    
    // Summary
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 BULK UPDATE SUMMARY');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total duration: ${duration} seconds`);
    console.log(`✅ Successful: ${results.successful.length}/${BULK_UPDATE_SCRIPTS.length}`);
    console.log(`❌ Failed: ${results.failed.length}/${BULK_UPDATE_SCRIPTS.length}`);
    
    if (results.successful.length > 0) {
      console.log('\n✅ Successfully completed:');
      results.successful.forEach(script => {
        console.log(`   - ${script}`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed scripts:');
      results.failed.forEach(script => {
        console.log(`   - ${script}`);
      });
    }
    
    // Critical scripts summary
    const criticalScripts = BULK_UPDATE_SCRIPTS.filter(s => s.critical);
    console.log(`\n🔴 Critical scripts: ${results.critical.successful.length}/${criticalScripts.length} successful`);
    
    if (results.critical.failed.length > 0) {
      console.log('⚠️  WARNING: Some critical scripts failed!');
      console.log('   Failed critical scripts:');
      results.critical.failed.forEach(script => {
        console.log(`   - ${script}`);
      });
    }
    
    // Final status
    if (results.critical.failed.length === 0) {
      console.log('\n🎉 All critical scripts completed successfully!');
      console.log('✅ Your card database has been updated with the latest information.');
    } else {
      console.log('\n⚠️  Some critical scripts failed. Please review the errors above.');
      console.log('🔧 You may need to run failed scripts individually to fix issues.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error in bulk update process:', error.message);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  skipCritical: args.includes('--skip-critical'),
  scripts: args.filter(arg => !arg.startsWith('--'))
};

if (options.dryRun) {
  console.log('🔍 DRY RUN MODE - No scripts will be executed');
  console.log('📋 Scripts that would be run:');
  BULK_UPDATE_SCRIPTS.forEach(script => {
    console.log(`   - ${script.name} (${script.critical ? 'CRITICAL' : 'OPTIONAL'})`);
  });
  process.exit(0);
}

if (options.skipCritical) {
  console.log('⚠️  SKIP CRITICAL MODE - Critical scripts will be skipped');
  BULK_UPDATE_SCRIPTS = BULK_UPDATE_SCRIPTS.filter(script => !script.critical);
}

// Run the script
runAllBulkUpdates(); 