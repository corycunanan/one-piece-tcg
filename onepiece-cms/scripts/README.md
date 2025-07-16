# Strapi Bulk Deletion Scripts

This directory contains scripts for bulk operations on Strapi content, specifically for deleting all entries.

## 🔧 Fixing Authentication Issues

If you're experiencing 404 or authentication errors, the issue is likely with the API tokens in your `.env` file. The tokens are currently split across multiple lines, which causes authentication failures.

### Step 1: Fix the .env file

Run the token fixer script:

```bash
cd onepiece-cms
node scripts/fixEnvTokens.js
```

This will clean up the API tokens by removing newlines and spaces.

### Step 2: Verify the fix

Check that your `.env` file now has properly formatted tokens:

```bash
grep "STRAPI_API_TOKEN" .env
grep "STRAPI_ADMIN_TOKEN" .env
```

The tokens should be on single lines without spaces or newlines.

## 🗑️ Deleting All Entries

### Option 1: Use the new comprehensive script

```bash
cd onepiece-cms
node scripts/deleteAllEntries.js
```

This script includes:
- ✅ Authentication testing before starting
- ✅ Proper error handling and retry logic
- ✅ Progress tracking and detailed logging
- ✅ Support for multiple content types (cards, sets, folders)
- ✅ Rate limiting to avoid overwhelming the server
- ✅ Comprehensive summary report

### Option 2: Use the original script (after fixing tokens)

```bash
cd onepiece-cms
node scripts/bulkDeleteAllCards.js
```

## 📋 Content Types

The `deleteAllEntries.js` script will delete entries from:
- `cards` - All card entries
- `sets` - All set entries  
- `folders` - All folder entries

To add more content types, edit the `CONTENT_TYPES` array in the script.

## 🔍 Troubleshooting

### Authentication Issues

1. **404 Errors**: Usually caused by malformed API tokens
   - Run `node scripts/fixEnvTokens.js` to fix token formatting
   - Ensure Strapi is running on the correct port (default: 1337)

2. **401 Unauthorized**: Invalid or missing API token
   - Check that `STRAPI_API_TOKEN` or `STRAPI_ADMIN_TOKEN` is set in `.env`
   - Verify the token is valid in Strapi admin panel
   - Ensure the token has proper permissions

3. **403 Forbidden**: Insufficient permissions
   - Check token permissions in Strapi admin
   - Ensure the token has delete permissions for the content types

### Common Issues

- **Script hangs**: Check if Strapi is running and accessible
- **Partial deletions**: Some entries may fail due to relationships or constraints
- **Rate limiting**: The script includes delays to avoid overwhelming the server

## 🛡️ Safety Features

The scripts include several safety features:

- **Authentication testing**: Verifies credentials before starting
- **Retry logic**: Automatically retries failed deletions
- **Rate limiting**: Delays between requests to avoid server overload
- **Progress tracking**: Shows detailed progress and final summary
- **Error handling**: Graceful handling of individual failures

## 📊 Script Output

The comprehensive script provides detailed output:

```
🚀 Starting bulk deletion of all Strapi entries...
📍 Base URL: http://localhost:1337
🔑 Using token: ✅ Present
🔐 Testing authentication...
✅ Authentication successful

🎯 Starting deletion for cards...
🔍 Fetching all cards...
📊 Found 150 cards to delete
🗑️ Deleted cards ID 1 (Card Name)
...

📊 Deletion Summary:
==================================================
cards:
  Total: 150
  Deleted: 150 ✅
  Failed: 0 ❌
sets:
  Total: 5
  Deleted: 5 ✅
  Failed: 0 ❌
==================================================
🎉 Total deleted: 155
💥 Total failed: 0

✅ All deletions completed successfully!
```

## ⚠️ Important Notes

- **Backup first**: Always backup your data before running deletion scripts
- **Test environment**: Test on a development environment first
- **Permissions**: Ensure your API token has delete permissions
- **Relationships**: Some entries may not delete due to foreign key constraints 