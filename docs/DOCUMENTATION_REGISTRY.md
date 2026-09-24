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

- **active-plan:** 15
- **artifact:** 12
- **canonical:** 5
- **evidence:** 9
- **historical:** 25
- **reference:** 44
- **retirement-candidate:** 3
- **review:** 6

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

- `docs/migration/README.md` — Analytics/auth migration north star; explicitly declares itself the migration source of truth.
- `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` — Current Studio Hub component-library presentation and primitive-correction authority.
- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md` — Living cross-system Project/ContentBuild workflow authority referenced by CLAUDE.md.
- `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md` — Canonical Asset Engine product/architecture reference referenced by CLAUDE.md.
- `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` — Canonical consolidation contract for the unified AI system.

These authorities are scoped, not global. For example, the Studio component-library source-of-truth does not replace the Project/ContentBuild master resource.

## Full 119-file baseline registry

| # | Path | Domain | Lifecycle | Proposed disposition | Size | Audit note |
| ---: | --- | --- | --- | --- | ---: | --- |
| 1 | `docs/analytics/YOUTUBE_ANALYTICS_DATASET_EXPANSION_PLAN.md` | analytics | `active-plan` | `consolidate-after-status-audit` | 21714 | Active analytics dataset expansion plan with supporting matrix. |
| 2 | `docs/analytics/youtube-analytics-dataset-expansion-matrix.csv` | analytics | `reference` | `retain-or-consolidate` | 9570 | Supporting machine-readable/reference artifact; preserve unless an owning canonical registry replaces it. |
| 3 | `docs/architecture/ASSET_ENGINE_CONTENTBUILD_IMPLEMENTATION_PLAN_2026-09-20.md` | architecture | `active-plan` | `consolidate-after-status-audit` | 10084 | Recent implementation plan; reconcile completion state before archiving. |
| 4 | `docs/architecture/AUTH_PR_CONSOLIDATION_AUDIT.md` | architecture | `reference` | `retain-or-consolidate` | 7493 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 5 | `docs/architecture/CSS_SYSTEM_ISOLATION_PLAN_2026-09-14.md` | architecture | `active-plan` | `status-audit` | 5190 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 6 | `docs/architecture/dashboard-baseline.json` | architecture | `evidence` | `keep-as-evidence` | 2254 | Verification/status snapshot; useful evidence but not architectural authority. |
| 7 | `docs/architecture/dashboard-style-snapshot.json` | architecture | `evidence` | `keep-as-evidence` | 83646 | Verification/status snapshot; useful evidence but not architectural authority. |
| 8 | `docs/architecture/MOBILE_WIDGET_PHASE2_CLASSIFICATION.md` | architecture | `reference` | `retain-or-consolidate` | 3231 | General documentation; verify current scope and merge target during its domain wave. |
| 9 | `docs/architecture/PROJECT_CONTENTBUILD_ASSET_ENGINE_VIDEO_PACKAGE_CONSOLIDATION_2026-09-22.md` | architecture | `active-plan` | `consolidate-after-status-audit` | 21441 | Recent active consolidation authority to fold into the living Project and Asset Engine masters once reconciled. |
| 10 | `docs/architecture/SIMPLE_AUTH_V1.md` | architecture | `review` | `audit-before-move` | 1188 | Useful implementation reference but auth routes have evolved; reconcile into one current-state auth authority. |
| 11 | `docs/architecture/STUDIO_HUB_COMPONENT_STANDARDIZATION_V1.md` | architecture | `historical` | `archive-after-extraction` | 6526 | Older Studio standardization generation; newer component-library source-of-truth contains superseding corrections. |
| 12 | `docs/architecture/STUDIO_HUB_MIGRATION_MATRIX_V1.md` | architecture | `historical` | `archive-after-extraction` | 5414 | Migration-era matrix; preserve as history/evidence after extracting still-open work. |
| 13 | `docs/architecture/STUDIO_HUB_UNIFORM_PRIMITIVE_AUDIT_PLAN_2026-09-16.md` | architecture | `historical` | `archive-after-extraction` | 8469 | Older Studio primitive audit; later September authority has superseding geometry/corrections. |
| 14 | `docs/architecture/SUBTOOLBOX_PRIMITIVE_SYSTEM_V1.md` | architecture | `reference` | `retain-or-consolidate` | 4276 | General documentation; verify current scope and merge target during its domain wave. |
| 15 | `docs/architecture/toolbox-ui-master-resource/HANDOFF_UPDATE_PROTOCOL.md` | architecture | `reference` | `retain-or-consolidate` | 3648 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 16 | `docs/architecture/toolbox-ui-master-resource/README.md` | architecture | `reference` | `retain-or-consolidate` | 2796 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 17 | `docs/architecture/VIDEO_ASSET_ENGINE_WIDGET_IDEAS_2026-09-20.md` | architecture | `reference` | `retain-or-consolidate` | 4247 | General documentation; verify current scope and merge target during its domain wave. |
| 18 | `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md` | architecture | `canonical` | `retain-current` | 38239 | Canonical Asset Engine product/architecture reference referenced by CLAUDE.md. |
| 19 | `docs/architecture/VIEWTUBE_AUTH_API_STABILIZATION_REFERENCE.md` | architecture | `review` | `audit-before-move` | 8890 | High-value troubleshooting/current-state reference; consolidate with Simple Auth and route truth. |
| 20 | `docs/architecture/VIEWTUBE_CROWN_DOMAIN_MISSION_PACK.md` | architecture | `reference` | `retain-or-consolidate` | 1962 | General documentation; verify current scope and merge target during its domain wave. |
| 21 | `docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md` | architecture | `reference` | `retain-or-consolidate` | 6108 | General documentation; verify current scope and merge target during its domain wave. |
| 22 | `docs/architecture/VIEWTUBE_CROWN_MAIN_AUDIT_2026-09-11.md` | architecture | `reference` | `retain-or-consolidate` | 3410 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 23 | `docs/architecture/VIEWTUBE_CROWN_PHASE2_ROYAL_EXCHANGE.md` | architecture | `reference` | `retain-or-consolidate` | 2617 | General documentation; verify current scope and merge target during its domain wave. |
| 24 | `docs/architecture/VIEWTUBE_CROWN_PHASE3_READ_ONLY_BRIDGE.md` | architecture | `reference` | `retain-or-consolidate` | 2234 | General documentation; verify current scope and merge target during its domain wave. |
| 25 | `docs/architecture/VIEWTUBE_CROWN_RUNTIME_CONTROL_ROOM_PLAN.md` | architecture | `active-plan` | `status-audit` | 1659 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 26 | `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md` | architecture | `canonical` | `retain-current` | 29531 | Living cross-system Project/ContentBuild workflow authority referenced by CLAUDE.md. |
| 27 | `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` | architecture | `review` | `audit-before-move` | 25194 | Master-resource label overlaps newer Studio component-library authority; reconcile before promotion. |
| 28 | `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md` | architecture | `active-plan` | `consolidate-after-status-audit` | 21251 | Active widget/dashboard optimization planning; verify merged portions before consolidation. |
| 29 | `docs/architecture/viewtube-crown-protocols.schema.json` | architecture | `reference` | `retain-or-consolidate` | 6147 | Supporting machine-readable/reference artifact; preserve unless an owning canonical registry replaces it. |
| 30 | `docs/architecture/WIDGET_FUTURES_RECOVERY_REGISTRY_2026-09-14.md` | architecture | `reference` | `retain-or-consolidate` | 6811 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 31 | `docs/architecture/WIDGET_SYSTEM_CERTIFICATION_MASTER_2026-09-14.md` | architecture | `reference` | `retain-or-consolidate` | 11478 | General documentation; verify current scope and merge target during its domain wave. |
| 32 | `docs/architecture/YOUTUBE_API_STABILIZATION_V1_TRACKER.md` | architecture | `active-plan` | `status-audit` | 5981 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 33 | `docs/architecture/YOUTUBE_AUTH_API_SIMPLIFICATION_PLAN.md` | architecture | `review` | `audit-before-move` | 8247 | Design direction differs from the currently deployed flat+compatibility route implementation; reconcile against code. |
| 34 | `docs/brain/AI_BRAIN_REACHABILITY_AUDIT_PASS1_2026-09-17.md` | brain | `reference` | `retain-or-consolidate` | 8018 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 35 | `docs/brain/AI_BRAIN_REACHABILITY_AUDIT_WORK_ORDER_2026-09-17.md` | brain | `active-plan` | `status-audit` | 2284 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 36 | `docs/brain/AI_CROSS_BRANCH_HARVEST_PASS1_2026-09-18.md` | brain | `reference` | `retain-or-consolidate` | 5711 | General documentation; verify current scope and merge target during its domain wave. |
| 37 | `docs/brain/AI_INTELLIGENCE_ENGINE_PHASE0_SYSTEM_MANIFEST_2026-09-17.md` | brain | `reference` | `retain-or-consolidate` | 5753 | General documentation; verify current scope and merge target during its domain wave. |
| 38 | `docs/brain/ASSET_ENGINE_CANONICAL_BACKBONE.md` | brain | `historical` | `archive-after-extraction` | 11199 | Foundational Asset Engine backbone retained as reference; expanded by the later Asset Engine master resource. |
| 39 | `docs/brain/BRAIN_RUNTIME_PHASE_1_MODEL_AND_ORCHESTRATION_INVENTORY_2026-09-11.md` | brain | `reference` | `retain-or-consolidate` | 7369 | General documentation; verify current scope and merge target during its domain wave. |
| 40 | `docs/brain/BRAIN_SHARED_CONVERSATION_CONTROLLER_PHASE_2_2026-09-12.md` | brain | `reference` | `retain-or-consolidate` | 3133 | General documentation; verify current scope and merge target during its domain wave. |
| 41 | `docs/brain/PHASE_1_CLOSEOUT_PHASE_2_START.md` | brain | `reference` | `retain-or-consolidate` | 3553 | General documentation; verify current scope and merge target during its domain wave. |
| 42 | `docs/brain/PHASE_4_LIVE_TOOL_INTEGRATION.md` | brain | `reference` | `retain-or-consolidate` | 2342 | General documentation; verify current scope and merge target during its domain wave. |
| 43 | `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md` | brain | `canonical` | `retain-current` | 5638 | Canonical consolidation contract for the unified AI system. |
| 44 | `docs/brain/UNIVERSAL_TOOL_HANDOFFS_AND_SUGGESTED_CHAINS.md` | brain | `reference` | `retain-or-consolidate` | 5570 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 45 | `docs/community/COMMUNITY_BULK_CAMPAIGN_IMPLEMENTATION.md` | community | `reference` | `retain-or-consolidate` | 3384 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 46 | `docs/DATA_VISUAL_MODULE_UNIFICATION_STATUS.md` | analytics | `evidence` | `keep-as-evidence` | 236 | Verification/status snapshot; useful evidence but not architectural authority. |
| 47 | `docs/DATA_VISUAL_MODULE_UNIFICATION.md` | analytics | `reference` | `retain-or-consolidate` | 2359 | General documentation; verify current scope and merge target during its domain wave. |
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
| 68 | `docs/herald/CONVERSATION-LOG.md` | brain/herald | `reference` | `retain-or-consolidate` | 1259 | General documentation; verify current scope and merge target during its domain wave. |
| 69 | `docs/MASTER_DATA_OVERLAY_PORTAL_PLAN_2026-09-14.md` | analytics | `active-plan` | `status-audit` | 1671 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 70 | `docs/migration/data-visual-canvas-contract.md` | migration | `reference` | `retain-or-consolidate` | 5358 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 71 | `docs/migration/data-visual-controller-unification-plan.md` | migration | `active-plan` | `consolidate-after-status-audit` | 14091 | Explicitly marked in progress in the current document. |
| 72 | `docs/migration/data-visual-mobile-mark-scale-plan.md` | migration | `active-plan` | `status-audit` | 21420 | Plan/work-order/tracker requires completion check before consolidation or archive. |
| 73 | `docs/migration/pending-features-inventory.md` | migration | `reference` | `retain-or-consolidate` | 9975 | General documentation; verify current scope and merge target during its domain wave. |
| 74 | `docs/migration/README.md` | migration | `canonical` | `retain-current` | 14314 | Analytics/auth migration north star; explicitly declares itself the migration source of truth. |
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
| 97 | `docs/MOBILE_ANALYTICS_CONTROLLER_CORRECTION_2026-09-14.md` | analytics | `reference` | `retain-or-consolidate` | 1581 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 98 | `docs/MOBILE_ANALYTICS_CONTROLLER_TEST_MATRIX_2026-09-14.md` | analytics | `evidence` | `keep-as-evidence` | 1017 | Verification/status snapshot; useful evidence but not architectural authority. |
| 99 | `docs/MOBILE_VISUAL_PHASE2_CHANGELOG.md` | ui | `evidence` | `keep-as-evidence` | 715 | Verification/status snapshot; useful evidence but not architectural authority. |
| 100 | `docs/MOBILE_VISUAL_QA_MATRIX.md` | ui | `evidence` | `keep-as-evidence` | 1435 | Verification/status snapshot; useful evidence but not architectural authority. |
| 101 | `docs/MOBILE_VISUAL_RESPONSIVE_CONTRACT.md` | ui | `reference` | `retain-or-consolidate` | 2596 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 102 | `docs/PRIMITIVE_FIX_PREVIEW_TRIGGER.md` | ui | `retirement-candidate` | `verify-before-delete` | 104 | No-runtime-impact preview/deployment marker; verify no references, then delete in cleanup wave. |
| 103 | `docs/production-deployment-trigger.md` | deployment | `retirement-candidate` | `verify-before-delete` | 252 | No-runtime-impact deployment marker; verify no references, then delete in cleanup wave. |
| 104 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_CHANGELOG_2026-09-17.md` | ui | `evidence` | `keep-as-evidence` | 614 | Verification/status snapshot; useful evidence but not architectural authority. |
| 105 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_COMPONENT_INDEX.md` | ui | `reference` | `retain-or-consolidate` | 1222 | General documentation; verify current scope and merge target during its domain wave. |
| 106 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_HERALD_FIX_2026-09-17.md` | ui | `reference` | `retain-or-consolidate` | 1434 | General documentation; verify current scope and merge target during its domain wave. |
| 107 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_HERALD_STATUS.md` | ui | `evidence` | `keep-as-evidence` | 612 | Verification/status snapshot; useful evidence but not architectural authority. |
| 108 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_MOBILE_NOTES.md` | ui | `reference` | `retain-or-consolidate` | 899 | General documentation; verify current scope and merge target during its domain wave. |
| 109 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_SOURCE_OF_TRUTH.md` | ui | `canonical` | `retain-current` | 6872 | Current Studio Hub component-library presentation and primitive-correction authority. |
| 110 | `docs/ui/STUDIO_HUB_COMPONENT_LIBRARY_VISUAL_CHECKLIST.md` | ui | `reference` | `retain-or-consolidate` | 1058 | General documentation; verify current scope and merge target during its domain wave. |
| 111 | `docs/ui/toolbox-system/audits/MASTER_RESOURCE_50_IMPROVEMENTS_2026-09-13.md` | ui | `reference` | `retain-or-consolidate` | 4954 | General documentation; verify current scope and merge target during its domain wave. |
| 112 | `docs/ui/toolbox-system/MANIFEST.md` | ui | `reference` | `retain-or-consolidate` | 4017 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 113 | `docs/ui/toolbox-system/README.md` | ui | `reference` | `retain-or-consolidate` | 5392 | Durable reference/contract material; verify scope and ownership during domain consolidation. |
| 114 | `docs/user-guide-v2/PHASE_1_2_AUDIT_AND_TRUTH_REGISTRY.md` | user-guide-v2 | `review` | `audit-before-move` | 6543 | Guide truth model is valuable but its baseline predates later September changes; refresh before authority promotion. |
| 115 | `docs/VIEWTUBE_AI_BRAIN_SYSTEMS_AUDIT_AND_MODERNIZATION_REFERENCE_2026-09-11.md` | brain | `reference` | `retain-or-consolidate` | 39897 | Implementation/audit/reference material; reconcile unique content into the owning authority when appropriate. |
| 116 | `docs/VIEWTUBE_AI_CREATOR_INTELLIGENCE_OS_IMPLEMENTATION_PLAN_2026-09-11.md` | brain | `active-plan` | `consolidate-after-status-audit` | 23217 | AI implementation plan; reconcile shipped vs remaining work against the current unified AI contract. |
| 117 | `docs/VIEWTUBE_HERALD_CROSS_APP_AI_CONVERSATION_SYSTEM_PLAN_2026-09-15.md` | brain | `active-plan` | `consolidate-after-status-audit` | 61545 | Cross-app AI conversation plan; reconcile against current Brain/Herald runtime before closure. |
| 118 | `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` | governance | `review` | `audit-before-move` | 25225 | Broad unfinished-work inventory can conflict with newer domain-specific state; verify item-by-item. |
| 119 | `docs/vt-e1-render-worker.md` | editor | `reference` | `retain-or-consolidate` | 1417 | General documentation; verify current scope and merge target during its domain wave. |

## Wave 1 control documents

These files are created by Wave 1 and therefore are **not** part of the 119-file baseline count:

- `docs/README.md` — documentation entrypoint and authority map.
- `docs/DOCUMENTATION_GOVERNANCE.md` — lifecycle, authority, supersession, placement, and deletion-safety contract.
- `docs/DOCUMENTATION_REGISTRY.md` — this baseline registry.

## Next action

Wave 2 should begin with the Projects / ContentBuild / Asset Engine family because `CLAUDE.md` already names its two living master resources. Reconcile unique content from implementation/consolidation/backbone documents into those authorities, mark supersession explicitly, update this registry, and only then move historical material.
