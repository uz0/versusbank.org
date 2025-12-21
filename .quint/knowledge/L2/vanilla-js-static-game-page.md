---
scope: Maximum browser compatibility, minimal dependencies, smallest bundle size (<50KB), basic JavaScript knowledge required
kind: system
---

# Hypothesis: Vanilla JS Static Game Page

Pure JavaScript game using Canvas 2D API with requestAnimationFrame. Game occupies first 100vh with full-screen canvas, then transitions to 200vh fixed position. README.md parsed at build time using marked.js and injected as HTML below game. 16-bit styling through pixel-perfect CSS with CRT effects. Touch input handled via pointer events, mouse via click/move. Service worker caches game assets, offline play via IndexedDB saves. Build with Rollup + terser, output to /docs folder with index.html, game.js, styles.css, favicon.ico, manifest.json. GitHub Pages ignores Jekyll via .nojekyll file.

## Rationale
{"anomaly": "Need single-page game + markdown for GitHub Pages without build complexity", "approach": "Vanilla JS with build-time markdown processing", "alternatives_rejected": ["React SPA (too heavy for static hosting)", "SSG frameworks (overkill for single page)"]}