#!/usr/bin/env node
/**
 * Generate iOS PWA Splash Screens
 *
 * This script generates splash screen images for all iOS device sizes
 * from the existing splash-icon.png file.
 *
 * Usage: node generate-splash-screens.js
 */

const fs = require('fs');
const path = require('path');

// Splash screen sizes for different iOS devices
const SPLASH_SIZES = [
  { name: 'splash-1125x2436.png', width: 1125, height: 2436, device: 'iPhone X, XS, 11 Pro, 12/13 Mini' },
  { name: 'splash-828x1792.png', width: 828, height: 1792, device: 'iPhone XR, 11, 12, 12 Pro, 13, 13 Pro, 14' },
  { name: 'splash-1242x2688.png', width: 1242, height: 2688, device: 'iPhone XS Max, 11/12/13 Pro Max, 14 Plus' },
  { name: 'splash-1179x2556.png', width: 1179, height: 2556, device: 'iPhone 14 Pro' },
  { name: 'splash-1290x2796.png', width: 1290, height: 2796, device: 'iPhone 14 Pro Max' },
  { name: 'splash-750x1334.png', width: 750, height: 1334, device: 'iPhone 8, 7, 6s, 6' },
  { name: 'splash-1242x2208.png', width: 1242, height: 2208, device: 'iPhone 8/7/6s/6 Plus' },
  { name: 'splash-640x1136.png', width: 640, height: 1136, device: 'iPhone SE, 5s, 5c, 5' },
  { name: 'splash-1536x2048.png', width: 1536, height: 2048, device: 'iPad Mini, Air' },
  { name: 'splash-1668x2224.png', width: 1668, height: 2224, device: 'iPad Pro 10.5"' },
  { name: 'splash-1668x2388.png', width: 1668, height: 2388, device: 'iPad Pro 11"' },
  { name: 'splash-2048x2732.png', width: 2048, height: 2732, device: 'iPad Pro 12.9"' },
];

console.log('📱 iOS PWA Splash Screen Generator\n');
console.log('⚠️  Note: This script requires sharp npm package for image processing.');
console.log('    Install it with: npm install --save-dev sharp\n');

try {
  const sharp = require('sharp');

  const sourceImage = path.join(__dirname, 'assets', 'splash-icon.png');
  const publicDir = path.join(__dirname, 'public');

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Also copy favicon and icon
  const icon = path.join(__dirname, 'assets', 'icon.png');
  const favicon = path.join(__dirname, 'assets', 'favicon.png');

  if (fs.existsSync(icon)) {
    fs.copyFileSync(icon, path.join(publicDir, 'icon.png'));
    console.log('✓ Copied icon.png to public/');
  }

  if (fs.existsSync(favicon)) {
    fs.copyFileSync(favicon, path.join(publicDir, 'favicon.png'));
    console.log('✓ Copied favicon.png to public/');
  }

  console.log('\n🎨 Generating splash screens...\n');

  // Generate each splash screen
  SPLASH_SIZES.forEach(async (size) => {
    const outputPath = path.join(publicDir, size.name);

    try {
      await sharp(sourceImage)
        .resize(size.width, size.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${size.name} (${size.width}x${size.height}) for ${size.device}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${size.name}:`, error.message);
    }
  });

  console.log('\n✅ All splash screens generated successfully!');
  console.log('📁 Files saved to: public/\n');

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('❌ Error: sharp package not found.');
    console.log('\n📦 Install it with:');
    console.log('   npm install --save-dev sharp\n');
    console.log('💡 Or use an online tool:');
    console.log('   https://progressier.com/pwa-screenshots-generator');
    console.log('   https://appsco.pe/developer/splash-screens\n');
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}
