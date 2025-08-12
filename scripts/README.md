# Scripts Directory

This directory contains utility scripts for development, debugging, and setup tasks.

## 📁 Folder Structure

### `/debug`
Contains debugging and diagnostic scripts:
- `debug-*.js/ts/mjs` - Scripts for debugging specific features
- `check-*.js/mjs` - Database and system checking scripts
- `diagnose-*.js` - Problem diagnosis scripts
- `scan-*.js` - Database scanning utilities
- `simple-*.js` - Simple diagnostic tools

### `/setup`
Contains setup and maintenance scripts:
- `admin-*.js` - Administrative setup scripts
- `apply-*.js` - Policy and configuration application scripts
- `create-*.js` - Data creation and initialization scripts
- `execute-*.js` - Script execution utilities
- `fix-*.js/mjs` - Bug fix and repair scripts
- `insert-*.js` - Data insertion scripts
- `update-*.js/mjs` - Update and migration scripts

### `/testing`
Contains testing scripts:
- `test-*.js/mjs` - Feature testing scripts
- `image-*.js` - Image functionality tests

## 🚀 Usage

Run scripts from the project root directory:

```bash
# Example: Run a debug script
node scripts/debug/debug-create-test-data.js

# Example: Run a setup script
node scripts/setup/create-test-data.js

# Example: Run a test script
node scripts/testing/test-cart.js
```

## ⚠️ Important Notes

- These scripts are for development purposes only
- Always backup your database before running setup/fix scripts
- Some scripts may require environment variables to be set
- Check script contents before running to understand what they do
