# ViewTube User Guide V2 — Master Resource

**Status:** CANONICAL LIVING USER-GUIDE AUTHORITY  
**Created:** 2026-09-24  
**Last audited main:** `2efe0f56eb52c1029c71543291cf65e2b1a2245f`  
**Canonical owner / concern:** Guide V2 information architecture, derived product/dataset/tool/widget registries, lifecycle/status semantics, help/article registry rules, and governance coverage.  
**Executable authority:** `src/content/guide-v2/**`, `src/views/UserGuide.tsx`, guide components and `guideRegistry.test.ts`.

## 1. Core rule

The User Guide is a projection over canonical product registries, not a second product inventory.

Where a canonical registry exists, the guide links/derives from IDs instead of copying the inventory by hand.

## 2. Canonical sources

| Guide concern | Source |
| --- | --- |
| Application routes / route lifecycle | `PAGE_REGISTRY` |
| Guide feature semantics | `GUIDE_FEATURES` |
| Analytics datasets | derived from `VT_SYNC_VISIBLE_TABLE_DEFINITIONS` |
| Super Tools | derived from `SUPER_TOOLS` |
| Dashboard widgets | guide widget registry projected from current widget metadata |
| Metrics / relationships | Guide V2 metric registries |
| Analytics visuals / encodings | Guide V2 analytics visual registries |
| Guide pages/articles/context help | Guide V2 page/article/help registries |

## 3. Current implementation

Current main contains a real Guide V2 registry system, not only the original audit:

- curated feature registry with lifecycle/status;
- derived dataset registry;
- derived Super Tool registry;
- guide page/article/context-help registries;
- widget registry and teaching metadata;
- metric and metric-relationship registries;
- Analytics visual + visual-encoding registries;
- `UserGuide.tsx` and guide explorer/article components;
- governance tests checking registry uniqueness/coverage.

The Phase 1/2 audit remains useful history but no longer represents the implementation ceiling.

## 4. Lifecycle vocabulary

Guide-facing entities must communicate lifecycle/status so experimental, lab, legacy and planned surfaces are not presented as production beginner paths.

Route lifecycle comes from `PAGE_REGISTRY`. Guide feature lifecycle remains explicit where semantic grouping requires it.

Screenshots and prose do not override registry lifecycle.

## 5. Route coverage

Production/user-facing routes should have a guide mapping unless explicitly excluded by governance policy.

Lab/reference/bench/internal routes may be documented for advanced/reference use without becoming first-class beginner navigation.

Redirect-only aliases should not receive duplicate beginner documentation.

## 6. Dataset encyclopedia

The dataset encyclopedia must derive from `VT_SYNC_VISIBLE_TABLE_DEFINITIONS`.

Do not manually copy dataset names, columns or sync ownership into a competing static list. The guide may add teaching text keyed by canonical dataset ID.

## 7. Tool encyclopedia

Guide Super Tool entries derive from `SUPER_TOOLS`.

The guide may add explanation, examples and workflows but must preserve the tool's canonical ID/status/visibility/source ownership.

## 8. Widgets and visuals

Widget and Analytics visual guide entries should stay keyed to production registries/contracts. Documentation may explain what a visual means but must not invent a second widget/visual identity system.

## 9. Auth / Editor / Analytics references

Guide content should point to current living authorities when technical depth is needed:

- Auth: `docs/architecture/SIMPLE_AUTH_V1.md`
- Editor: `docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md`
- Analytics: `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`
- Brain: `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`

Implementation/migration details belong in technical-depth links, not duplicated beginner prose.

## 10. Governance

Guide governance should detect:

- duplicate registry IDs;
- route mappings that drift from `PAGE_REGISTRY`;
- canonical dataset/tool projection drift;
- production routes missing required guide coverage;
- broken related IDs/relationships.

When the product registry changes, update the guide projection/teaching content in the same change where practical.

## 11. Historical source

`PHASE_1_2_AUDIT_AND_TRUTH_REGISTRY.md` is the discovery/audit that established these rules. It is now historical design evidence, not the living authority.

## 12. Acceptance criteria

The Guide V2 is healthy when:

- beginner navigation reflects production lifecycle;
- canonical IDs are reused instead of copied inventories;
- datasets/tools/widgets/visuals are derived or governed against product sources;
- experimental/legacy/lab content is clearly labeled;
- technical depth links to owning master docs;
- governance tests detect product/guide drift.
