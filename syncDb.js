const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

async function syncCollections() {
  try {
    await connectDB();
    console.log('Connected to DB for syncing...');
    
    const modelsPath = path.join(__dirname, 'models');
    const files = fs.readdirSync(modelsPath);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const Model = require(path.join(modelsPath, file));
        
        console.log(`Syncing collection for ${Model.modelName}...`);
        
        // Force collection creation
        try {
          await Model.createCollection();
        } catch (e) {
          if (e.code !== 48) { // 48 is NamespaceExists
            console.log(`Note for ${Model.modelName}:`, e.message);
          }
        }
        
        // Build indexes
        await Model.init();
        
        console.log(`Collection ${Model.modelName} synced successfully.`);
      }
    }
    
    console.log('All collections and indexes created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing collections:', error);
    process.exit(1);
  }
}

syncCollections();
