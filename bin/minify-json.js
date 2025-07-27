#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Minifies JSON files by removing whitespace and comments
 * @param {string} inputPath - Path to input JSON file
 * @param {string} outputPath - Path to output minified JSON file
 */
function minifyJsonFile(inputPath, outputPath) {
  try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const parsed = JSON.parse(data);
    const minified = JSON.stringify(parsed);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, minified, 'utf8');
    console.log(`Minified ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error minifying ${inputPath}:`, error.message);
    process.exit(1);
  }
}

// Minify specific files
const files = [
  {
    input: 'dist/manifest.json',
    output: 'dist/manifest.json'
  },
  {
    input: 'data/github-data.json',
    output: 'dist/data/github-data.json'
  }
];

files.forEach(file => {
  if (fs.existsSync(file.input)) {
    minifyJsonFile(file.input, file.output);
  } else {
    console.warn(`Warning: ${file.input} not found, skipping minification`);
  }
});

console.log('JSON minification complete');