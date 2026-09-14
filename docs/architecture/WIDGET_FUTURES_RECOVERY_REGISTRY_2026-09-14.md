# ViewTube Widget Futures & Recovery Registry

Status: ACTIVE DISCOVERY — NOT A PRODUCTION REGISTRY
Date: 2026-09-14
Companion: `WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md`

## Purpose

`WidgetRegistry.ts` describes the current production-facing widget inventory. This file answers the separate question: which useful ViewTube widget concepts do not exist on current main?

Repository planning explicitly calls for selecting production winners from the Top-40 / 190-widget atlases, and identifies a 190-widget mobile-safe gallery with consolidation groups. Therefore the 59 registered widgets are not the complete design/concept universe.

## Status vocabulary

PLANNED — specified but not implemented on current main.
DESIGNED — visual/interaction design exists without a production widget.
PROTOTYPE — runnable experiment exists outside the production registry/path.
PARTIAL — implementation exists but the intended widget is incomplete.
LEGACY — historical implementation is absent from the canonical path.
ORPHANED — widget-like source exists but is not owned by the current registry/renderer.
SUPERSEDED — another canonical implementation now owns the intent.
MERGE_CANDIDATE — should likely become a mode/section of an existing widget.
BUILD_CANDIDATE — distinct user job worth evaluating as a new widget.
SYSTEM_COMPONENT — useful functionality that belongs inside another surface.
ARCHIVE — preserve as reference only.

## Production existence test

A concept counts as an existing production widget only when it has a registered ID, a current renderer, and a user-reachable production path. Standalone HTML, historical branches, PRs, component files, screenshots and atlas entries are evidence of concepts, not proof of production existence.

## Sources to reconcile

- Current main dashboard/widgets, analytics visuals, Studio Hub, Projects, Vault, Brain and editor source.
- WidgetRegistry and WidgetRenderer negative comparison.
- Unreferenced widget files.
- Top-40 source-faithful production atlas.
- 190-widget mobile-safe gallery and consolidation atlas.
- Standalone HTML prototype inventory.
- Widget/component governance libraries and Super Tool catalogs.
- Open/closed PRs and recovery/archive/feature branches.
- Architecture plans and unfinished-work resources.

## Initial missing/non-production families

| Candidate | State | Initial disposition |
| --- | --- | --- |
| Top-40 source-faithful widget set | DESIGNED / RECOVERY SET | Audit individually; port only winners |
| 190-widget mobile-safe atlas | DESIGNED / RECOVERY SET | Deduplicate against current registry and archetypes |
| Micro-visual families | DESIGNED | SYSTEM_COMPONENT / MERGE_CANDIDATE |
| Analytics Command Center modules | PARTIAL / PLANNED | Split true widgets from embedded modules |
| Deep-video analytics family | PARTIAL / PLANNED | Build/merge after canonical datasets |
| Geography country/state/city/DMA surfaces | PARTIAL / PLANNED | Consolidate by creator job |
| Technology device/OS surfaces | PARTIAL / PLANNED | Analytics widget family candidate |
| Evidence/provenance/confidence UI | PLANNED | Shared intelligence SYSTEM_COMPONENT |
| Anomaly Radar | PLANNED | BUILD_CANDIDATE after anomaly foundation |
| Next Best Action | PLANNED | Brain composite or BUILD_CANDIDATE |
| Project/Kanban compact manifestations | PARTIAL | Evaluate dashboard companions only |
| Project calendar/schedule manifestation | PARTIAL | MERGE_CANDIDATE |
| Creator Canvas pipeline manifestations | PARTIAL / PLANNED | Workflow surface first; selective compact widgets |
| Audience Loop | PARTIAL / PLANNED | BUILD_CANDIDATE if distinct from community widgets |
| Recommend Video | PARTIAL / PLANNED | Prefer Comment Responder integration |
| Vault 16:9/9:16/1:1/audio/document asset modules | DESIGNED / PARTIAL | SYSTEM_COMPONENT first |
| Resource Library manifestation | PARTIAL / PLANNED | Page/toolbox first |
| Editor project/status manifestation | PLANNED | Compact handoff candidate |
| Publisher queue/preflight manifestation | PLANNED | BUILD_CANDIDATE after Publisher canonicalization |
| Diagnostics widget | PARTIAL / PLANNED | System BUILD_CANDIDATE |
| Command Module | PROTOTYPE | Evaluate Asset Engine manifestation |
| Adaptive Presence Package | PROTOTYPE | SYSTEM_COMPONENT candidate |
| Vault-Module Manifestation | PROTOTYPE | MERGE_CANDIDATE with Vault |
| Micro Package Strip | PROTOTYPE | SYSTEM_COMPONENT |
| Tool Launcher Package | PROTOTYPE | MERGE_CANDIDATE with Quick Actions |
| ReachFunnelWidget draft | ORPHANED / SUPERSEDED | Quarantine; recover unique behavior only |
| AdStackWidget draft | ORPHANED / SUPERSEDED | Quarantine; recover unique behavior only |
| ThumbAIWidget draft | ORPHANED / SUPERSEDED | Quarantine; recover unique behavior only |

## 190-atlas reconciliation schema

Every atlas concept must receive one primary disposition:

`EXISTING_59 | VARIANT_OF_EXISTING | EMBEDDED_VISUAL | PRIMITIVE | ARCHETYPE | BUILD_NEW | MERGE_INTO_EXISTING | LEGACY_RECOVERY | SUPERSEDED | ARCHIVE`

Matrix columns:

`Concept ID | Name | Source | Group | Registry Match | Renderer Match | Main Code Match | Historical Branch/PR | User Job | Data | Interactions | Existing Overlap | Archetype | Default W | Default H | Mobile Composition | Value | Effort | Risk | Disposition | Target Owner | Notes`

## Anti-bloat rule

The target is not 190 production widgets. A new widget ID requires a distinct creator job, durable data/action contract, useful dashboard-scale composition, independent placement/resizing value, useful mobile composition, and no existing canonical owner. Otherwise it becomes a primitive, embedded visual, archetype, mode, subview, toolbox component or archive reference.

## Immediate sequence

- [x] Establish a separate futures/recovery registry.
- [x] Confirm Top-40 and 190-widget recovery sources are named by repository planning.
- [x] Seed known orphaned, planned and prototype families.
- [ ] Locate/recover the actual Top-40 atlas.
- [ ] Locate/recover the actual 190-widget atlas.
- [ ] Locate/recover the standalone prototype inventory.
- [ ] Extract every concept name/ID.
- [ ] Normalize aliases and duplicates.
- [ ] Compare every concept against all current registry IDs and renderers.
- [ ] Search historical branches and PRs for absent implementations.
- [ ] Score BUILD_CANDIDATE entries.
- [ ] Produce EXISTING / MISSING / MERGE / COMPONENT / ARCHIVE totals.
- [ ] Add the approved future-widget backlog to the master certification resource.

## Conclusion

The current registry is only the production-facing subset. The full audit must preserve current IDs, recover high-value missing concepts, collapse variants into shared archetypes/components, and add new widget IDs only for genuinely distinct creator jobs.
