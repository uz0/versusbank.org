#!/usr/bin/env node

/**
 * Create simple placeholder icons for VersusBank
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ICONS_DIR = path.join(__dirname, 'icons');

// Simple SVG icon template
const svgTemplate = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0f0f1e"/>
  <text x="256" y="180" text-anchor="middle" font-family="monospace" font-size="72" font-weight="bold" fill="#00ff41">
    VERSUS
  </text>
  <text x="256" y="280" text-anchor="middle" font-family="monospace" font-size="72" font-weight="bold" fill="#00ff41">
    BANK
  </text>
  <rect x="100" y="320" width="312" height="8" fill="#00ff41"/>
  <rect x="180" y="340" width="152" height="8" fill="#00ff41"/>
  <rect x="220" y="360" width="72" height="8" fill="#00ff41"/>
</svg>`;

// Write the SVG file
const svgPath = path.join(ICONS_DIR, 'icon.svg');
fs.writeFileSync(svgPath, svgTemplate);

console.log('✅ SVG icon created:', svgPath);
console.log('💡 Tip: Use an online converter to create PNG files from this SVG');
console.log('🔗 Recommended: https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png');
console.log('');
console.log('Required PNG sizes:');
console.log('- icon-16.png (16x16)');
console.log('- icon-32.png (32x32)');
console.log('- icon-144.png (144x144)');
console.log('- icon-192.png (192x192)');
console.log('- icon-512.png (512x512)');