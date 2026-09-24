# ViewTube Documentation Registry

**Wave:** Docs consolidation Wave 1  
**Baseline commit:** `f3da5100d49304fcd196a322fd00574656b01ece`  
**Baseline inventory:** **119 pre-existing files** under `/docs`  
**Audit date:** 2026-09-24  
**Purpose:** classify the existing documentation before any move, merge, archive, or deletion.

> This registry is an audit map, not a destructive migration. Wave 1 does not move or delete any baseline file. `review` means authority is intentionally unresolved until the owning domain is checked against current code and tests.

## Lifecycle vocabulary

| Lifecycle | Meaning |
| --- | --- |
| `canonical` | Explicit current authority for a bounded concern. |
| `active-plan` | Plan/work order with work that may still be open; status must be verified before archive. |
| `reference` | Useful durable context, implementation notes, contracts, schemas, or supporting data that are not the primary authority. |
| `evidence` | Status, QA, acceptance, snapshot, baseline, or changelog evidence. |
| `historical` | Older generation retained for provenance; should not override current authority. |
| `artifact` | Herald output, screenshot, demo, or prototype evidence. |
| `retirement-candidate` | Low-value/transient document that can be removed only after reference/unique-content verification. |
| `review` | Potential authority conflict or stale/current ambiguity that requires code-backed reconciliation. |

## Baseline summary

- **active-plan:** 12
- **artifact:** 12
- **canonical:** 7
- **evidence:** 11
- **historical:** 42
- **reference:** 27
- **retirement-candidate:** 3
- **review:** 5

### Domain counts

- **analytics:** 8
- **architecture:** 31
- **brain:** 14
- **brain/herald:** 13
- **community:** 1
- **demos:** 1
- **deployment:** 2
- **editor:** 7
- **governance:** 1
- **migration:** 26
- **ui:** 14
- **user-guide-v2:** 1

## Explicit current authorities identified in Wave 1

