const fs = require('fs');
const path = require('path');

const src = path.normalize(path.join(__dirname, '../frontend/dist/assets/node_modules'));
const dest = path.normalize(path.join(__dirname, '../frontend/dist/assets/vendor'));

if (fs.existsSync(src)) {
  try {
    fs.cpSync(src, dest, { recursive: true });
    console.log('Successfully copied dist/assets/node_modules to dist/assets/vendor');
  } catch (err) {
    console.error('Failed to copy assets directory:', err);
  }
} else {
  console.log('Source assets directory not found, skipping copy:', src);
}
