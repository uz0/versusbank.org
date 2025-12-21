---
id: 2025-12-21-audit_report-hybrid-ssg-game-injection.md
type: audit_report
target: hybrid-ssg-game-injection
verdict: pass
assurance_level: L2
carrier_ref: auditor
valid_until: 
date: 2025-12-21
---

Weakest Link: External documentation research (CL2) with complex integration points. R_raw: 3/4. Congruence Penalty: 0.5 (post-build transforms not directly tested). R_eff: 2.5/4. Bias Check: Low bias - evidence from official 11ty documentation. Primary risks: Build pipeline complexity may be underestimated; post-build injection adds failure points; Phaser.js integration complexity not evidenced; total build time may be significant.