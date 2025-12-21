---
scope: Maximum performance requirements, offline-first design, experienced web developers, modern browser support only
kind: system
---

# Hypothesis: Web-Native PWA Game Platform

Custom game engine using WebGPU for rendering, WebAudio for sound, Web Workers for game logic. Content served as separate static site with game loaded as PWA. IndexedDB for offline save states. Service Worker for caching assets. Game communication via WebRTC for multiplayer. Build system using esbuild/swc for ultra-fast compilation. Deploy to any static host with CDN.

## Rationale
{"anomaly": "Stardew Valley-like performance in web browser requires an optimized engine", "approach": "Native web technologies without abstraction layers", "alternatives_rejected": ["Game frameworks (overhead)", "Unity/WebGL (large bundle size)"]}