- `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md` — Canonical living Analytics / VT-SYNC architecture and migration authority created in Wave 4.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` — Current Studio Hub component-library presentation and primitive-correction authority.
- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md` — Living cross-system Project/ContentBuild workflow authority referenced by CLAUDE.md.
- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md` — Canonical Asset Engine product/architecture reference referenced by CLAUDE.md.
- `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` — Canonical living AI / Brain architecture authority, reconciled against current runtime/evidence/evaluation systems in Wave 5.

- `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` — Canonical production Toolbox/Subtoolbox design-system authority reconciled in Wave 3.

These authorities are scoped, not global. For example, the Studio component-library source-of-truth does not replace the Project/ContentBuild master resource.

## Full 119-file baseline registry

| # | Path | Domain | Lifecycle | Proposed disposition | Size | Audit note |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `docs/analytics/YOUTUBE_ANALYTICS_DATASET_EXPANSION_PLAN.md` | analytics | `active-plan` | `consolidate-after-status-audit` | 21714 | Active analytics dataset expansion plan with supporting matrix. |
| 2 | `docs/analytics/youtube-analytics-dataset-expansion-matrix.csv` | analytics | `reference` | `retain-or-consolidate` | 9570 | Supporting machine-readable/reference artifact; preserve unless an owning canonical registry replaces it. |
| 3 | `docs/architecture/ASSET_ENGINE_CONTENTBUILD_IMPLEMENTATION_PLAN_2026-09-20.md` | architecture | `historical` | `retain-as-milestone-reference` | 10084 | Wave 2 reconciled implemented/open requirements into the two living masters; preserve as implementation history. |
| 4 | `docs/architecture/AUTH_PR_CONSOLIDATION_AUDIT.md` | architecture | `reference` | `retain-or-consolidate` | 7493 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 5 | `docs/architecture/CSS_SYSTEM_ISOLATION_PLAN_2026-09-14.md` | architecture | `active-plan` | `status-audit` | 5190 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 6 | `docs/architecture/dashboard-baseline.json` | architecture | `evidence` | `keep-as-evidence` | 2254 | Verification/status snapshot; useful evidence but not architectural authority. |
| 7 | `docs/architecture/dashboard-style-snapshot.json` | architecture | `evidence` | `keep-as-evidence` | 83646 | Verification/status snapshot; useful evidence but not architectural authority. |
| 8 | `docs/architecture/MOBILE_WIDGET_PHASE2_CLASSIFICATION.md` | architecture | `reference` | `retain-or-consolidate` | 3231 | General documentation; verify current scope and merge target during its domain wave. |
| 9 | `docs/architecture/PROJECT_CONTENTBUILD_ASSET_ENGINE_VIDEO_PACKAGE_CONSOLIDATION_2026-09-22.md` | architecture | `historical` | `retain-as-consolidation-record` | 21441 | Wave 2 promoted hard identity/persistence/publishing rules into the living masters; preserve this convergence plan for provenance. |
| 10 | `docs/architecture/SIMPLE_AUTH_V1.md` | architecture | `review` | `audit-before-move` | 1188 | Useful implementation reference but auth routes have evolved; reconcile into one current-state auth authority. |
| 11 | `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md` | architecture | `historical` | `retain-as-migration-reference` | 6526 | Specialized Studio migration reference; current rules live in the Toolbox UI master. |
| 12 | `docs/architecture/STUDIO_HUB_MIGRATION_MATRIX_V1.md` | architecture | `historical` | `retain-as-execution-ledger` | 5414 | 2026-09 migration status snapshot; verify current tool status against code before scheduling work. |
| 13 | `docs/architecture/STUDIO_HUB_UNIFORM_PRIMITIVE_AUDIT_PLAN_2026-09-16.md` | architecture | `historical` | `retain-as-audit-record` | 8469 | Audit method/evidence retained; desktop 56/44 baseline superseded by current 80/56 desktop and 56/44 mobile contracts. |
| 14 | `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md` | architecture | `reference` | `retain-or-consolidate` | 4276 | General documentation; verify current scope and merge target during its domain wave. |
| 15 | `docs/architecture/toolbox-ui-master-resource/HANDOFF_UPDATE_PROTOCOL.md` | architecture | `reference` | `retain-or-consolidate` | 3648 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 16 | `docs/architecture/toolbox-ui-master-resource/README.md` | architecture | `reference` | `retain-or-consolidate` | 2796 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 17 | `docs/architecture/VIDEO_ASSET_ENGINE_WIDGET_IDEAS_2026-09-20.md` | architecture | `reference` | `retain-as-idea-catalog` | 4247 | Durable dashboard requirements were folded into the Asset Engine master; retain the 25-item catalog as non-authoritative product backlog/reference. |
| 18 | `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md` | architecture | `canonical` | `retain-current` | 38239 | Canonical Asset Engine product/architecture reference referenced by CLAUDE.md. |
| 19 | `docs/architecture/VIEWTUBE_AUTH_API_STABILIZATION_REFERENCE.md` | architecture | `review` | `audit-before-move` | 8890 | High-value troubleshooting/current-state reference; consolidate with Simple Auth and route truth. |
| 20 | `docs/architecture/VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md` | architecture | `reference` | `retain-or-consolidate` | 1962 | General documentation; verify current scope and merge target during its domain wave. |
| 21 | `docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md` | architecture | `reference` | `retain-or-consolidate` | 6108 | General documentation; verify current scope and merge target during its domain wave. |
| 22 | `docs/architecture/VIEWTUBE_CROWN_MAIN_AUDIT_2026-09-11.md` | architecture | `reference` | `retain-or-consolidate` | 3410 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 23 | `docs/architecture/VIEWTUBE_CROWN_PHASE2_ROYAL_EXCHANGE.md` | architecture | `reference` | `retain-or-consolidate` | 2617 | General documentation; verify current scope and merge target during its domain wave. |
| 24 | `docs/architecture/VIEWTUBE_CROWN_PHASE3_READ_ONLY_BRIDGE.md` | architecture | `reference` | `retain-or-consolidate` | 2234 | General documentation; verify current scope and merge target during its domain wave. |
| 25 | `docs/architecture/VIEWTUBE_CROWN_RUNTIME_CONTROL_ROOM_PLAN.md` | architecture | `active-plan` | `status-audit` | 1659 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 26 | `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md` | architecture | `canonical` | `retain-current` | 29531 | Living cross-system Project/ContentBuild workflow authority referenced by CLAUDE.md. |
| 27 | `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` | architecture | `canonical` | `retain-current` | 25194 | Wave 3 resolved code/token geometry conflicts; global Toolbox/Subtoolbox living design-system authority. |
| 28 | `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md` | architecture | `active-plan` | `consolidate-after-status-audit` | 21251 | Active widget/dashboard optimization planning; verify merged portions before consolidation. |
| 29 | `docs/architecture/viewtube-crown-protocols.schema.json` | architecture | `reference` | `retain-or-consolidate` | 6147 | Supporting machine-readable/reference artifact; preserve unless an owning canonical registry replaces it. |
| 30 | `docs/architecture/WIDGET_FUTURES_RECOVERY_REGISTRY_2026-09-14.md` | architecture | `active-plan` | `retain-active-scoped` | 6811 | Active widget concept recovery/deduplication registry; explicitly not a production widget registry. |
| 31 | `docs/architecture/WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md` | architecture | `active-plan` | `retain-active-scoped` | 11478 | Active Dashboard widget certification program; WidgetRegistry remains canonical metadata and this plan does not own Toolbox geometry. |
| 32 | `docs/architecture/YOUTUBE_API_STABILIZATION_V1_TRACKER.md` | architecture | `active-plan` | `status-audit` | 5981 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 33 | `docs/architecture/YOUTUBE_AUTH_API_SIMPLIFICATION_PLAN.md` | architecture | `review` | `audit-before-move` | 8247 | Design direction differs from the currently deployed flat+compatibility route implementation; reconcile against code. |
| 34 | `docs/brain/AI_BRAIN_REACHABILITY_AUDIT_PASS1_2026-09-17.md` | brain | `historical` | `retain-as-history` | 8018 | Historical production-reachability snapshot; retain audit method and direct-generation debt evidence. |
| 35 | `docs/brain/AI_BRAIN_REACHABILITY_AUDIT_WORK_ORDER_2026-09-17.md` | brain | `historical` | `retain-as-history` | 2284 | Completed reachability audit work order; retain as reusable audit recipe/provenance. |
| 36 | `docs/brain/AI_CROSS_BRANCH_HARVEST_PASS1_2026-09-18.md` | brain | `historical` | `retain-as-history` | 5711 | Historical donor-branch harvest audit; many harvested capabilities now exist on current main. |
| 37 | `docs/brain/AI_INTELLIGENCE_ENGINE_PHASE0_SYSTEM_MANIFEST_2026-09-17.md` | brain | `historical` | `retain-as-history` | 5753 | Historical Phase-0 ownership/reachability baseline. |
| 38 | `docs/brain/ASSET_ENGINE_CANONICAL_BACKBONE.md` | brain | `historical` | `retain-as-foundation-reference` | 11199 | Foundational ownership/backbone document superseded for current authority by the Asset Engine master and Projects/ContentBuild master. |
| 39 | `docs/brain/BRAIN_RUNTIME_PHASE_1_MODEL_AND_ORCHESTRATION_INVENTORY_2026-09-11.md` | brain | `historical` | `retain-as-history` | 7369 | Historical Phase-1 provider/orchestration inventory; useful migration provenance. |
| 40 | `docs/brain/BRAIN_SHARED_CONVERSATION_CONTROLLER_PHASE_2_2026-09-12.md` | brain | `historical` | `retain-as-history` | 3133 | Historical implementation slice for the still-live shared conversation controller. |
| 41 | `docs/brain/PHASE_1_CLOSEOUT_PHASE_2_START.md` | brain | `historical` | `retain-as-history` | 3553 | Historical branch closeout/phase-transition record. |
| 42 | `docs/brain/PHASE_4_LIVE_TOOL_INTEGRATION.md` | brain | `historical` | `retain-as-history` | 2342 | Historical phase closeout; retain live-tool handoff integration pattern as provenance. |
| 43 | `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` | brain | `canonical` | `retain-current` | 5638 | Canonical consolidation contract for the unified AI system. |
| 44 | `docs/brain/UNIVERSAL_TOOL_HANDOFFS_AND_SUGGESTED_CHAINS.md` | brain | `reference` | `retain-production-linked` | 5570 | Current cross-tool ActionPacket/suggested-chain architecture reference; subordinate to unified AI authority and domain owners. |
| 45 | `docs/community/COMMUNITY_BULK_CAMPAIGN_IMPLEMENTATION.md` | community | `reference` | `retain-or-consolidate` | 3384 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 46 | `docs/DATA_VISUAL_MODULE_UNIFICATION_STATUS.md` | analytics | `evidence` | `keep-as-evidence` | 236 | Verification/status snapshot; useful evidence but not architectural authority. |
| 47 | `docs/DATA_VISUAL_MODULE_UNIFICATION.md` | analytics | `historical` | `retain-as-foundation-reference` | 2359 | Early DataVisualCanvas migration bridge; current canvas/responsive authority now lives in scoped contracts and Analytics master. |
| 48 | `docs/demos/ViewTube_Crown_Control_Room.html` | demos | `artifact` | `keep-as-evidence` | 8188 | Demo/visual/prototype artifact; evidence rather than normative documentation. |
| 49 | `docs/deployment/PRODUCTION_DEPLOY_TRIGGER.md` | deployment | `retirement-candidate` | `verify-before-delete` | 362 | Deployment trigger marker rather than durable documentation; verify no references, then delete in cleanup wave. |
| 50 | `docs/EDITOR_DESKTOP_PROJECT_BRIDGE_HOOK_HANDOFF.md` | editor | `reference` | `retain-or-consolidate` | 3978 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 51 | `docs/editor/component-style-default.md` | editor | `reference` | `retain-or-consolidate` | 928 | General documentation; verify current scope and merge target during its domain wave. |
| 52 | `docs/editor/EDITOR_RECOVERY_PHASES_1_3_2026-09-18.md` | editor | `reference` | `retain-or-consolidate` | 1929 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 53 | `docs/editor/EDITOR_SVG_TEMPLATE_ASSET_CONSOLIDATION_PLAN_2026-09-18.md` | editor | `active-plan` | `status-audit` | 8120 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 54 | `docs/editor/MOBILE_EDITOR_PRIMITIVES_AND_TOUCH_CONTROLS_2026-09-19.md` | editor | `reference` | `retain-or-consolidate` | 6058 | General documentation; verify current scope and merge target during its domain wave. |
| 55 | `docs/editor/MOBILE_EDITOR_WORKSPACE_REPAIR_2026-09-18.md` | editor | `reference` | `retain-or-consolidate` | 2769 | General documentation; verify current scope and merge target during its domain wave. |
| 56 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/documents/data-visual-controller-unification-plan.md` | brain/herald | `historical` | `archive-after-extraction` | 12727 | Captured proposed version; newer migration plan records implementation progress. |
| 57 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/meta.json` | brain/herald | `artifact` | `keep-as-evidence` | 463 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 58 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/README.md` | brain/herald | `artifact` | `keep-as-evidence` | 1779 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 59 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/SCREENSHOTS.md` | brain/herald | `artifact` | `keep-as-evidence` | 2290 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 60 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/channel-progress--1440x1000.png` | brain/herald | `artifact` | `keep-as-evidence` | 117235 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 61 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/channel-progress--390x844.png` | brain/herald | `artifact` | `keep-as-evidence` | 76294 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 62 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/content-treemap--1440x1000.png` | brain/herald | `artifact` | `keep-as-evidence` | 213925 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 63 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/content-treemap--390x844.png` | brain/herald | `artifact` | `keep-as-evidence` | 85118 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 64 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/heat-matrix--1440x1000.png` | brain/herald | `artifact` | `keep-as-evidence` | 162992 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 65 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/heat-matrix--390x844.png` | brain/herald | `artifact` | `keep-as-evidence` | 109166 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 66 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/publish-optimal-clock--1440x1000.png` | brain/herald | `artifact` | `keep-as-evidence` | 157484 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 67 | `docs/herald/artifacts/2026-09-18--data-visual-controller-unification/screenshots/publish-optimal-clock--390x844.png` | brain/herald | `artifact` | `keep-as-evidence` | 84922 | Herald run artifact/evidence; preserve provenance, do not treat as current authority. |
| 68 | `docs/herald/CONVERSATION-LOG.md` | brain/herald | `evidence` | `retain-as-herald-evidence` | 1259 | Early partial/generated conversation-log shape; current Herald state lives in agent contracts and .viewtube/herald threads/ledgers. |
| 69 | `docs/MASTER_DATA_OVERLAY_PORTAL_PLAN_2026-09-14.md` | analytics | `active-plan` | `status-audit` | 1671 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 70 | `docs/migration/data-visual-canvas-contract.md` | migration | `canonical` | `retain-current` | 5358 | Canonical scoped Analytics Data Visual canvas ownership/geometry contract; migration compatibility remains until all renderers are native. |
| 71 | `docs/migration/data-visual-controller-unification-plan.md` | migration | `active-plan` | `consolidate-after-status-audit` | 14091 | Explicitly marked in progress in the current document. |
| 72 | `docs/migration/data-visual-mobile-mark-scale-plan.md` | migration | `active-plan` | `status-audit` | 21420 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 73 | `docs/migration/pending-features-inventory.md` | migration | `reference` | `retain-or-consolidate` | 9975 | General documentation; verify current scope and merge target during its domain wave. |
| 74 | `docs/migration/README.md` | migration | `historical` | `retain-as-migration-ledger` | 14314 | Original Analytics/auth migration program and PR ledger; current Analytics authority moved to docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md. |
| 75 | `docs/migration/reference/BRANCH_CHECK_TO_VIEWTUBEX_RELOCATION_2026-08-30.md` | migration | `historical` | `archive` | 13262 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 76 | `docs/migration/reference/CHANNEL_INTELLIGENCE_ALGORITHM_WORKFLOW_SYSTEMS_2026-09-03.md` | migration | `historical` | `archive` | 6303 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 77 | `docs/migration/reference/PARENT_DOCUMENTATION_UPDATES_2026-08-30.patch` | migration | `historical` | `archive` | 3299 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 78 | `docs/migration/reference/PR_77_MAIN_MERGE_VT_SYNC_ANALYTICS_MASTER_REFERENCE_2026-09-03.md` | migration | `historical` | `archive` | 29635 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 79 | `docs/migration/reference/PR_78_SAFE_MERGE_TO_MAIN_2026-09-03.md` | migration | `historical` | `archive` | 17279 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 80 | `docs/migration/reference/prototypes/ADAPTIVE_BRAIN_ORCHESTRATOR_2026-09-03.html` | migration | `historical` | `archive` | 2163 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 81 | `docs/migration/reference/prototypes/VIEWTUBE_BRAIN_USER_CONTROL_CENTER_2026-09-03.html` | migration | `historical` | `archive` | 15493 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 82 | `docs/migration/reference/README.md` | migration | `historical` | `archive` | 7869 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 83 | `docs/migration/reference/VIEWTUBE_AUTH_ARCHITECTURE_REVIEW_2026-08-27.html` | migration | `historical` | `archive` | 8087 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 84 | `docs/migration/reference/VIEWTUBE_CANONICAL_OWNER_MIGRATION_PLAN_2026-09-03.md` | migration | `historical` | `archive` | 8524 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 85 | `docs/migration/reference/VIEWTUBE_DEVELOPMENT_STATUS_2026-09-03.md` | migration | `historical` | `archive` | 5008 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 86 | `docs/migration/reference/VIEWTUBE_PR77_TO_MAIN_MERGE_FEATURE_COMBINATION_OPTIMIZATION_GUIDE_2026-09-03.md` | migration | `historical` | `archive` | 12572 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 87 | `docs/migration/reference/VIEWTUBE_SYSTEM_INTEGRATION_MATRIX_2026-09-03.md` | migration | `historical` | `archive` | 5507 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 88 | `docs/migration/reference/VIEWTUBE_SYSTEM_REFERENCE_REFRESH_2026-09-03.md` | migration | `historical` | `archive` | 3317 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 89 | `docs/migration/reference/VIEWTUBE_SYSTEM_REGISTRY_2026-09-03.json` | migration | `historical` | `archive` | 17422 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 90 | `docs/migration/reference/VIEWTUBE_UNDEPLOYED_SYSTEMS_AUTH_MERGE_INDEX_2026-08-27.md` | migration | `historical` | `archive` | 25793 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 91 | `docs/migration/reference/VIEWTUBE_UNDEPLOYED_SYSTEMS_INDEX_2026-08-27.json` | migration | `historical` | `archive` | 3065 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 92 | `docs/migration/reference/VIEWTUBE_UNIFIED_SYSTEMS_ARCHITECTURE_2026-09-03.md` | migration | `historical` | `archive` | 10461 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 93 | `docs/migration/reference/VIEWTUBE_VT_SYNC_ANALYTICS_ARCHITECTURE_MASTER_REFERENCE_2026-09-03.md` | migration | `historical` | `archive` | 25050 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 94 | `docs/migration/reference/VIEWTUBEX_VS_BRANCH_CHECK_REFRESH_2026-08-29.md` | migration | `historical` | `archive` | 16898 | Migration reference snapshot retained for provenance; not current architecture authority. |
| 95 | `docs/migration/TIME_WINDOW_IMPLEMENTATION_PLAN_2026-09-11.md` | migration | `active-plan` | `consolidate-after-status-audit` | 26044 | Implementation plan with open gap-period policy noted; retain active until status audit closes it. |
| 96 | `docs/MOBILE_ANALYTICS_CONTROLLER_ACCEPTANCE_2026-09-14.md` | analytics | `evidence` | `keep-as-evidence` | 652 | Verification/status snapshot; useful evidence but not architectural authority. |
| 97 | `docs/MOBILE_ANALYTICS_CONTROLLER_CORRECTION_2026-09-14.md` | analytics | `historical` | `retain-as-implementation-evidence` | 1581 | September 14 collision/correction evidence; current controller/responsive contracts supersede its CSS-precedence wording. |
| 98 | `docs/MOBILE_ANALYTICS_CONTROLLER_TEST_MATRIX_2026-09-14.md` | analytics | `evidence` | `keep-as-evidence` | 1017 | Verification/status snapshot; useful evidence but not architectural authority. |
| 99 | `docs/MOBILE_VISUAL_PHASE2_CHANGELOG.md` | ui | `evidence` | `keep-as-evidence` | 715 | Verification/status snapshot; useful evidence but not architectural authority. |
| 100 | `docs/MOBILE_VISUAL_QA_MATRIX.md` | ui | `evidence` | `keep-as-evidence` | 1435 | Verification/status snapshot; useful evidence but not architectural authority. |
| 101 | `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` | ui | `canonical` | `retain-current` | 2596 | Canonical scoped Analytics Data Visual responsive contract; separate from Studio Toolbox and Dashboard widget geometry. |
| 102 | `docs/PRIMITIVE_FIX_PREVIEW_TRIGGER.md` | ui | `retirement-candidate` | `verify-before-delete` | 104 | No-runtime-impact preview/deployment marker; verify no references, then delete in cleanup wave. |
| 103 | `docs/production-deployment-trigger.md` | deployment | `retirement-candidate` | `verify-before-delete` | 252 | No-runtime-impact deployment marker; verify no references, then delete in cleanup wave. |
| 104 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_CHANGELOG_2026-09-17.md` | ui | `evidence` | `keep-as-evidence` | 614 | Verification/status snapshot; useful evidence but not architectural authority. |
| 105 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_COMPONENT_INDEX.md` | ui | `reference` | `retain-or-consolidate` | 1222 | General documentation; verify current scope and merge target during its domain wave. |
| 106 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_HERALD_FIX_2026-09-17.md` | ui | `reference` | `retain-or-consolidate` | 1434 | General documentation; verify current scope and merge target during its domain wave. |
| 107 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_HERALD_STATUS.md` | ui | `evidence` | `keep-as-evidence` | 612 | Verification/status snapshot; useful evidence but not architectural authority. |
| 108 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_MOBILE_NOTES.md` | ui | `historical` | `retain-as-visual-evidence` | 899 | Historical screenshot finding; mobile geometry interpretation corrected to current 56/44 mobile shell contract. |
| 109 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` | ui | `canonical` | `retain-current` | 6872 | Current Studio Hub component-library presentation and primitive-correction authority. |
| 110 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_VISUAL_CHECKLIST.md` | ui | `evidence` | `retain-as-certification-checklist` | 1058 | Active visual evidence checklist updated to desktop 80/56 and mobile 56/44 shell contracts. |
| 111 | `docs/ui/toolbox-system/audits/MASTER_RESOURCE_50_IMPROVEMENTS_2026-09-13.md` | ui | `reference` | `retain-or-consolidate` | 4954 | General documentation; verify current scope and merge target during its domain wave. |
| 112 | `docs/ui/toolbox-system/MANIFEST.md` | ui | `reference` | `retain-or-consolidate` | 4017 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 113 | `docs/ui/toolbox-system/README.md` | ui | `reference` | `retain-or-consolidate` | 5392 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 114 | `docs/user-guide-v2/PHASE_1_2_AUDIT_AND_TRUTH_REGISTRY.md` | user-guide-v2 | `review` | `audit-before-move` | 6543 | Guide truth model is valuable but its baseline predates later September changes; refresh before authority promotion. |
| 115 | `docs/VIEWTUBE_AI_BRAIN_SYSTEMS_AUDIT_AND_MODERNIZATION_REFERENCE_2026-09-11.md` | brain | `historical` | `retain-as-history` | 39897 | Broad September 11 AI/Brain audit; current runtime has advanced materially and the unified contract is current authority. |
| 116 | `docs/VIEWTUBE_AI_CREATOR_INTELLIGENCE_OS_IMPLEMENTATION_PLAN_2026-09-11.md` | brain | `historical` | `retain-as-history` | 23217 | Original AI Creator Intelligence OS roadmap; current execution has moved to unified AI authority plus current task/finish plans. |
| 117 | `docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md` | brain | `historical` | `retain-as-history` | 61545 | Original Herald design plan; implemented authority now lives in agent/contracts/herald-* plus .viewtube/herald and exchange records. |
| 118 | `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | governance | `review` | `audit-before-move` | 25225 | Broad unfinished-work inventory can conflict with newer domain-specific state; verify item-by-item. |
| 119 | `docs/vt-e1-render-worker.md` | editor | `reference` | `retain-or-consolidate` | 1417 | General documentation; verify current scope and merge target during its domain wave. |

