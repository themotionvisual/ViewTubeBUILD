# ViewTube Unfinished Work Master Resource

**Date:** September 11, 2026  
**Scope:** Planned, recovered, prototype, partially integrated, or not-yet-certified work consolidated from recent ViewTube conversations and supporting project resources.

## Governing principle

ViewTube is one creator operating system following:

**ANALYTICS → INSIGHT → CREATE → PRODUCE → PUBLISH → LEARN → ANALYTICS**

The goal is not to preserve every historical implementation. Preserve the best behavior and design, converge it onto canonical owners, quarantine useful history, and certify one production path.

## Executive priorities

- **Priority 0 — Stabilize before expanding:** auth/session, diagnostics, PR #77, VT-SYNC ownership, route/tool registries, release gates.
- **Priority 1 — Make analytics canonical:** datasets, windows, retention, traffic/geography, Deep Dive, CSV augmentation, tables and mobile loading.
- **Priority 2 — Productionize the visual system:** WidgetShell, controllers, recovered visuals, Shorts Retention, mega dashboard, component library and mobile certification.
- **Priority 3 — Wire intelligence to real application state:** Brain Phase One, evidence, adapters, controls, evaluation and approved actions.
- **Priority 4 — Finish the creator workflow loop:** Projects, Creator Canvas, Studio Hub, Comment Responder, Audience Loop, Vault, Editor and Publisher.
- **Priority 5 — Make the system understandable and shippable:** User Guide, Resource Library, demo/promo, observability/support and final end-to-end certification.

## Canonical ownership rules

| Concern | Canonical owner |
| --- | --- |
| Session / login / account | Current server-owned account/auth contract |
| Google / YouTube requests | Canonical YouTube transport/service layer |
| Raw analytics facts | VT-SYNC |
| Public analytics consumer boundary | analytics-canon |
| Video identity | Canonical video asset/catalog services |
| Durable channel intelligence | Channel Profile |
| AI orchestration | Brain |
| Tool capability metadata | Super Tool / Tool Capability registry |
| Sync unit definitions | VT-SYNC sync-unit registry |
| Data table definitions | VT-SYNC table registry |
| Visual/module definitions | Visual + widget registries |
| Projects/workflow state | One canonical Project model |
| Old Performance Hub implementations | Quarantine/reference only |
| User Guide feature truth | User Guide registries, not duplicated prose lists |

# 50 highest-priority unfinished tasks

## Foundation

### 1. Stabilize the canonical account / OAuth / YouTube connection path
**Priority:** Critical · **Status:** In progress  
Finish the simplified server-owned auth contract; remove remaining stale callers and duplicate routes; distinguish session, channel readiness and feature/API authorization errors. This is foundational because all live creator-data features depend on a reliable account contract.

### 2. Restore permanent production diagnostics and structured bug reporting
**Priority:** Critical · **Status:** Partially built  
Keep diagnostics visible on production/mobile; capture runtime SHA, route, build, network/auth failures, viewport and recent events; provide Copy Bug Report / Copy Diagnostics.

### 3. Complete the PR #77 → main consolidation safely
**Priority:** Critical · **Status:** Integration work  
Use a dedicated integration branch, preserve newer main behavior, port #77 features subsystem-by-subsystem, obey canonical ownership, run zero-new-failure gates and tag recovery points.

### 4. Rebuild and land PR #78 anomaly foundation only after #77
**Priority:** High · **Status:** Blocked by #77  
Branch from post-#77 main; port corrected anomaly accessors/services/tests; correct traffic-day grouping; defer incorrect subscriber-share scanning; keep UI and automatic learning outside the foundation PR.

### 5. Finish canonical route, page, tool and feature-gate registries
Resolve route drift for Projects, Analytics/local-analytics, AI Brain, Vault and editor aliases; classify production/beta/lab/hidden/archive and add registry integrity checks.

### 6. Complete dead-code / quarantine / duplicate-owner consolidation
Audit unreachable files, orphaned registries, duplicate services, legacy Performance Hub paths and stale flags. Quarantine before deletion and never restore an older whole file merely to recover one feature.

