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
| Toolbox / Subtoolbox / Studio UI system | [Toolbox UI Master Resource](./architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md) |
| Studio component library / primitive corrections | [Studio Hub Component Library Source of Truth](./ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md) |
| Dashboard widget production metadata | [WidgetRegistry.ts](../src/views/dashboard/WidgetRegistry.ts) (code authority); [Widget Certification Master](./architecture/WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md) tracks certification |
| Analytics / VT-SYNC architecture + migration | [Analytics / VT-SYNC Master Resource](./analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md) |
| Analytics Data Visual canvas | [Data Visual Canvas Contract](./migration/data-visual-canvas-contract.md) (scoped canonical contract) |
| Analytics Data Visual mobile composition | [Mobile Visual Responsive Contract](./MOBILE_VISUAL_RESPONSIVE_CONTRACT.md) (scoped canonical contract) |
| Auth / browser session | [Simple Auth V1](./architecture/SIMPLE_AUTH_V1.md) |
| Editor system | [Editor System Master Resource](./editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md) |
| Deployment / release | [Deployment & Release Master Resource](./deployment/VIEWTUBE_DEPLOYMENT_RELEASE_MASTER_RESOURCE.md) |
| User Guide V2 | [User Guide V2 Master Resource](./user-guide-v2/VIEWTUBE_USER_GUIDE_V2_MASTER_RESOURCE.md) |
| AI systems management / agent orientation | [AI Systems Living Master Resource](./brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md) |
| AI / Brain runtime architecture | [Unified AI System Canonical Consolidation Contract](./brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md) |
| Prompt system | [Prompt System Authority](./brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md) |
| Herald repository-work governance | [HERALD-OUT](../agent/contracts/herald-out.md) + [workflow](../agent/contracts/herald-workflow.md) (implemented code/record authority) |

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

**Wave 3:** Toolbox/Studio UI authority is reconciled to production tokens/tests; stale desktop 56/44 migration documents are clearly historical, the Component Library index is derived from its 62-family production registry, and Dashboard/Analytics responsive systems remain explicitly scoped rather than being folded into Toolbox geometry.

**Wave 4:** Analytics/VT-SYNC now has one living architecture authority. The old migration README is historical, canvas/responsive contracts are scoped canonical authorities, and implementation plans remain active only where the audited code still has real gaps.

**Wave 5:** the unified AI contract is the Brain runtime architecture authority. The AI Systems Living Master Resource is the management/orientation authority for agents working across AI systems. Eight obsolete broad audits/phase documents were harvested and re-homed under `migration/reference/brain-ai-history/`; active AI planning now routes through the living master, Finish Program, Brain-quality tasks and Prompt System Authority. Herald remains separate from creator BrainRuntime.

**Wave 6:** Simple Auth V1 is the canonical browser-session contract; Editor documentation is reconciled to the live desktop/mobile bridge; deployment/release has a script-backed living master; Guide V2 has a living authority over its derived route/dataset/tool/widget/metric/visual registries.

Wave 7 archival has now begun for the AI domain: superseded AI audits/phase documents were preserved under `migration/reference/brain-ai-history/` and removed from active authority paths only after unique-rule harvest and inbound-reference review. Other domains remain subject to the same non-destructive rules.

### Planned waves

1. Registry / governance / entrypoint — **complete**
2. Projects / ContentBuild / Asset Engine — **complete in Wave 2**
3. Studio UI / Toolbox / widgets / mobile — **complete in Wave 3**
4. Analytics / Data Visuals / migrations — **complete in Wave 4**
5. Brain / AI / Herald — **complete in Wave 5**
6. Auth / Editor / deployment / user guide — **complete in Wave 6**
7. Archive/evidence re-homing + root cleanup — **next**
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


## UI authority boundaries