## Post-baseline documents created by consolidation

These files were created after the original 119-file baseline and therefore are **not** included in the baseline lifecycle counts above:

- `docs/README.md` — documentation entrypoint and authority map.
- `docs/DOCUMENTATION_GOVERNANCE.md` — lifecycle, authority, supersession, placement, and deletion-safety contract.
- `docs/DOCUMENTATION_REGISTRY.md` — this baseline registry.
- `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md` — Wave 4 living Analytics / VT-SYNC authority.

## Consolidation progress

- **Wave 1 — complete/merged:** registry, entrypoint and governance contract.
- **Wave 2 — complete/merged:** Projects / ContentBuild / Asset Engine current authority consolidated into the two living masters.
- **Wave 3 — complete/merged:** Studio UI / Toolbox / widget/mobile authority reconciled against production code/tokens.
- **Wave 4 — complete/merged:** Analytics / VT-SYNC / Data Visual authority consolidated around the living Analytics master and scoped production contracts.
- **Wave 5 — Brain / AI / Herald:** unified AI contract refreshed against current Brain runtime, evidence-quality, evaluation, learning and persistence systems; old phase/audit/branch documents demoted to history; Herald authority separated from creator Brain and mapped to implemented agent contracts + thread/ledger records.

## Next action

Wave 6 should consolidate Auth / Editor / deployment / user-guide documentation, reconcile each family against current main, and demote obsolete stabilization plans/status snapshots without erasing troubleshooting or migration evidence.


## Post-baseline editor additions — 2026-09-24

These files were added after the original 119-file Wave 1 baseline and therefore do not change the baseline counts above.

| Path | Domain | Lifecycle | Disposition | Notes |
| --- | --- | --- | --- | --- |
| docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md | editor | canonical | retain-current | Living unified editor integration authority; owns desktop/mobile parity program, editor AI/generation integration map, skill/resource/branch registry and append-only update log. |
| docs/editor/EDITOR_BRAIN_HUB_ASSISTANT_PLAN.md | editor/brain | active-plan | retain-active-scoped | Implementation plan for BrainRuntime-powered editor guide/assistant, typed proposals, semantic actions, captions and generative-media handoffs. |