### 7. Lock recovery baselines and finish recovery-vs-main audit
Preserve known-good recovery branches/tags; compare file-by-file and feature-by-feature; selectively port verified improvements.

### 8. Establish release gates for build, tests, real-data, mobile and production
Require focused tests, typecheck, production build, full-suite delta, real-data sync smoke, mobile smoke and production smoke before canonical merges.

## Data

### 9. Finish VT-SYNC as the single analytics acquisition/persistence owner
Consolidate API/import adapters, normalization, provenance, IndexedDB/packed storage and snapshot projections; eliminate parallel raw analytics ownership.

### 10. Finish the analytics dataset / metric / dimension registry
Catalog every supported dataset family, metric, dimension, grain, source, availability and query constraint; mark planned/missing datasets explicitly.

### 11. Finish lifetime daily-history + time-window architecture
Store day-grained datasets as lifetime history where practical; derive 7/28/90/365/custom windows locally; add comparison and upload-relative windows.

### 12. Complete traffic-source, geography, country, state, city and DMA datasets
Finish traffic-detail taxonomy and geographic mappings; verify city/DMA query behavior and canonical labels; connect the results to tables and visuals.

### 13. Complete deep single-video analytics architecture
Wire selected-video context, lifetime daily metrics, first 24/48/72h, retention, traffic/search/external, subscriber status, demographics, device/OS and playback datasets.

### 14. Finish retention data pipeline and validation
Complete retention sync/table/data shape, 100-point validation, AVP% semantics and upload-relative analysis; certify Shorts and long-form behavior.

### 15. Build production CSV / Google-report import augmentation
Import Studio/Analytics exports for CTR, thumbnail impressions, stayed-to-watch, end-screen metrics and audience metrics; classify files and join by video ID with provenance.

### 16. Finish the canonical Data Table system
Standardize table definitions, selectors, sorting/filtering, provenance/availability states, video identity and imported columns.

### 17. Fix mobile data rehydration / loading races and sync states
Resolve CSV/cache rehydration races, loading-only states and startup request storms; separate session readiness from heavy catalog/API hydration.

### 18. Add deterministic demo datasets and demo-mode data isolation
Create stable neutral datasets/scenarios and CSV packs; never silently mix simulated data with production truth.

## Visuals

### 19. Consolidate the production analytics visual registry and WidgetShell system
Make visual IDs, renderers and controller metadata canonical; bind widgets to VT-SYNC/analytics-canon adapters; remove duplicate hardcoded implementations.

### 20. Apply the canonical visual controller + module shell standard
Standardize title/icon/help/provenance/controller geometry, the three-row controller pattern, capture/mobile contracts and shared actions without flattening native visual composition.

### 21. Restore and certify the recovered analytics visual changes
Recover Channel Progress delta, Heat Matrix scrollbar, Keyword Venn Ranked By layout, animation/time-window work, table fixes and sitewide scrollbar/mobile refinements.

### 22. Finish Shorts Retention visualization productionization
Use AVP%, views-based Best ranking, Top-N/format controls, correct bubble layering/hover/radius/color behavior and fix mobile loading.

### 23. Complete the dense Analytics Command Center / mega dashboard
Integrate KPI, progress, retention, revenue, geography, technology, traffic and deep-video modules into the standardized responsive grid.

### 24. Port the highest-value source-faithful widgets into production React
Use the Top-40 / 190-widget atlases to select winners; port source DOM/composition into WidgetShell; replace mock values with canonical adapters/actions.

### 25. Consolidate micro-visuals as reusable embedded components
Select the strongest micro-visual variants, remove duplicates and expose them as embedded visualization primitives rather than standalone routes.

### 26. Finish the canonical ViewTube component / primitive library
Unify buttons, dropdowns, inputs, badges, icon buttons, text sizing by component height, corner radii, shadows, secondary stroke colors and focus behavior.

