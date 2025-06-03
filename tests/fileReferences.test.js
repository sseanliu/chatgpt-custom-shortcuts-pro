const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');

function checkFileExists(relPath) {
  const filePath = path.join(root, relPath);
  assert(fs.existsSync(filePath), `Referenced file missing: ${relPath}`);
}

// Parse popup.html for script src paths
const popupHtml = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
const scriptRegex = /<script[^>]*src=["']([^"']+)["']/gi;
let match;
while ((match = scriptRegex.exec(popupHtml))) {
  checkFileExists(match[1]);
}

// Parse manifest.json
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

if (manifest.icons) {
  Object.values(manifest.icons).forEach(checkFileExists);
}

if (manifest.action && manifest.action.default_icon) {
  const icons = manifest.action.default_icon;
  if (typeof icons === 'string') {
    checkFileExists(icons);
  } else {
    Object.values(icons).forEach(checkFileExists);
  }
}

if (manifest.background) {
  if (manifest.background.service_worker) {
    checkFileExists(manifest.background.service_worker);
  }
  if (Array.isArray(manifest.background.scripts)) {
    manifest.background.scripts.forEach(checkFileExists);
  }
}

if (Array.isArray(manifest.content_scripts)) {
  manifest.content_scripts.forEach(cs => {
    if (Array.isArray(cs.js)) {
      cs.js.forEach(checkFileExists);
    }
  });
}

console.log('All referenced files exist.');
