const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../dist/index.html');
const dest = path.join(__dirname, '../android_app/app/src/main/assets/index.html');

try {
  // Ensure destination directory exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log('Successfully copied dist/index.html to android_app assets.');
} catch (err) {
  console.error('Failed to copy assets:', err.message);
}
