---
scope: Performance-critical applications, global scale, requires modern hosting with edge capabilities, intermediate to advanced DevOps
kind: system
---

# Hypothesis: JAMstack with Edge Gaming

Next.js/Nuxt static site generator for content pages with MDX support. Game engine built with WebAssembly (WASM) using Rust/C# for performance. Edge functions (Vercel/Cloudflare Workers) handle game state and multiplayer. Progressive Web App capabilities with offline gameplay. Content managed through Headless CMS (Contentful/Sanity). Automatic static optimization for SEO, real-time features via WebSockets.

## Rationale
{"anomaly": "Need both static content performance and real-time game capabilities", "approach": "Static content + WASM game engine + edge computing", "alternatives_rejected": ["Server-side rendering (too slow for game)", "Client-side only (poor SEO for content)"]}