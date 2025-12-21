#!/usr/bin/env node

/**
 * Development server for VersusBank web game
 * Serves static files from docs/ directory
 */

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DOCS_DIR = join(__dirname, '..', 'docs');
const PORT = process.env.PORT || 3000;

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = createServer((req, res) => {
  try {
    const resolvedDOCS_DIR = resolve(DOCS_DIR);
    const safeUrl = req.url === '/' ? 'index.html' : (req.url || '').startsWith('/') ? req.url.substring(1) : req.url;
    let filePath = resolve(DOCS_DIR, safeUrl);

    // Security: prevent directory traversal
    if (!filePath.startsWith(resolvedDOCS_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // Handle missing files (try adding .html)
    if (!existsSync(filePath) && !extname(filePath)) {
      filePath += '.html';
    }

    // Try to find the file
    if (!existsSync(filePath)) {
      // For SPA routing, serve index.html for non-existent routes
      if (req.url.startsWith('/assets/') || req.url.includes('.')) {
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      filePath = join(DOCS_DIR, 'index.html');
    }

    const ext = extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'text/plain';
    const content = readFileSync(filePath);

    // Set headers
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    res.end(content);
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 VersusBank development server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${DOCS_DIR}`);
  console.log(`⏹️  Press Ctrl+C to stop`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development server...');
  server.close(() => {
    process.exit(0);
  });
});