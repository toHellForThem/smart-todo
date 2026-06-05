const fs = require('fs');
const path = require('path');

const srcDir = path.normalize(path.join(__dirname, '../frontend/dist/assets/node_modules'));
const destDir = path.normalize(path.join(__dirname, '../frontend/dist/assets/fonts'));

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Recursively find and copy .ttf files
function findAndCopyTtf(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      findAndCopyTtf(fullPath);
    } else if (stat.isFile() && item.toLowerCase().endsWith('.ttf')) {
      const destPath = path.join(destDir, item);
      fs.copyFileSync(fullPath, destPath);
      console.log(`Copied font: ${item}`);
    }
  }
}

if (fs.existsSync(srcDir)) {
  try {
    findAndCopyTtf(srcDir);
    console.log('All fonts flattened and copied successfully!');
  } catch (err) {
    console.error('Failed to copy fonts:', err);
  }
} else {
  console.log('Source directory not found:', srcDir);
}