- **Toolbox/SubToolbox production system:** `architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`, verified against production tokens/CSS/tests.
- **Component Library catalog + primitive corrections:** `ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md`.
- **Dashboard widgets:** production identity/metadata comes from `src/views/dashboard/WidgetRegistry.ts`; certification and recovery plans are scoped Dashboard documents.
- **Analytics Data Visuals:** `MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` and VT-SYNC visual registries own chart/module responsive intent; they do not redefine Toolbox shell geometry.

Current shell geometry:
- desktop: Main 80 / SubToolbox 56 / L1 48 / L2 32;
- mobile shell: Main 56 / SubToolbox 44, preserving 26px / 20px title sizes.


## Analytics / VT-SYNC authority boundaries

- **Raw analytics truth:** VT-SYNC Local.
- **Visible dataset identity:** `VT_SYNC_VISIBLE_TABLE_DEFINITIONS`.
- **Normalized consumer API:** `services/analytics-canon`.
- **Window vocabulary/ranges:** `src/services/analytics/windows.ts`.
- **Living documentation authority:** `analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`.
- **Canvas geometry:** `migration/data-visual-canvas-contract.md`.
- **Phone/desktop visual composition:** `MOBILE_VISUAL_RESPONSIVE_CONTRACT.md`.
- **Active implementation programs:** dataset expansion, time-window migration, controller unification, mark-scale migration, and Master Data overlay portal.

The August `migration/README.md` remains valuable history but is no longer current-state authority.


## Brain / AI / Herald authority boundaries

- **AI systems management / agent orientation:** `brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`.
- **Creator-facing reasoning/orchestration:** `brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` plus current `src/services/brain/**`.
- **Canonical analytics evidence for Brain:** `services/analytics-canon`; Brain derives evidence quality but does not own analytics storage.
- **Outcome/evaluation/learning:** existing Brain/Algorithm outcome, evaluation and governed-learning owners; never create a second generic ledger.
- **Cross-tool handoffs:** `brain/UNIVERSAL_TOOL_HANDOFFS_AND_SUGGESTED_CHAINS.md` is a production-linked protocol reference, subordinate to domain owners.
- **Repository AI-work governance (Herald):** `agent/contracts/herald-in.md`, `herald-out.md`, `herald-workflow.md`, `.viewtube/herald/**`, and `.viewtube/exchange/**`.
- **Historical Herald design:** `VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md` explains the design evolution but is no longer current status authority.

BrainRuntime serves ViewTube creators. Herald governs AI agents working on the ViewTube repository. They exchange context/provenance where useful but are not one runtime.


## Editor living authority

The unified desktop/mobile editor program now has a single living integration authority:

- editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md
- editor/EDITOR_BRAIN_HUB_ASSISTANT_PLAN.md

Every editor-related agent/conversation must update the master resource Current Work and append-only Update Log before handoff. Specialized editor/Brain/Asset/Toolbox documents remain authoritative for their bounded concerns as declared by DOCUMENTATION_REGISTRY.md.


## Auth / Editor / Deployment / Guide boundaries

- **Auth:** `architecture/SIMPLE_AUTH_V1.md`; flat `/api/auth-*` routes are the browser contract, nested routes are compatibility aliases through the same server router.
- **YouTube API migration:** `architecture/YOUTUBE_API_STABILIZATION_V1_TRACKER.md` remains active until typed-route parity and legacy deletion finish.
- **Editor:** `editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md`; VT_E1 and mobile share the versioned project bridge, with remaining work focused on parity/certification rather than first bridge wiring.
- **Deployment/release:** `deployment/VIEWTUBE_DEPLOYMENT_RELEASE_MASTER_RESOURCE.md`; live production truth is the exact commit reported by `/api/release`, not repository state alone.
- **User Guide V2:** `user-guide-v2/VIEWTUBE_USER_GUIDE_V2_MASTER_RESOURCE.md`; product inventories derive from canonical registries instead of being copied into prose.


## AI historical archive

Superseded broad AI audits, phase manifests and phase-closeout records are preserved under `migration/reference/brain-ai-history/`. They are provenance only; current status comes from the AI Systems Living Master Resource, bounded canonical authorities, current code/tests, and the Finish Program.