### 27. Finish Vault media-module families and A→Z spectrum tags
Complete 16:9, 9:16, 1:1, audio/document families; preserve editable titles/notes/tags; finish alphabetical spectrum tags; constrain inner scrolling.

### 28. Finish mobile-first visual and widget certification
Test responsive layouts, controllers, tables, inline widgets and capture modes on mobile; use the mobile-safe widget gallery as a production reference.

## Intelligence

### 29. Finish Creator Brain Phase One real-application integration
Wire one production dependency root, real VT-SYNC read, Projects read/write, comment/catalog workflow, Studio handoff, Publisher dry-run, Sidecar, approvals, audit events and one learning outcome.

### 30. Build creator-facing evidence / provenance / confidence UI
Add Why this recommendation?, What changed?, confidence/uncertainty, freshness, contradictions and Open in Analytics links.

### 31. Finish Brain context adapters across Projects, Catalog, Comments, Vault, Editor and Publisher
Create bounded adapters and selected-video/comment/project context hooks; keep Brain from creating parallel domain databases.

### 32. Implement Brain user controls, learning controls and audit history
Add Personalization OFF, per-tool/dataset access, Teach Brain, Don't learn from this, explicit Channel Profile promotion, correction/delete ledger and external-action confirmation controls.

### 33. Build Brain evaluation and regression system
Add evidence/hallucination, stale/contradictory-data, niche/low-data benchmarks, prompt/model diffs, latency/cost and confidence calibration.

### 34. Complete anomaly intelligence after the foundation merge
Add persistence/correlation, Brain/evaluation integration, controlled Algorithm Momentum signals, Anomaly Radar UI and later adaptive pattern learning.

### 35. Finish Next Best Action and approved workflow-chain orchestration
Connect Brain recommendations to one-click creator workflows with explicit creator approval and action packets.

## Projects / Creator Workflows

### 36. Create one canonical Project entity and shared project persistence
Unify project identity/state across Kanban, Calendar, Ideas, Mind Map, Creator Canvas, assets, publishing and editor; migrate important local-only persistence.

### 37. Finish Projects page, calendar, Kanban and unified planning workspace
Recover integrated Projects/Kanban work; finish planning/calendar routes; connect milestones, publish dates, queue/status and preserved view/filter state.

### 38. Integrate Creator Canvas OS into production and connect the content pipeline
Connect idea → angle → hook → script → storyboard → assets → packaging → publish plan; hand off to Projects, Vault and Editor.

### 39. Finish Studio Hub canonical toolbox / subtoolbox architecture
Normalize the ten main toolboxes, shared shells, hierarchy, palette/icon rules and deep links; remove one-off shells.

### 40. Finish Comment Responder + Recommend Video workflow
Connect real comments/source-video context; use comment + video metadata + catalog to rank a relevant recommendation; preserve reply/moderation workflow.

### 41. Finish Audience Loop and community-to-project workflows
Integrate AudienceLoopStudio, comment/request mining, community posts and handoffs into Creator Canvas, Projects and Brain.

### 42. Finish Creator Vault / Resource Library application integration
Build a real `/vault` route, project-aware/versioned assets, templates/FX/presets/audio/transitions/CTAs and one-click insertion into Editor/creator tools.

### 43. Consolidate VTE1 editor branches and finish mobile editor + timeline minimap
Merge editor features safely; preserve the canonical clip design; build a working mobile minimap and redesign mobile UI to match the desktop editor.

### 44. Finalize the clip / transition component system
Use canonical clips 1–5; create transitions that visually connect clips while retaining adapted black ends and a clear transition interior; select the strongest concept from the design explorations.

### 45. Finish publishing / scheduling / preflight / dry-run workflow
Connect Projects and Packaging to a safe Publisher with queue, schedule, preflight, explicit approval and dry-run paths.

## Product / Documentation / Release

### 46. Rebuild the User Guide around production pages with contextual help
Organize by page, collapse page sections, finish current-route/tool copy, centralize `?` help content and reusable help panels, and add first-use/replayable contextual guidance.

