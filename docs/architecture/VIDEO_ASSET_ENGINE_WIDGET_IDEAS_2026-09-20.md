# Video Asset Engine Dashboard Widget — 25 Consolidated Ideas

Date: 2026-09-20
Status: REFERENCE / IDEA CATALOG — not a current architecture authority
Current authority: docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md
Wave 2 consolidation note (2026-09-24): durable dashboard requirements from this catalog were folded into the Asset Engine master. Keep the 25 ideas as a product/reference backlog; they do not define a separate Asset Engine or data owner.

These ideas consolidate the strongest Asset Engine, Vault, packaging, publishing, provenance, handoff, generation and video-package concepts into one dashboard-scale creator instrument. The dashboard widget is a compact manifestation; the full Asset Engine remains the expanded workflow owner.

1. **Package Composer** — central 16:9 package surface showing the currently selected video/package and its most important visual asset.
2. **Publish Readiness Spine** — one progress instrument that scores which required package parts exist, are approved, or are missing.
3. **Canonical Asset Slot Matrix** — thumbnail, title, description, tags/SEO, script, community, routing, and production slots tied to real Vault assets.
4. **Missing Asset Launcher** — click a missing slot to open the relevant generation/tool workflow instead of merely reporting the gap.
5. **Variant Tray** — expose title, thumbnail, hook, or metadata variants and identify the selected/final candidate.
6. **Asset Provenance Inspector** — show source tool, project, generation record, evidence IDs, and creator edits for the active asset.
7. **Lineage Track** — visualize parent → child asset ancestry so derivative work never loses source identity.
8. **Cross-Tool Handoff Dock** — contextual destinations such as Studio, Editor, Publisher, Projects, Community, or Vault.
9. **Recent Asset Rail** — compact list of the newest durable creator assets with kind, project and recency.
10. **Project/Video Scope Switcher** — move the widget between current project, current video, or recent unscoped assets.
11. **Package Mode / Assets Mode / Handoff Mode** — keep the default widget understandable while exposing deeper capability without making it permanently huge.
12. **Launch Package Monitor** — show pre-publish, launch, early-post-launch and sustain assets beside the publishing package.
13. **Community Activation Strip** — pinned comment, launch post, teaser Short and follow-up post readiness.
14. **Routing Package** — end screen, cards, related video, playlist and destination asset status in one navigation-oriented section.
15. **SEO / Entity Intelligence Badge** — indicate whether approved SEO/entity intelligence has been attached to the publishing package.
16. **Evidence Confidence Markers** — distinguish manual, generated, evidence-backed and unverified assets without inventing confidence.
17. **Experiment Link** — show whether the selected title/thumbnail belongs to an active A/B or multivariate experiment.
18. **Used Variant Receipt** — preserve which generated candidate became the actual published asset.
19. **Post-Publish Evaluation Contract** — display which metrics/windows are scheduled to evaluate the package after publication.
20. **Asset Health Warnings** — flag missing URLs, invalid previews, orphaned parents, unresolved project ownership or stale generation records.
21. **Bulk Generate Missing** — generate only absent package elements while leaving approved creator work untouched.
22. **Package Duplicate / Fork** — branch a package for a sequel, localization, alternate format or experiment while preserving lineage.
23. **Format Adaptation** — expose Long / Short / Live package requirements without creating separate widget IDs.
24. **Localization Layer** — language, captions/subtitles and translated packaging readiness tied back to the same package identity.
25. **Outcome Loop** — after publication, connect evaluated results back to the exact assets so successful package choices become reusable evidence.

## First dashboard implementation

The initial production widget implements the highest-leverage subset without creating a parallel store:

- Package Composer
- Publish Readiness Spine
- Canonical Asset Slot Matrix
- Recent Asset Rail
- Provenance/lineage inspection
- Package / Assets / Handoff modes
- contextual Studio / Editor / Vault handoffs
- responsive package composition using current widget primitives and tokens

Data comes from the canonical Asset Engine/Vault service. The widget does not duplicate Asset Engine persistence.
