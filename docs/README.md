# ViewTube Documentation

This directory contains ViewTube architecture, implementation plans, migration records, product references, verification evidence, and historical artifacts.

**Start here before trusting a document title.** The repository currently contains several generations of plans and references. Wave 1 of the documentation consolidation adds an authority map without moving or deleting the existing 119-file baseline.

## Documentation control

- [Documentation Registry](./DOCUMENTATION_REGISTRY.md) — complete classification of the 119 pre-wave files, including lifecycle and proposed disposition.
- [Documentation Governance](./DOCUMENTATION_GOVERNANCE.md) — rules for authority, supersession, placement, consolidation, and deletion safety.

## Current explicit authorities

| Concern | Current authority |
| --- | --- |
| Project / ContentBuild workflow | [Projects / ContentBuild Workflow Master Resource](./architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md) |
| Asset Engine | [Asset Engine Master Resource](./architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md) |
| Studio component library / primitive corrections | [Studio Hub Component Library Source of Truth](./ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md) |
| Analytics/auth migration program | [Migration README](./migration/README.md) |
| Unified AI consolidation contract | [Unified AI System Canonical Consolidation Contract](./brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md) |

These are scoped authorities. They do not make every neighboring plan or reference obsolete automatically.

## How to use this directory

When beginning work:

1. Open the [registry](./DOCUMENTATION_REGISTRY.md).
2. Find the owning domain and lifecycle for the relevant document.
3. Prefer a `canonical` document over a historical plan.
4. For `review` items, verify the claim against current code/tests before relying on it.
5. Update the existing authority instead of creating another "master" document unless a genuinely separate scope exists.

## Current consolidation status

**Wave 1:** merged — registry + governance + entrypoint.

**Wave 2:** Projects / ContentBuild / Asset Engine authority consolidated. The two living masters now absorb current-state identity, persistence, generation, publishing and frontend-manifestation requirements; older implementation/backbone/convergence documents remain in place as clearly labeled history/reference.

No baseline document has been deleted. Future waves continue one domain at a time, preserving unique information and references before archival or retirement.

### Planned waves

1. Registry / governance / entrypoint — **complete**
2. Projects / ContentBuild / Asset Engine — **complete in Wave 2**
3. Studio UI / Toolbox / widgets / mobile — **next**
4. Analytics / Data Visuals / migrations
5. Brain / AI / Herald
6. Auth / Editor / deployment / user guide
7. Archive/evidence re-homing + root cleanup
8. Automated governance + broken-link certification

## Important rule

A filename containing **MASTER**, **CANONICAL**, **SOURCE OF TRUTH**, or **AUTHORITY** is not enough to establish current truth. Use the registry, the declared scope, and current repository evidence.


## Projects / ContentBuild / Asset Engine document family

Current authority is intentionally split by scope:

- [Projects / ContentBuild Workflow Master](./architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md) — creator-facing Project workflow, shared identity, system ownership and cross-system continuity.
- [Asset Engine Master Resource](./architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md) — assets, versions/options, generation context/receipts, selections/finalization, publishing/launch projections, provenance and evaluation linkage.

Preserved donors (historical/reference, not current authority):

- `architecture/ASSET_ENGINE_CONTENTBUILD_IMPLEMENTATION_PLAN_2026-09-20.md`
- `architecture/PROJECT_CONTENTBUILD_ASSET_ENGINE_VIDEO_PACKAGE_CONSOLIDATION_2026-09-22.md`
- `brain/ASSET_ENGINE_CANONICAL_BACKBONE.md`
- `architecture/VIDEO_ASSET_ENGINE_WIDGET_IDEAS_2026-09-20.md`