### 47. Complete the permanent ViewTube Resource Library and cross-link it to tools
Finish canonical documents, uniform document anatomy/templates/categories, search/tags/related links and contextual links from tool help; maintain widget/HTML inventories.

### 48. Finish the ViewTube promo/demo capture production system
Build standardized HTML capture sheets/frames, finish high-priority 16:9 hero modules, use deterministic demo data, and follow the locked data → insight → creation → publication → learning story.

### 49. Finish product observability, feedback, help, About/Access and support surfaces
Complete error explainers, feedback categories/severity, diagnostic attachment, What Can ViewTube Access?, About ViewTube and contact/support paths.

### 50. Run final system consolidation and end-to-end certification
Verify canonical ownership, routes, data provenance, widgets, Brain, Projects, Studio, Vault, Editor, Publisher, Guide, demo mode and mobile across the complete product loop.

# System / feature guide

## VT-SYNC
Canonical YouTube analytics acquisition, normalization, provenance, persistence and snapshot layer. It feeds tables, visuals, deterministic insights and Brain evidence without owning creator preferences or AI memory.

## analytics-canon
Public analytics boundary for consumers. Widgets and intelligence should read normalized/canonical analytics rather than creating private query/storage paths.

## Data Tables
Inspectable canonical dataset surfaces. They expose provenance, missing-data states, imported columns, filters and video identity before information is visualized.

## Data Visuals / Widget System
Reusable visual modules registered centrally and rendered through a shared shell. Native visual composition remains intact while title, help, provenance, controls, sizing and actions become consistent.

## Analytics Command Center
Dense analytics command surface combining channel progress, traffic, retention, revenue, geography, technology and deep-video analysis.

## Creator Brain
Grounded intelligence/orchestration layer. It consumes canonical evidence, explains recommendations, proposes approved actions and learns only through explicit controlled mechanisms.

## Channel Profile / Learning Ledger
Durable channel-level learning and outcome history. Brain may propose/promote learnings, but raw analytics remain in VT-SYNC.

## Projects
Canonical persistent object connecting ideas, planning, milestones, Kanban, calendar, assets, editor state, packaging and publishing.

## Creator Canvas
Creation workspace that turns an idea into angle, hook, script, storyboard, assets and downstream handoffs.

## Studio Hub
Tool-oriented creator workflow surface using the hierarchy **PAGE → MAIN TOOLBOX → SUBTOOLBOX → controls/cards/results**.

## Comment Responder / Audience Loop
Community workflow using real comment and source-video context for replies, moderation, audience requests and relevant video recommendations.

## Creator Vault / Resource Library
Project-aware asset and reusable-resource layer for media, templates, presets, audio, transitions, CTAs, documents and guidance.

## VTE1 Editor
Production timeline and asset-assembly system. It should consume canonical project/assets and expose a coherent desktop/mobile editing model.

## Publisher
Preflight, schedule, queue and dry-run/external-action layer with explicit creator approval.

## User Guide / contextual help
Page-organized documentation backed by feature registries, concise `?` panels and deeper Resource Library links.

## Diagnostics / observability
Always-available structured runtime evidence for auth, network, route, build and mobile failures.

## Demo / Promo system
Deterministic neutral-data capture system for 16:9 modules, screenshots, demos and promotional video without exposing private creator data.

# Reference and artifact atlas

