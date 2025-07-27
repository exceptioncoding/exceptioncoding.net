#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Get all image files from a directory recursively
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - Image extensions to include
 * @returns {string[]} Array of image file paths
 */
function getImageFiles(dir, extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  if (fs.existsSync(dir)) {
    traverse(dir);
  }
  
  return files;
}

/**
 * Optimize an image file
 * @param {string} inputPath - Path to source image
 * @param {string} outputPath - Path to optimized image
 * @returns {Promise<{originalSize: number, optimizedSize: number}>}
 */
async function optimizeImage(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const originalSize = fs.statSync(inputPath).size;
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    let sharpInstance = sharp(inputPath);
    
    switch (ext) {
      case '.png':
        sharpInstance = sharpInstance.png({ 
          quality: 90,
          compressionLevel: 9,
          progressive: true
        });
        break;
      case '.jpg':
      case '.jpeg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: 85,
          progressive: true
        });
        break;
      case '.gif':
        // For GIFs, just copy them as Sharp doesn't handle animated GIFs well
        fs.copyFileSync(inputPath, outputPath);
        return { originalSize, optimizedSize: originalSize };
      case '.svg':
        // For SVGs, just copy them as they're already optimized
        fs.copyFileSync(inputPath, outputPath);
        return { originalSize, optimizedSize: originalSize };
      default:
        // For other formats, just copy
        fs.copyFileSync(inputPath, outputPath);
        return { originalSize, optimizedSize: originalSize };
    }
    
    await sharpInstance.toFile(outputPath);
    const optimizedSize = fs.statSync(outputPath).size;
    
    return { originalSize, optimizedSize };
  } catch (error) {
    console.warn(`Warning: Could not optimize ${inputPath}, copying instead:`, error.message);
    fs.copyFileSync(inputPath, outputPath);
    return { originalSize, optimizedSize: originalSize };
  }
}

/**
 * Main optimization function
 */
async function main() {
  const srcDir = 'src/images';
  const distDir = 'dist/images';
  
  if (!fs.existsSync(srcDir)) {
    console.log('No src/images directory found, skipping image optimization');
    return;
  }
  
  const imageFiles = getImageFiles(srcDir);
  
  if (imageFiles.length === 0) {
    console.log('No images found to optimize');
    return;
  }
  
  console.log(`Optimizing ${imageFiles.length} images...`);
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let optimizedCount = 0;
  
  for (const inputPath of imageFiles) {
    const relativePath = path.relative(srcDir, inputPath);
    const outputPath = path.join(distDir, relativePath);
    
    try {
      const { originalSize, optimizedSize } = await optimizeImage(inputPath, outputPath);
      
      totalOriginalSize += originalSize;
      totalOptimizedSize += optimizedSize;
      optimizedCount++;
      
      const savedBytes = originalSize - optimizedSize;
      const savedPercent = originalSize > 0 ? ((savedBytes / originalSize) * 100).toFixed(1) : 0;
      
      if (savedBytes > 0) {
        console.log(`✓ ${relativePath} - saved ${savedBytes} bytes (${savedPercent}%)`);
      } else {
        console.log(`✓ ${relativePath} - copied`);
      }
    } catch (error) {
      console.error(`✗ Failed to process ${relativePath}:`, error.message);
    }
  }
  
  const totalSaved = totalOriginalSize - totalOptimizedSize;
  const totalSavedPercent = totalOriginalSize > 0 ? ((totalSaved / totalOriginalSize) * 100).toFixed(1) : 0;
  
  console.log(`\nOptimization complete:`);
  console.log(`- Processed: ${optimizedCount} images`);
  console.log(`- Original size: ${(totalOriginalSize / 1024).toFixed(1)} KB`);
  console.log(`- Optimized size: ${(totalOptimizedSize / 1024).toFixed(1)} KB`);
  console.log(`- Total saved: ${(totalSaved / 1024).toFixed(1)} KB (${totalSavedPercent}%)`);
}

// Run the optimization
main().catch(error => {
  console.error('Image optimization failed:', error);
  process.exit(1);
});