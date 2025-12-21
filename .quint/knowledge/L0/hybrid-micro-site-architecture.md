---
scope: Teams wanting separation of concerns, content-heavy sites, complex game mechanics, enterprise-level requirements
kind: system
---

# Hypothesis: Hybrid Micro-Site Architecture

Two separate applications: docs.versusbank.org (static Docusaurus/Gatsby site), game.versusbank.org (dedicated game app). Shared design system via Storybook component library. Game uses React + PixiJS/Three.js with physics engine. Authentication and data sync via Firebase/Supabase. Independent CI/CD pipelines per application. Cross-domain communication via postMessage API.

## Rationale
{"anomaly": "Content and game have different performance and deployment requirements", "approach": "Separate deployment units with shared design system", "alternatives_rejected": ["Monolith (coupled deployments)", "Single page (poor content organization)"]}