| Reference / artifact | What it contributes | Use for |
| --- | --- | --- |
| `VIEWTUBE_MASTER_ARCHITECTURE_AND_VTSYNC_DATA_OWNERSHIP.docx` | Canonical product loop, major systems, ownership boundaries and production/prototype governance | Architecture; Tasks 1–50 |
| `VIEWTUBE_VT_SYNC_ANALYTICS_ARCHITECTURE_MASTER_REFERENCE_2026-09-03.docx` | Canonical VT-SYNC, datasets, windows, provenance, CSV, tables, visuals and Deep Dive architecture | Tasks 9–18 |
| `VIEWTUBE_PR77_TO_MAIN_MERGE_FEATURE_COMBINATION_OPTIMIZATION_GUIDE_2026-09-03.docx` | Safe PR #77 merge method, canonical owners, rollback, cleanup and #78 preparation | Tasks 3–8 |
| `ViewTube_PR78_Safe_Merge_After_PR77_Resource.docx` / `ViewTube_PR78_Safe_Merge_to_Main_Resource.docx` | Correct sequencing and bounded anomaly-foundation scope | Tasks 4, 34 |
| `ViewTube_Auth_API_Stabilization_Reference.md` | Auth failure patterns, flat-route contract, deployment/runtime SHA lessons and diagnostics requirements | Tasks 1–2, 8, 17 |
| `ViewTube-Task-Index-v10-UI-Restored.html` plus VT12/VT13/VT14 variants | Broad task registry spanning data, visuals, Brain, Projects, Studio, Vault, editor, mobile and observability | All workstreams |
| `VISUAL_CONTROLLERS_AND_MODULE_SHELL_STANDARD.docx` | Canonical analytics shell/header/controller standard and V13 palette rules | Tasks 19–28 |
| `ViewTube_Standalone_Component_Library_Complete.html` | Source/component inventory including WidgetPrimitives, WidgetRenderer and WidgetShell | Tasks 19, 24, 26 |
| `ViewTube-Top-40-Widgets-Source-Faithful-Production-Atlas.html` | Source-faithful widget DOM, production-port recipes and VT-SYNC adapter expectations | Tasks 19, 24 |
| `ViewTube-All-190-Widgets-MOBILE-SAFE-Inline-Gallery-and-Consolidation.html` | 190-widget mobile-safe gallery and consolidation groups | Tasks 24–25, 28 |
| `STANDALONE_HTML_PROTOTYPE_INVENTORY_LIBRARY_WIDE.md` | Inventory/disposition guide for widget, micro-visual, Studio, Kanban and recovered HTML prototypes | Tasks 24–28, 37–44, 47–48 |
| `STUDIO_HUB_TOOLBOX_ARCHITECTURE.docx` | Canonical Studio Hub hierarchy and ten main toolboxes | Tasks 39–45 |
| `HIDDEN_FEATURES_ROUTES_AND_RECOVERED_SYSTEMS_CATALOG.docx` | Route drift, hidden/recovered systems, unused-code audit categories and lifecycle classifications | Tasks 5–7, 42 |
| `ViewTube-Hidden-Tools-Internal-Access-Plan.docx` | Central page/tool registry schema, feature gates and hidden-resource governance | Tasks 5–6, 47 |
| `PHASE_1_7_EVIDENCE_REAL_APP_FINISH_PLAN.md` | Brain evidence, adapters, Sidecar, evaluation, user controls and Phase One completion criteria | Tasks 29–35 |
| `ViewTube_Promo_100_Frame_Production_Matrix.xlsx` | Promo build queue, hero priorities, tool/module mapping and HTML frame names | Task 48 |
| `ViewTube_50_ZIP_Compilation_Control_Sheet.csv` | Archive/provenance map for architecture, task indexes, prototypes, design system, widgets, Studio, mobile, Guide, Brain and Creator OS | Tasks 6–7, 47–48 |
| `ViewTube_25_Recent_Conversations_All_Distinct_Objectives.docx` | Conversation-level objective inventory used to distinguish true workstreams from implementation substeps | Master consolidation source |

# Important standalone HTML families to preserve and mine

