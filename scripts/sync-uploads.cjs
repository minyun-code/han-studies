'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const source = path.join(repoRoot, 'backend/public/uploads');
const target = path.join(repoRoot, 'frontend/public/uploads');
const args = process.argv.slice(2);

if (args.some((arg) => arg !== '--dry-run')) {
  console.error('Usage: npm run sync:uploads -- [--dry-run]');
  process.exit(1);
}

if (!fs.existsSync(source)) {
  console.error('backend/public/uploads is missing. Restore the selected CMS uploads first.');
  process.exit(1);
}

function countFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).reduce((count, entry) => {
    if (entry.isSymbolicLink()) {
      throw new Error('Upload symlinks are not supported.');
    }
    return count + (entry.isDirectory() ? countFiles(path.join(directory, entry.name)) : 1);
  }, 0);
}

function copyUploads(directory, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) {
      throw new Error('Upload symlinks are not supported.');
    }
    const from = path.join(directory, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyUploads(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

try {
  const count = countFiles(source);
  if (args.includes('--dry-run')) {
    console.log(`Dry run: ${count} files, backend/public/uploads -> frontend/public/uploads`);
  } else {
    copyUploads(source, target);
    console.log(`Copied ${count} files, backend/public/uploads -> frontend/public/uploads`);
    console.log('Matching filenames were overwritten; other existing files were retained.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
