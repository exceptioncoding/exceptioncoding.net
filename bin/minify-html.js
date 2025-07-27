#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

/**
 * Get all HTML files from a directory
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of HTML file paths
 */
function getHtmlFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && path.extname(item).toLowerCase() === '.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Minify an HTML file
 * @param {string} filePath - Path to HTML file
 * @returns {Promise<{originalSize: number, minifiedSize: number}>}
 */
async function minifyHtmlFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const originalSize = originalContent.length;
    
    const minifiedContent = await minify(originalContent, {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      minifyCSS: true,
      minifyJS: true,
      ignoreCustomFragments: [/\s*<pre[^>]*>[\s\S]*?<\/pre>\s*/gi],
      // Security: Prevent custom fragment issues
      caseSensitive: false,
      keepClosingSlash: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    });
    
    const minifiedSize = minifiedContent.length;
    
    fs.writeFileSync(filePath, minifiedContent, 'utf8');
    
    return { originalSize, minifiedSize };
  } catch (error) {
    console.error(`Error minifying ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Main minification function
 */
async function main() {
  const distDir = 'dist';
  
  if (!fs.existsSync(distDir)) {
    console.log('No dist directory found, skipping HTML minification');
    return;
  }
  
  const htmlFiles = getHtmlFiles(distDir);
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found to minify');
    return;
  }
  
  console.log(`Minifying ${htmlFiles.length} HTML files...`);
  
  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;
  let minifiedCount = 0;
  
  for (const filePath of htmlFiles) {
    try {
      const { originalSize, minifiedSize } = await minifyHtmlFile(filePath);
      
      totalOriginalSize += originalSize;
      totalMinifiedSize += minifiedSize;
      minifiedCount++;
      
      const savedBytes = originalSize - minifiedSize;
      const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : 0;
      
      const relativePath = path.relative(distDir, filePath);
      console.log(`✓ ${relativePath} - ${originalSize} → ${minifiedSize} bytes (saved ${savedPercent}%)`);
    } catch (error) {
      console.error(`✗ Failed to minify ${path.relative(distDir, filePath)}`);
    }
  }
  
  const totalSaved = totalOriginalSize - totalMinifiedSize;
  const totalSavedPercent = totalOriginalSize > 0 ? ((totalSaved / totalOriginalSize) * 100).toFixed(1) : 0;
  
  console.log(`\nHTML minification complete:`);
  console.log(`- Minified: ${minifiedCount} files`);
  console.log(`- Original size: ${(totalOriginalSize / 1024).toFixed(1)} KB`);
  console.log(`- Minified size: ${(totalMinifiedSize / 1024).toFixed(1)} KB`);
  console.log(`- Total saved: ${(totalSaved / 1024).toFixed(1)} KB (${totalSavedPercent}%)`);
}

// Run the minification
main().catch(error => {
  console.error('HTML minification failed:', error);
  process.exit(1);
});