- **Widget design mine:** `viewtube-20-awesome-youtuber-widgets-v4.html`, `ViewTube_20_Best_Dashboard_Widgets.html`, `ViewTube_20_Real_Dashboard_Widgets.html`, `viewtube_creator_operations_20_widgets*.html`, `ViewTube_NextGen_20_Widget_System.html`, `ViewTube_API_Creator_Tools_20_New_Widgets*.html`, Volume III / IV / V creator-tool files.
- **Micro visual family:** `viewtube_micro_visuals_widget.html`, cluster v2, ultracompact v3, density v4/v5, `viewtube_master_micro_dense_compositions.html`.
- **Studio evolution:** `viewtube_studio_foundation.html`, v2 design system/data engine, v3 content workspaces, v4 integrated creator OS, v5 analytics command center, v6 intelligence platform, phase7 integrated app/platform, intelligence studio v0.1.
- **Kanban / planning:** `viewtube_content_planning_kanban.html`, `viewtube_flagship_content_command_kanban.html`, mobile-fixed flagship Kanban.
- **Super tools / catalogs:** `viewtube_super_tools_04_11_13.html`, `viewtube_super_tool_component_atlas.html`, rebuilt atlas and `viewtube-combined-catalog` variants.
- **Production component/widget references:** `ViewTube_Standalone_Component_Library_Complete.html`, `ViewTube-Top-40-Widgets-Source-Faithful-Production-Atlas.html`, `ViewTube-All-190-Widgets-MOBILE-SAFE-Inline-Gallery-and-Consolidation.html`.

# Recommended implementation sequence

1. **Phase A — Freeze and stabilize:** Tasks 1–8. Do not broaden features while auth, merge ownership, route registries and release gates are ambiguous.
2. **Phase B — Canonicalize data:** Tasks 9–18. Make every analytics consumer depend on one trustworthy VT-SYNC → analytics-canon path.
3. **Phase C — Certify visuals:** Tasks 19–28. Port only the strongest widgets and recovered visuals into the canonical registry/shell and certify mobile.
4. **Phase D — Ground intelligence:** Tasks 29–35. Complete Brain Phase One with evidence, controls and real adapters before expanding adaptive intelligence.
5. **Phase E — Close the creator workflow loop:** Tasks 36–45. Make Projects the shared object and wire Studio, Canvas, Community, Vault, Editor and Publisher.
6. **Phase F — Productize and release:** Tasks 46–50. Finish Guide/Resources/Demo/Observability and run the full-system certification gate.

# Definition of integrated / finished

A task is not considered integrated merely because code or a prototype exists. It is finished when it:

- exists on the canonical production route or registry, not only in an HTML prototype, branch, ZIP, conversation or quarantine folder;
- uses the canonical owner for data/state and does not create a parallel source of truth;
- has real-data behavior plus explicit loading, empty, unavailable, error and logged-out/demo states;
- works on mobile where user-facing;
- has focused tests and introduces no new failures against the accepted baseline;
- passes typecheck and production build;
- has help/guide metadata and provenance where appropriate;
- has been smoke-tested in production after deployment;
- has duplicate/old implementations classified as compatibility adapter, archive/quarantine or safe-to-remove;
- is reflected in the Task Index and Resource Library so future agents do not rebuild it from scratch.

# Non-negotiable preservation rules

- Do not overwrite `main` wholesale. Merge slowly and subsystem-by-subsystem.
- Do not restore an older whole file merely to recover one feature.
- Do not let old Performance Hub code regain runtime analytics authority.
- CSV/import data is additive and provenance-aware; simulated/demo data never silently becomes production truth.
- Hidden/internal is a lifecycle/discoverability state, not a security boundary and not proof of dead code.
- Keep diagnostics available during stabilization work.
- Preserve exact visual composition where source fidelity matters; standardize the shell, not the visual into sameness.
- Promo visual grammar remains: white outer canvas, authentic ViewTube module/toolbox, black strokes and the ViewTube palette. Channel Progress does not use a dark background.

# Master outcome

The finished ViewTube should behave as one continuous system: canonical YouTube data enters VT-SYNC; analytics-canon exposes trustworthy facts; tables and visuals make them inspectable; Brain turns evidence into explainable insight and approved actions; Projects carry intent; Studio/Creator Canvas turn intent into work; Vault supplies assets; VTE1 produces; Publisher releases; Audience Loop captures response; outcomes and corrections feed learning; and the next analytics cycle begins.

The 50 tasks above are the highest-value unfinished work required to make that loop real, stable, understandable and production-certified.
