---
scope: Static site generator experience, separation of content and game logic, moderate build complexity, SEO-friendly
kind: system
---

# Hypothesis: Hybrid SSG Game Injection

11ty static site generator builds markdown page from README.md. Custom game built as standalone ES6 module with Rollup. Build process: 1) Generate static HTML page with markdown content 2) Inject game canvas and scripts via post-build script 3) Copy game assets to /docs. Game uses Phaser.js for 16-bit rendering, positioned absolutely for first 200vh. CSS Grid for layout, CSS filters for retro effects. Service worker generated via workbox for PWA. GitHub Actions automates deployment. Touch controls via Phaser Touch API, saves to localStorage.

## Rationale
{"anomaly": "Need both static markdown and interactive game in single deployment", "approach": "Build-time integration of static site with game module", "alternatives_rejected": ["Pure canvas (hard content management)", "Full SPA (poor static optimization)"]}