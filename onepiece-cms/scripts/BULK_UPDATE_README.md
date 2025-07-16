# Bulk Update Scripts for New Sets

This directory contains comprehensive scripts for updating your card database when a new set is added to the One Piece TCG.

## 🚀 Quick Start

When you add a new set to your database, run this command to update all card information:

```bash
cd onepiece-cms/scripts
node update-all.js
```

This will run all relevant bulk update scripts automatically.

## 📋 What Gets Updated

The comprehensive update process includes:

### Critical Updates (Required)
- **Card Rarities** - Updates rarity information from HTML sources
- **Power Values** - Updates power values and fixes invalid power on stage/event cards
- **Cost Values** - Updates card cost information

### Optional Updates (Enhancement)
- **Card Effects** - Updates card effect text
- **Card Triggers** - Updates trigger information
- **Image Labels** - Updates image metadata and labels
- **Missing Variants** - Adds missing art variants
- **Art Variants** - Consolidates and cleans up art variants

## 🛠️ Available Scripts

### 1. Comprehensive Update Script
```bash
node run-all-bulk-updates.js
```
Runs all bulk update scripts with proper error handling and progress tracking.

### 2. Quick Update Script
```bash
node update-all.js
```
Simple wrapper that runs the comprehensive update with a friendly interface.

### 3. Individual Scripts
You can also run individual scripts if needed:

```bash
# Update rarities only
node bulk-update-rarities.js

# Update power values only
node bulk-update-power.js

# Update effects only
node bulk-update-effects.js

# Update triggers only
node bulk-update-triggers.js

# Update image labels only
node bulk-update-image-labels.js

# Add missing variants only
node add-missing-variants.js

# Update cost values using generic updater
node bulk-update-generic.js cost

# Consolidate art variants
node consolidate-art-variants.js
```

## 🔧 Command Line Options

### Dry Run Mode
Preview what scripts would run without executing them:
```bash
node run-all-bulk-updates.js --dry-run
```

### Skip Critical Scripts
Run only optional scripts (useful for testing):
```bash
node run-all-bulk-updates.js --skip-critical
```

## 📊 Script Output

The comprehensive script provides detailed output:

```
🎯 Starting comprehensive bulk update process...
============================================================

🔍 Running pre-flight checks...
✅ All pre-flight checks passed!

🔄 Starting bulk update scripts...

🚀 Running Rarities...
📝 Update card rarities from HTML sources
📁 Found 150 HTML files in crawler directory
📊 Found 1200 cards with rarity data from HTML sources
✅ Rarities completed successfully

🚀 Running Power Values...
📝 Update power values and fix invalid power on stage/event cards
📊 Found 1200 cards with power data from HTML sources
✅ Power Values completed successfully

...

============================================================
📊 BULK UPDATE SUMMARY
============================================================
⏱️  Total duration: 45 seconds
✅ Successful: 8/8
❌ Failed: 0/8

✅ Successfully completed:
   - Rarities
   - Power Values
   - Effects
   - Triggers
   - Image Labels
   - Missing Variants
   - Cost Values
   - Consolidate Variants

🔴 Critical scripts: 3/3 successful

🎉 All critical scripts completed successfully!
✅ Your card database has been updated with the latest information.
```

## ⚠️ Prerequisites

Before running the bulk update scripts, ensure:

1. **Crawler Data Available**: HTML files from the crawler must be present in `../../optcg-crawler/cards/`
2. **Data Directory Exists**: Card JSON files must be in `../../data/cards/` (root-level data directory)
3. **All Scripts Present**: All bulk update scripts must exist in the scripts directory

## 🔍 Pre-flight Checks

The comprehensive script automatically performs these checks:

- ✅ Validates all required scripts exist
- ✅ Checks crawler data availability
- ✅ Verifies data directory structure (root-level `/data` directory)
- ✅ Counts HTML files and card sets

## 🚨 Error Handling

The script includes robust error handling:

- **Individual Script Failures**: If one script fails, others continue
- **Critical vs Optional**: Critical scripts (rarities, power, cost) are marked as required
- **Detailed Logging**: All output is captured and displayed
- **Progress Tracking**: Shows which scripts succeeded/failed
- **Summary Report**: Final summary with statistics

## 🔧 Troubleshooting

### Common Issues

1. **Missing Crawler Data**
   ```
   ❌ Crawler directory not found: /path/to/optcg-crawler/cards
   ```
   **Solution**: Run the crawler first to generate HTML files

2. **Missing Data Directory**
   ```
   ❌ Data directory not found: /path/to/data/cards
   ```
   **Solution**: Ensure your card JSON files are in the correct location

3. **Script Not Found**
   ```
   ❌ Missing scripts:
      - bulk-update-rarities.js
   ```
   **Solution**: Ensure all bulk update scripts are present in the scripts directory

4. **Critical Script Failure**
   ```
   ⚠️  WARNING: Some critical scripts failed!
   ```
   **Solution**: Review the error output and run failed scripts individually

### Manual Recovery

If the comprehensive script fails, you can:

1. **Run Individual Scripts**: Execute failed scripts one by one
2. **Check Logs**: Review the detailed output for specific errors
3. **Verify Data**: Ensure crawler data and card files are correct
4. **Retry**: Run the comprehensive script again after fixing issues

## 📈 Performance

- **Typical Duration**: 30-60 seconds for a complete update
- **Memory Usage**: Minimal, processes files sequentially
- **Network**: No network calls, works entirely with local files
- **Scalability**: Handles thousands of cards efficiently

## 🔄 When to Run

Run the bulk update scripts when:

- ✅ A new set is added to the database
- ✅ Crawler data is updated with new information
- ✅ Card information needs to be synchronized
- ✅ Missing variants are discovered
- ✅ Art variants need consolidation

## 📝 Notes

- The scripts are designed to be **idempotent** - safe to run multiple times
- **Backup**: Always backup your data before running bulk updates
- **Testing**: Test on a development environment first
- **Validation**: Review the summary output to ensure all updates succeeded

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the detailed error output
3. Run individual scripts to isolate the problem
4. Verify your data structure matches the expected format 