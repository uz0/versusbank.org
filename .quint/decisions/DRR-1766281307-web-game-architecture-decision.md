# Web Game Architecture Decision

## Context
Need optimal frontend organization for web game with Stardew Valley-like aesthetics. Requirements: single-page with fullscreen canvas game (first 2 viewport heights), README.md content below, 16-bit retro styling, mobile-first touch interactions, deployment to /docs folder for GitHub Pages, PWA capabilities, no Jekyll required.

## Decision
**Selected Option:** vanilla-js-static-game-page

We decided to use the Vanilla JS Static Game Page architecture with Canvas 2D API, Rollup bundler, and build-time markdown processing. This approach maximizes reliability while meeting all requirements for GitHub Pages deployment.

## Rationale
Winner selected based on highest Effective Reliability (R_eff: 4.0/4) with internal functional prototype validation. Direct testing proved Canvas 2D + pixel-perfect rendering + responsive scrolling works in target deployment context. Minimal dependencies ensure <50KB bundle size and maximum browser compatibility. Build complexity is lowest among options, reducing implementation risk. Evidence: Working prototype with full viewport coverage, touch input handling, and markdown content integration.

### Characteristic Space (C.16)
Performance: A+ (minimal overhead, direct canvas access); Bundle Size: A+ (<50KB); Browser Compatibility: A+ (vanilla JS); Development Speed: B (manual implementation); Build Complexity: A (simple Rollup config); Deployment Risk: A+ (proven static approach); Maintenance: A (minimal dependencies).

## Consequences
Implementation will use pure JavaScript with Canvas 2D API, Rollup + terser for bundling, marked.js for README.md processing, and service worker for PWA features. Deploy to /docs folder with .nojekyll file. Trade-offs: Manual game engine development vs framework usage, but benefits include optimal performance, zero framework overhead, and maximum deployment flexibility. Next steps: Create full game prototype, implement 16-bit styling system, set up build pipeline, and configure GitHub Actions deployment.
