# ViewTube User Guide V2 — Phase 1 Discovery Audit

Audit date: 2026-08-27
Baseline: `main` at the Simple Auth V1 landing commit.
Purpose: freeze what the guide must document before the V2 UI is built.

## Sources inspected

- `src/app/pageRegistry.ts` and `src/app/AppRoutes.tsx` — current route/product surface.
- `src/content/userGuideContent.ts` — existing guide protocol v2.3, last updated 2026-07-28.
- `src/features/vt-sync-local/upstream/tableRegistry.ts` — canonical selectable analytics datasets.
- `src/services/superToolRegistry.ts` — planned/integrating creator super-tools.
- `docs/migration/README.md` — analytics-canon/auth-canon migration truth.
- `docs/architecture/SIMPLE_AUTH_V1.md` and current auth landing commit — new server-owned auth.
- Current editor offshoots compared against main, especially `feat/vt-e1-unification-2026-08-27`.
- Brain production-chain branch compared against main.

## Findings

### Existing guide is structurally obsolete

The current guide is a manually maintained array of sections/tools. Its protocol says v2.3 and its last-updated date is 2026-07-28. It predates the current VT-SYNC/analytics-canon migration state, the new Simple Auth V1 island, the latest editor unification work, and recent Brain workflow work. It also duplicates route/tool truth instead of deriving it.

V2 should replace, not extend, this content model.

### Current product lifecycle

**LIVE / production guide targets**
Dashboard; Studio Hub; Projects; AI Brain; Analytics/VT-SYNC; Intelligence Hub; Graphs; Editor; Vault; Video Manager; Media Analyzer; SEO Generator; Video Publisher; Hook Generator; Thumbnail Studio; Storyboard Studio; Settings/Account; Data & Privacy.

**BETA / transitional**
Simple Auth V1 is the intended new connection truth, but the legacy account runtime is deliberately still mounted during cutover. Documentation must describe the user-visible simple flow and avoid teaching legacy token/cache internals as normal behavior.

**EXPERIMENTAL / lab**
Reference Studio, component/chart galleries, benches, internal analytics, audit surfaces and other routes classified `lab`/hidden in the page registry.

**LEGACY / retirement path**
Performance Hub is still a production-visible route but architecturally a migration source/compatibility surface. Channelytics, Dashboard Legacy, old data visualizations, Simple Analytics, Editor V1 aliases/dev aliases, and other redirect-only routes should not receive first-class beginner documentation.

**PLANNED / integrating**
The super-tool registry includes Creator Canvas OS, Audience Loop Studio, Packaging Lab Pro, Project Command Kanban, Creator Vault OS and Cinematic Analytics Lab as public integrating concepts, plus several planned editor/project tools. These belong in the registry with status labels, not in beginner navigation until they are real user-facing destinations.

## Analytics audit

VT-SYNC's visible table registry is already the correct canonical source for the Guide's dataset encyclopedia. The guide must derive dataset entries from `VT_SYNC_VISIBLE_TABLE_DEFINITIONS`, not copy table names into documentation.

The migration document confirms VT-SYNC/analytics-canon is the north-star analytics read path. Performance Hub still contains legacy capabilities that are being extracted. Important guide-visible gaps/transition notes include time-window controls, metric availability/coverage diagnostics and CSV ingestion UX.

Intelligence Hub is now canonically owned by Analytics and consumes a 34-dataset evidence boundary. The old Performance Hub mount is compatibility-only.

## Auth audit

The newest auth architecture introduces:
- server-owned Google OAuth;
- HttpOnly `vt_session` browser session;
- `/api/auth/session` as browser-visible auth truth;
- typed server YouTube endpoints;
- no requirement for browser Google tokens/localStorage auth in the new island.

The old auth system remains during validation. The V2 guide should document one simple connection workflow and put implementation/migration detail behind Technical depth.

## Editor audit

Main exposes `/editor` as production and redirects older editor routes to it.

The active `feat/vt-e1-unification-2026-08-27` branch is substantially ahead of main and contains material guide-relevant work: mobile editor architecture, timeline strip, preview pane, transport bar, tool dock, gesture handling, transition presentations, shared editor-store contracts, caption helpers and renderer/animation work.

Therefore Editor documentation must be registry-driven and explicitly capable of representing branch features as beta/experimental until merged. Do not freeze the current minimal Editor V1 guide copy as product truth.

## Brain audit

The phase-five Brain branch contains major workflow/handoff, evidence, learning-ledger, user-control and live-tool integration work not all present on main. The V2 truth model needs status/provenance so these can be registered without falsely presenting them as shipped.

## Phase 1 decisions

1. `PAGE_REGISTRY` remains canonical for application routes/lifecycle.
2. `VT_SYNC_VISIBLE_TABLE_DEFINITIONS` remains canonical for user-selectable analytics datasets.
3. `SUPER_TOOLS` remains canonical for super-tool concepts/status.
4. Guide V2 adds a thin documentation registry layer for feature semantics, metric definitions and guide-page organization.
5. Guide content must link to canonical IDs instead of duplicating product inventories.
6. Every guide entity carries lifecycle/status so live, beta, experimental, planned and legacy cannot be confused.
7. Existing `userGuideContent.ts` stays untouched until the V2 renderer exists; it is legacy content, not the new source of truth.
8. Screenshots are not truth. Prefer live components, controlled demos or diagrams.
9. Beginner documentation describes user workflows; implementation/migration details live in Technical depth.
10. A later governance test should fail when a production route lacks a Guide feature/page mapping.

## Phase 2 implementation

Created `src/content/guide-v2/` with:
- `featureRegistry.ts`
- `datasetRegistry.ts`
- `metricRegistry.ts`
- `toolRegistry.ts`
- `guidePageRegistry.ts`
- `index.ts`

The dataset and tool registries derive from existing canonical product registries rather than cloning them. Feature/metric/page registries add documentation-specific semantics.

## Next gate

Phase 3 can now build the Guide shell/search/navigation against these registries without depending on the legacy guide content array.
