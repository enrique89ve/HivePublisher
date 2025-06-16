#!/usr/bin/env node

/**
 * Build script for HiveTS
 * Generates both CommonJS and ESM builds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building HiveTS...\n');

// Clean previous builds
console.log('1️⃣ Cleaning previous builds...');
execSync('npx rimraf dist dist-esm', { stdio: 'inherit' });

// Build CommonJS
console.log('2️⃣ Building CommonJS...');
execSync('npx tsc -p tsconfig.cjs.json', { stdio: 'inherit' });

// Build ESM
console.log('3️⃣ Building ESM...');
execSync('npx tsc -p tsconfig.esm.json', { stdio: 'inherit' });

// Create package.json for ESM
console.log('4️⃣ Setting up module types...');
const esmPackageJson = {
  type: 'module'
};
fs.writeFileSync(
  path.join(__dirname, '../dist-esm/package.json'),
  JSON.stringify(esmPackageJson, null, 2)
);

// Copy ESM files with .mjs extension
console.log('5️⃣ Creating .mjs files...');
const copyWithExtension = (dir, ext) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      copyWithExtension(fullPath, ext);
    } else if (file.endsWith('.js')) {
      const newName = file.replace('.js', ext);
      const newPath = path.join(dir.replace('dist-esm', 'dist'), newName);
      
      // Ensure directory exists
      const newDir = path.dirname(newPath);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      
      fs.copyFileSync(fullPath, newPath);
    }
  });
};

copyWithExtension(path.join(__dirname, '../dist-esm'), '.mjs');

// Clean up temporary ESM directory
execSync('npx rimraf dist-esm', { stdio: 'inherit' });

console.log('✅ Build completed successfully!\n');
console.log('📦 Generated files:');
console.log('  - dist/*.js (CommonJS)');
console.log('  - dist/*.mjs (ESM)');
console.log('  - dist/*.d.ts (TypeScript definitions)');
console.log('  - dist/*.js.map (Source maps)\n');
