const fs = require('fs');
const path = require('path');

function searchLocalStorageInJS(dir) {
  const results = [];
  
  function searchDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDirectory(fullPath);
        } else if (item.endsWith('.js')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('localStorage')) {
              results.push(fullPath);
            }
          } catch (err) {
            console.error(`Error reading file ${fullPath}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${currentDir}:`, err.message);
    }
  }
  
  searchDirectory(dir);
  return results;
}

// Search for localStorage in js directory
const jsDir = 'js';
if (fs.existsSync(jsDir)) {
  const files = searchLocalStorageInJS(jsDir);
  files.forEach(file => console.log(file));
} else {
  console.log('js directory not found');
}