# ViewTube Master Ideas

**Generated from:** `ideas/registry.json`  
**Role:** reviewed consolidated master-idea projection; source lists and merged aliases remain provenance.  
**Master ideas:** 190 · **Source items:** 254 · **Merged aliases:** 38

## Agent Context & Workflows

### Context

- **Agent Context Builder** — Assemble the smallest correct task context package on demand.  
  Target: `WORKFLOW:AGENT-CONTEXT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Context Retrieval

- **Just-in-Time Documentation Retrieval** — Retrieve only relevant authority sections and references for the task.  
  Target: `WORKFLOW:AGENT-CONTEXT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Skill Routing

- **Skill-to-Workflow Mapping** — Map workflows to the skills used at each stage.  
  Target: `GOVERNANCE:WORKFLOWS` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Workflows

- **Reusable Workflow Registry** — Make repeatable development workflows first-class governed objects.  
  Target: `GOVERNANCE:WORKFLOWS` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DISTINCT: IDEA-WFI-004 — Workflow recipe registry
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Application Convergence & Completion

### ARCHIVE / REMOVE

- **Legacy Global Documentation Removal Wave** — Move superseded global authorities into archive/removed only after donor harvest, inbound-link audit, hashes and successor mapping.  
  Target: `SYSTEM:LEGACY-GLOBAL-DOCUMENTATION-REMOVAL-WAVE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### AUDIT

- **Production Caller & Reachability Census** — Finish production-caller inventory for overlapping context/evidence/AI/asset/operation subsystems before deletion or consolidation.  
  Target: `SYSTEM:PRODUCTION-CALLER-REACHABILITY-CENSUS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Prompt Production Reachability, Recipes & Evaluation** — Complete the production prompt system by inventorying reachable prompt callers, assigning canonical family/version/schema/context recipes, preserving prompt/model provenance, and testing rich/sparse/stale/conflicting cases against regression thresholds.  
  Target: `SYSTEM:PROMPT-PRODUCTION-REACHABILITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-APP-028 (Prompt Families + Context Recipes); IDEA-APP-029 (Prompt Evaluation Program)
  Retained requirements:
  - Inventory every prompt constant, alias and caller and classify live, compatibility-only and dead paths. [IDEA-SRC-APP-027]
  - Give reachable prompts canonical family/version/schema/context recipes and propagate prompt/model provenance. [IDEA-SRC-APP-028]
  - Build rich/sparse/empty/stale/disabled/conflicting fixtures, quality baselines, validators and regression thresholds. [IDEA-SRC-APP-029]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### AUDIT / OPTIMIZE

- **Algorithm Intelligence Ledger Cleanup** — Audit helper/ledger sprawl after metric-comparability work and consolidate redundant evaluation paths.  
  Target: `SYSTEM:ALGORITHM-INTELLIGENCE-LEDGER-CLEANUP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### AUDIT / STABILIZE

- **Auth + Diagnostics Reliability** — Certify sign-in/session restoration, API routes, account proxy, mobile failures and always-accessible diagnostics.  
  Target: `SYSTEM:AUTH-DIAGNOSTICS-RELIABILITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### AUDIT / UPDATE

- **Analytics Coverage & Provenance** — Reconcile dataset/window ownership, traffic details, geography, retention, CSV augmentation, missingness and provenance.  
  Target: `SYSTEM:ANALYTICS-COVERAGE-PROVENANCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### CERTIFY

- **Cross-Surface Identity & Evidence Continuity** — Certify that Project, ContentBuild, video, package, asset/version and evidence identities survive Dashboard, Studio, Vault, Editor, Publisher, Brain and supported handoffs without reconstruction from labels or URLs.  
  Target: `SYSTEM:CROSS-SURFACE-HANDOFF-IDENTITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-APP-016 (Evidence-ID Continuity); IDEA-WFI-010 (Project/asset identity continuity certification)
  Retained requirements:
  - Prove evidence IDs survive analytics → specialists → Brain → UI → outcomes. [IDEA-SRC-APP-016]
  - Test Project/ContentBuild/video/asset/evidence continuity through Dashboard, Studio, Vault, Editor, Publisher and Brain. [IDEA-SRC-APP-039]
  - ActionPacket already carries Project/ContentBuild/video/evidence fields and persists scoped events; prove package/asset/version identity through real destination consumers. [IDEA-SRC-WFI-010]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Widget Production Cohort & State Certification** — Define a supported production widget cohort and certify desktop/narrow/mobile portrait/mobile landscape, loading, empty, disconnected, stale, error, focus, keyboard and touch states using a universal truthful preview/empty-state contract.  
  Target: `SYSTEM:10-WIDGET-PRODUCTION-COHORT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-APP-044 (Universal Widget Empty/Preview Contract); IDEA-WFI-012 (Responsive/accessibility certification)
  Retained requirements:
  - Select and certify the supported cohort across responsive sizes, states and interactions. [IDEA-SRC-APP-043]
  - Give every widget intentional loading/empty/disconnected/sample presentation without fake live data. [IDEA-SRC-APP-044]
  - Compact widget and full Toolbox pairs pass desktop/narrow/mobile portrait/mobile landscape and relevant state matrices. [IDEA-SRC-WFI-012]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

### CERTIFY / CLEAN

- **Settings Final Visual & Accessibility Closeout** — Finish responsive, keyboard/focus/destructive/error certification and remove legacy visual authority after parity.  
  Target: `SYSTEM:SETTINGS-FINAL-VISUAL-ACCESSIBILITY-CLOSEOUT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### CREATE

- **Generated Human Documentation Registry** — Generate the readable documentation registry from docs/registry.json instead of hand-maintaining parallel registry truth.  
  Target: `SYSTEM:GENERATED-HUMAN-DOCUMENTATION-REGISTRY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **One-Write-Owner Matrix** — Define exact mutable ownership for Project, ContentBuild, VideoPackage and PublishingPackage fields.  
  Target: `SYSTEM:ONE-WRITE-OWNER-MATRIX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Outcome & Evaluation Closure Framework** — Close consequential actions into canonical outcomes by standardizing producer identity, coverage, expected outcome/evaluation targets, checkpoints, comparable metric context, exact used variants/approved snapshots and publish-to-analytics binding.  
  Target: `SYSTEM:OUTCOME-PRODUCER-IDENTITY-CONTRACT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 8
  Consolidates: IDEA-APP-023 (Outcome Coverage Matrix); IDEA-APP-024 (Evaluation-Target Coverage); IDEA-APP-038 (Publish → Analytics → Outcome Loop); IDEA-WFI-011 (Outcome/evaluation closure)
  Retained requirements:
  - Standardize producer ID, source operation, project/video identity, timestamp, evidence and idempotency semantics. [IDEA-SRC-APP-022]
  - Map Publisher, Projects, Editor, Community, experiments, packaging, Brain and asset generators to canonical outcomes. [IDEA-SRC-APP-023]
  - Verify consequential actions declare measurable evaluation targets/checkpoints using canonical comparability semantics. [IDEA-SRC-APP-024]
  - Preserve ContentBuild/video/package identity after publish and connect measured performance to exact approved assets/variants. [IDEA-SRC-APP-038]
  - Consequential recipes declare outcome target/checkpoint and bind later measurements. [IDEA-SRC-WFI-011]
  - preserve which generated candidate became the actual published asset. [IDEA-SRC-VAE-018]
  - display which metrics/windows are scheduled to evaluate the package after publication. [IDEA-SRC-VAE-019]
  - after publication, connect evaluated results back to the exact assets so successful package choices become reusable evidence. [IDEA-SRC-VAE-025]
  Linked ideas:
  - COMPLEMENTARY: IDEA-SPA-014 — Channel Change Journal and Outcome Map
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Unified Backlog Source Manifest** — Hash and classify every audit, plan, handoff, conversation backlog, donor branch and task source before more planning is created.  
  Target: `SYSTEM:UNIFIED-BACKLOG-SOURCE-MANIFEST` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Universal OperationRecord & Receipt Convergence** — Converge ActionPacket, ToolReceipt, GenerationRecord, BrainTrace, render/research/generation/transform and external-execution receipts around one stable operation identity while keeping specialized projections and existing stores.  
  Target: `SYSTEM:OPERATIONRECORD-V1` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-APP-021 (ActionPacket / ToolReceipt / GenerationRecord Convergence); IDEA-WFI-003 (Universal operation envelope)
  Retained requirements:
  - Converge reasoning, research, generation, transform, render, handoff and external execution around shared operation identity. [IDEA-SRC-APP-020]
  - Keep specialist projections while stopping overlapping histories from becoming separate truth stores. [IDEA-SRC-APP-021]
  - ActionPacket already fans into GenerationRecord, Vault and ContentBuild events; converge these IDs/receipts/BrainTrace/render-generation records toward shared operation identity. [IDEA-SRC-WFI-003]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

### CREATE / FINISH

- **Public Agent Readiness** — Add llms.txt strategy, sitemap, canonical/meta/OG/JSON-LD, public text/Markdown surfaces and rescan readiness.  
  Target: `SYSTEM:PUBLIC-AGENT-READINESS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### FINISH

- **Editor Completion Program** — Complete desktop/mobile parity, four-layout certification, typed Brain proposals, generation queue, Video Director integration and final-render assets.  
  Target: `SYSTEM:EDITOR-COMPLETION-PROGRAM` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Publishing Durability & Recovery** — Move remaining publishing authority toward durable persistence, remote reconciliation, retry/recovery and crash-safe idempotency.  
  Target: `SYSTEM:PUBLISHING-DURABILITY-RECOVERY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Vault Creator Workspace Completion** — Complete Vault as a dense media-first creator workspace with intelligent intake, contextual controls, canonical Project/ContentBuild projections, Editor media-operation contracts, rights/provenance and derivative-vs-overwrite rules.  
  Target: `SYSTEM:VAULT-INTAKE-INTELLIGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 4
  Consolidates: IDEA-APP-034 (Vault Dense Creator UX); IDEA-APP-035 (Vault ↔ Projects Creator Lane); IDEA-APP-036 (Vault ↔ Editor Media Operations)
  Retained requirements:
  - Complete suggested tags/vision, arbitrary local-media transcript support and proxy derivative generation. [IDEA-SRC-APP-033]
  - Replace persistent workspace/navigator/operations chrome with contextual toolbar, selection bar, drawers/popovers and media-first cards. [IDEA-SRC-APP-034]
  - Complete project stage/priority/due date/promise/storyboard/title/checklist/script/asset/stat projections. [IDEA-SRC-APP-035]
  - Audit VT_E1 then define derivative-vs-overwrite, protected-asset rules and verified transform gaps. [IDEA-SRC-APP-036]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### FINISH / RESTRUCTURE

- **VT-SYNC Controller + Progress** — Complete combined status/controller accuracy, batch selection, windows, queue/finish states and trustworthy counts.  
  Target: `SYSTEM:VT-SYNC-CONTROLLER-PROGRESS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### MERGE

- **Handoff Document Family Consolidation** — Consolidate Toolbox, Resource Library, Editor, Vault and Brain handoff families into living authorities plus governed handoff records.  
  Target: `SYSTEM:HANDOFF-DOCUMENT-FAMILY-CONSOLIDATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Historical Backlog & Program Reconciliation** — Losslessly reconcile the 100-item audit, older unfinished-work master, Finish Program and system-convergence donors into current authorities/tasks, then demote or archive predecessor sources only after harvested requirements are accounted for.  
  Target: `SYSTEM:100-ITEM-AUDIT-RECONCILIATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 4
  Consolidates: IDEA-APP-005 (2026-09-11 Unfinished Work Reconciliation); IDEA-APP-006 (Finish Program Migration); IDEA-APP-007 (System Convergence Donor Harvest)
  Retained requirements:
  - Harvest still-valid requirements from the 100-item audit into current authorities and demote the audit to evidence. [IDEA-SRC-APP-004]
  - Harvest remaining valid requirements from the older unfinished-work master and retire its parallel backlog role. [IDEA-SRC-APP-005]
  - Reconcile surviving Finish Program items into Integrated Application/Task Authority and archive the predecessor. [IDEA-SRC-APP-006]
  - Harvest unique convergence rules into Product Architecture, Integrated Application and scoped specifications. [IDEA-SRC-APP-007]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### MERGE / ARCHIVE

- **Brain + Prompt Phase-D Documentation Cleanup** — Retire superseded AI/prompt phase documents after no-loss harvest into current Brain/Prompt authorities.  
  Target: `SYSTEM:BRAIN-PROMPT-PHASE-D-DOCUMENTATION-CLEANUP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### MERGE / CERTIFY

- **Asset Engine + Vault Identity & Lineage Contract** — Unify shared asset identity and version/variant/derivative lineage across Project, Vault, Editor, Publisher and generation.  
  Target: `SYSTEM:ASSET-ENGINE-VAULT-IDENTITY-LINEAGE-CONTRACT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 4
  Retained requirements:
  - Unify shared asset identity and version/variant/derivative lineage across Project, Vault, Editor, Publisher and generation. [IDEA-SRC-APP-019]
  - show source tool, project, generation record, evidence IDs, and creator edits for the active asset. [IDEA-SRC-VAE-006]
  - visualize parent → child asset ancestry so derivative work never loses source identity. [IDEA-SRC-VAE-007]
  - distinguish manual, generated, evidence-backed and unverified assets without inventing confidence. [IDEA-SRC-VAE-016]
  Linked ideas:
  - DEPENDENCY: IDEA-TWB-010 — Asset Engine Toolbox
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### MERGE / RESTRUCTURE

- **Dashboard Domain Workbench Consolidation** — Consolidate overlapping widget families into fewer domain workbenches—Metadata/SEO, Retention, Keyword/Opportunity, Calendar, Audience, Discovery/Distribution and Monetization—while keeping compact Dashboard instruments.  
  Target: `SYSTEM:DASHBOARD-WORKBENCH-CONSOLIDATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-WFI-009 (Domain-workbench consolidation)
  Retained requirements:
  - Consolidate overlapping widgets into domain workbenches instead of continuing widget multiplication. [IDEA-SRC-APP-042]
  - Metadata/SEO, Retention, Keyword, Calendar, Audience, Discovery and Monetization. [IDEA-SRC-WFI-009]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

### MERGE / RETIRE

- **Crown + Herald + Conversation Predecessor Cleanup** — Harvest superseded coordination contracts and retire duplicate predecessor documents.  
  Target: `SYSTEM:CROWN-HERALD-CONVERSATION-PREDECESSOR-CLEANUP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### OPTIMIZE

- **Governed Learning & Preference Promotion** — Govern learning and creator preference updates through explicit enabled controls, evidence/outcome evaluation, reinforce/hold/reject/supersede states, contradiction handling, freshness/decay review and no direct model writes to durable knowledge.  
  Target: `SYSTEM:GOVERNED-LEARNING-PROMOTION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-WFI-007 (Creator preference learning)
  Retained requirements:
  - Complete reinforce/hold/reject/supersede, contradiction handling, decay/review and no-direct-model-write guarantees. [IDEA-SRC-APP-025]
  - Accepted/rejected suggestion signals are already creator-learning gated; remaining work is governed outcome/evaluation integration, freshness/decay policy if required, and certification. [IDEA-SRC-WFI-007]
  Linked ideas:
  - DEPENDENCY: IDEA-WF-031 — Packaging Learning Loop
  - DEPENDENCY: IDEA-WF-032 — Hook Learning Loop
  - DEPENDENCY: IDEA-WF-040 — Full Creator Improvement Loop
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

### OPTIMIZE / REMOVE

- **Toolbox CSS & Primitive Ownership Finalization** — Finish canonical geometry ownership and remove feature-local overrides only after parity and screenshots.  
  Target: `SYSTEM:TOOLBOX-CSS-PRIMITIVE-OWNERSHIP-FINALIZATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### RESEARCH / PLAN

- **Project-Grounded RAG** — Add project-grounded retrieval behind the canonical Context Resolver without a second memory store.  
  Target: `SYSTEM:PROJECT-GROUNDED-RAG` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### RESEARCH + BUILD

- **Media Provider Gateway & Legacy Provider Migration** — Route image/video media generation through one governed provider gateway with provenance, queue/cancel/retry and Asset Engine/Vault outputs, while harvesting and retiring direct legacy provider callers after parity and zero reachability.  
  Target: `SYSTEM:MEDIA-PROVIDER-GATEWAY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-APP-032 (Legacy Direct Provider Cleanup)
  Retained requirements:
  - Route Veo/image/video generation through governed generation, Asset Engine/Vault, provenance, queue, cancel and retry contracts. [IDEA-SRC-APP-031]
  - Inventory direct provider callers, harvest useful prompts/schemas/tests/error handling, migrate, then quarantine after zero reachability. [IDEA-SRC-APP-032]
  Linked ideas:
  - DEPENDENCY: IDEA-GAI-001 — Flow / Veo Scene Director inside Video Director
  - DEPENDENCY: IDEA-GAI-002 — Nano Banana Thumbnail and Key-Art Lab
  - DEPENDENCY: IDEA-GAI-003 — Multimodal Remix & Adaptation Factory
  - DEPENDENCY: IDEA-GAI-006 — Flow Music / Lyria Soundtrack Studio
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### RESEARCH + IMPLEMENT

- **Task Index VNext Authority** — Resolve canonical Task Index writer/storage, aliases, projections and freshness checks.  
  Target: `SYSTEM:TASK-INDEX-VNEXT-AUTHORITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### RESTRUCTURE

- **Brain Hub Product Toolbox** — A full Brain Hub Toolbox organized around chat/context, systems, runs, prompts, plans, evidence/traces, knowledge/learning, audit and health, with compact Dashboard ask/resume/status/evidence-health entry points.  
  Target: `SYSTEM:BRAIN-HUB-PRODUCT-UI` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-007 (Brain Hub Toolbox)
  Retained requirements:
  - Promote or consolidate Brain Hub into Brain Hub Toolbox; Dashboard role: ask/resume/status/evidence health. [IDEA-SRC-TWB-007]
  - Organize Brain Hub into Overview, Systems, Agents & Runs, Prompts, Plans, Evidence & Traces, Knowledge & Learning, Audit and Health. [IDEA-SRC-APP-026]
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

### UPDATE

- **Creator Context Final Migration** — Move remaining Sidebar/Brain Hub context assembly through CreatorContextResolver and complete no-project/ContentBuild fixtures.  
  Target: `SYSTEM:CREATOR-CONTEXT-FINAL-MIGRATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### UPDATE / CLOSE

- **Settings Workspace Completion Receipt** — Close stale Settings plan/todo projections with a no-loss completion receipt and current evidence.  
  Target: `SYSTEM:SETTINGS-WORKSPACE-COMPLETION-RECEIPT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

## Capability & Plan Convergence

### Build Gate

- **Unified Before Building Gate** — Before implementation begins, resolve capability owner, prior art, current code, existing tasks, active PRs and related prototypes.  
  Target: `WORKFLOW:BEFORE-BUILD` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Capability Routing

- **Capability Home Pages** — Give every major capability one permanent routing home across tools/pages.  
  Target: `CAPABILITY:CAP-DOCUMENT-GOVERNANCE` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Code / Document Links

- **Bidirectional Code ↔ Document Links** — Documents point to code owners, and important code modules link back to their governing capability/specification.  
  Target: `GOVERNANCE:CODE-DOC-LINKS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Code Ownership

- **Code Ownership Map** — Map capabilities to source paths, tests, routes/services and confidence.  
  Target: `GOVERNANCE:CODE-OWNERSHIP` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Ideas

- **Feature Idea Registry** — Keep ideas separate from committed tasks while preserving provenance.  
  Target: `GOVERNANCE:IDEAS` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

- **Idea-to-Capability Routing** — Route each idea to an existing capability before considering a new one.  
  Target: `GOVERNANCE:IDEAS` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Identifiers

- **Capability IDs Everywhere** — Attach durable work records to CAP IDs for automatic clustering.  
  Target: `GOVERNANCE:CAPABILITY-ROUTING` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Impact Analysis

- **Change Impact Graph** — Given a changed file, identify affected capabilities, plans, tasks, docs, tests, UI surfaces and integrations.  
  Target: `GOVERNANCE:CHANGE-IMPACT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Plan Families

- **Plan Families** — Group related plans under stable family IDs with one survivor.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DISTINCT: IDEA-GOV-022 — Debugging Family Records
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Plan Merges

- **Plan Merge Records** — Record source plans, survivor and harvested material for every merge.  
  Target: `GOVERNANCE:PLAN-MERGES` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Prior Art

- **Mandatory Existing Work Checked Section** — Require prior-art search before new plans/systems are created.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Similarity Detection

- **Automatic Similar-Plan Detection** — Detect likely overlapping plans before creating another one.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Work Handoffs

- **Universal Work Packet** — Standardize agent/conversation/plan-to-code handoff payloads.  
  Target: `WORKFLOW:VT-WORK-PACKET` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Continuous Improvement

### Control Room

- **Unified Development Control Room** — Generate one projection of capabilities/plans/tasks/missions/risks/evidence/ideas/questions/verification debt.  
  Target: `GOVERNANCE:CONTROL-ROOM` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 2
  Retained requirements:
  - Generate one projection of capabilities/plans/tasks/missions/risks/evidence/ideas/questions/verification debt. [IDEA-SRC-GOV-049]
  - Add deterministic schema validation, unreconciled-package reporting and a generated review/dashboard surface for governed conversation intake. [IDEA-SRC-CONV-001]
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Convergence Rule

- **Convergence-First Governance Rule** — Require reuse/merge/generalize/adapt attempts before new parallel systems.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Recommendations

- **Improvement Recommendation Log** — Persist deduped architecture/performance/UX/AI/tooling recommendations before task promotion.  
  Target: `GOVERNANCE:IMPROVEMENTS` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Conversation & Intake

### Backlinks

- **Task-to-Plan Backlinks** — Every task should know which plan/program/specification created or justifies it.  
  Target: `GOVERNANCE:TASK-AUTHORITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Conversation Harvest

- **Conversation Work Harvester** — At the end of substantial conversations, extract completed work, incomplete work, decisions, bugs, opportunities, rejected directions and ideas into governed intake.  
  Target: `WORKFLOW:CONVERSATION-INTAKE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Intake

- **Convergence Inbox** — Route new ideas from conversations, audits, research, bugs, prototypes and agents into one review queue instead of immediately creating documents/tasks.  
  Target: `GOVERNANCE:CONVERGENCE-INBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Similarity

- **Cross-Conversation Similarity Review** — Compare new conversation work against prior conversation-intake packages to detect duplicate plans/tasks.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Task Promotion

- **Plan-to-Task Compiler** — Convert accepted plan sections into Task Authority mutation proposals while preserving plan/capability/acceptance/dependency links.  
  Target: `WORKFLOW:TASK-AUTHORITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Creator Reference Library

### Creator Education

- **Audience Retention and Watch Behavior Guide** — Explain retention curves, intros, dips, spikes, average percentage viewed, duration effects, chapter/segment analysis, Shorts looping behavior and how not to overreact to small samples.  
  Target: `FEATURE:LIB-6` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Audience, Subscribers and Returning Viewers** — Explain subscriber gains/losses, new vs returning viewers, viewer loyalty, audience overlap, cohort thinking, why subscriber count is not the same as active audience, and how to interpret subscriber conversion without chasing vanity metrics.  
  Target: `FEATURE:LIB-8` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Comments, Community and Audience Feedback Playbook** — Cover moderation, response prioritization, recurring-question mining, suggested-video replies, handling criticism, identifying content opportunities and separating anecdotal comments from statistically meaningful audience evidence.  
  Target: `FEATURE:LIB-12` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Content Planning, Experiments and Learning Loops** — Teach creators how to move from idea → hypothesis → package → publish → measurement → outcome → learning, including test design, avoiding simultaneous uncontrolled changes and recording what actually changed.  
  Target: `FEATURE:LIB-13` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Copyright, Rights, Reuse and AI-Generated Media Reference** — A creator-oriented reference for music, footage, images, remixes, licensing, claims/strikes, attribution, AI-generated assets, provenance and when to seek official/legal guidance rather than relying on assumptions.  
  Target: `FEATURE:LIB-14` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **How YouTube Recommendations and Discovery Work** — A plain-language but evidence-grounded guide to Home/Browse, Suggested/Related, Search, Shorts Feed, subscriptions, notifications and other discovery surfaces—and what creators can and cannot infer about “the algorithm.”  
  Target: `FEATURE:LIB-1` · Status: `PROMOTED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Live Streaming Operations Handbook** — Cover scheduling, stream setup, encoder/health checks, chat moderation, DVR/latency choices, live analytics, monetization considerations, failure recovery and how to repurpose the archive afterward.  
  Target: `FEATURE:LIB-10` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Playlist, Series and Channel Architecture Guide** — Explain playlists as viewer journeys, series structure, channel homepage sections, sequencing, evergreen versus campaign playlists, internal routing and how playlists differ from simple folders.  
  Target: `FEATURE:LIB-11` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Publishing Best Practices and Preflight Checklist** — A step-by-step reference covering metadata, title, description, tags where useful, thumbnail, captions, audience settings, visibility, schedule, playlists, chapters, end screens/cards where applicable, rights checks, quality control and post-publish verification.  
  Target: `FEATURE:LIB-4` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Reading Analytics Correctly: Scope, Windows, Missingness and Statistical Traps** — Explain time-window mismatches, lifecycle windows, percentages versus counts, sparse data, delayed metrics, geography/sample limitations, invalid cross-format comparisons, correlation versus causation and why “up” or “down” does not automatically explain why.  
  Target: `FEATURE:LIB-15` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Shorts vs Long-Form: Different Systems, Different Signals** — Explain format differences in viewer behavior, distribution, retention interpretation, packaging, session behavior, monetization, cadence, creative structure and the danger of comparing unlike metrics directly.  
  Target: `FEATURE:LIB-3` · Status: `PROMOTED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Thumbnail and Title Packaging Handbook** — A practical guide to promise, clarity, curiosity, subject hierarchy, text restraint, contrast, mobile readability, title-thumbnail complementarity, variant testing and diagnosing high-retention/low-CTR versus high-CTR/low-satisfaction patterns.  
  Target: `FEATURE:LIB-5` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Traffic Sources and Discovery Pathways** — Explain Browse, Suggested/Related, Search, External, Channel pages, Shorts Feed, playlists, notifications, end screens, hashtags, sound pages, remixes and other traffic sources, including how the same video can behave differently across them.  
  Target: `FEATURE:LIB-7` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **YouTube Metrics and Dimensions Master Glossary** — Definitions for views, engaged views, watch time, average view duration, average percentage viewed, impressions, CTR, unique viewers, subscribers gained/lost, revenue, RPM/CPM-style measures, traffic dimensions, geography, device, content type and other analytics fields.  
  Target: `FEATURE:LIB-2` · Status: `PROMOTED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **YouTube Revenue and Monetization Fundamentals** — Explain estimated revenue, ad revenue, Premium revenue, monetized playbacks, CPM/RPM concepts, memberships, fan funding, shopping/commerce considerations and why revenue reports can change after initial estimates.  
  Target: `FEATURE:LIB-9` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

## Creator Workflow Chains

### Workflow Recipes

- **72-Hour Launch Review** — Review early performance without panic edits.  
  Target: `WORKFLOW:72-HOUR-LAUNCH-REVIEW` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Accessibility Completion** — Catch accessibility defects before release.  
  Target: `WORKFLOW:ACCESSIBILITY-COMPLETION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Algorithm Explanation to Action** — Convert creator education into one testable action.  
  Target: `WORKFLOW:ALGORITHM-EXPLANATION-TO-ACTION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Asset Rights Preflight** — Prevent packages from publishing with unknown or insufficient asset rights.  
  Target: `WORKFLOW:ASSET-RIGHTS-PREFLIGHT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Audience Segment Video** — Design content for a meaningful under-served segment.  
  Target: `WORKFLOW:AUDIENCE-SEGMENT-VIDEO` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Calendar Gap Filler** — Fill an open publishing slot with the most appropriate ready work.  
  Target: `WORKFLOW:CALENDAR-GAP-FILLER` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-YT-010 — Publishing Calendar & YouTube State Sync
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Channel Session Builder** — Build coherent video-to-video viewing routes.  
  Target: `WORKFLOW:CHANNEL-SESSION-BUILDER` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Channel Strategy Sprint** — Turn current channel evidence into a bounded multi-video production slate.  
  Target: `WORKFLOW:CHANNEL-STRATEGY-SPRINT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Comment Response Campaign** — Process a large comment queue while preserving creator review and extracting useful audience signals.  
  Target: `WORKFLOW:COMMENT-RESPONSE-CAMPAIGN` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-YT-004 — Comment & Community Operations Toolbox
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Comment to Community Campaign** — Test audience interest before committing to a larger production.  
  Target: `WORKFLOW:COMMENT-TO-COMMUNITY-CAMPAIGN` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-YT-004 — Comment & Community Operations Toolbox
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Comment to New Video** — Convert repeated audience demand into a planned content opportunity.  
  Target: `WORKFLOW:COMMENT-TO-NEW-VIDEO` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-SPA-013 — Comment-to-Content Opportunity Miner
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Content Series Builder** — Plan a multi-video series with a recognizable but non-repetitive system.  
  Target: `WORKFLOW:CONTENT-SERIES-BUILDER` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-SPA-012 — Series and Playlist Architect
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Editor Missing-Shot Recovery** — Fill a concrete timeline gap without losing project continuity.  
  Target: `WORKFLOW:EDITOR-MISSING-SHOT-RECOVERY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **End-Screen Optimization** — Improve the next-view path based on audience intent.  
  Target: `WORKFLOW:END-SCREEN-OPTIMIZATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Retained requirements:
  - Improve the next-view path based on audience intent. [IDEA-SRC-WF-021]
  - end screen, cards, related video, playlist and destination asset status in one navigation-oriented section. [IDEA-SRC-VAE-014]
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Evergreen Revival** — Refresh and redistribute an older asset when current evidence justifies it.  
  Target: `WORKFLOW:EVERGREEN-REVIVAL` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Experiment Design Workflow** — Create the smallest experiment that can answer a creator question.  
  Target: `WORKFLOW:EXPERIMENT-DESIGN-WORKFLOW` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-SPA-007 — Content Experiment Manager
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Full Creator Improvement Loop** — Close the loop from recommendation to creation to measurement to governed learning.  
  Target: `WORKFLOW:FULL-CREATOR-IMPROVEMENT-LOOP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-APP-025 — Governed Learning & Preference Promotion
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **High Performer to Sequel** — Reuse a proven audience promise without cloning surface details.  
  Target: `WORKFLOW:HIGH-PERFORMER-TO-SEQUEL` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Hook Learning Loop** — Learn from exact hooks rather than vague video-level success.  
  Target: `WORKFLOW:HOOK-LEARNING-LOOP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-APP-025 — Governed Learning & Preference Promotion
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Idea to Published Longform** — Move one evidence-backed opportunity through a complete long-form creator lifecycle.  
  Target: `WORKFLOW:IDEA-TO-PUBLISHED-LONGFORM` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Idea to Published Short** — Convert a supported opportunity into a concise vertical video.  
  Target: `WORKFLOW:IDEA-TO-PUBLISHED-SHORT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Localization Workflow** — Localize a published or ready video while preserving creator meaning and terminology.  
  Target: `WORKFLOW:LOCALIZATION-WORKFLOW` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Retained requirements:
  - Localize a published or ready video while preserving creator meaning and terminology. [IDEA-SRC-WF-027]
  - language, captions/subtitles and translated packaging readiness tied back to the same package identity. [IDEA-SRC-VAE-024]
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Longform to Shorts** — Derive self-contained short-form assets from a source video.  
  Target: `WORKFLOW:LONGFORM-TO-SHORTS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Missing Asset Finder Loop** — Resolve package gaps through the cheapest valid source.  
  Target: `WORKFLOW:MISSING-ASSET-FINDER-LOOP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Retained requirements:
  - Resolve package gaps through the cheapest valid source. [IDEA-SRC-WF-017]
  - click a missing slot to open the relevant generation/tool workflow instead of merely reporting the gap. [IDEA-SRC-VAE-004]
  - generate only absent package elements while leaving approved creator work untouched. [IDEA-SRC-VAE-021]
  Linked ideas:
  - COMPLEMENTARY: IDEA-TWB-010 — Asset Engine Toolbox
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Packaging Learning Loop** — Turn measured package experiments into governed learning.  
  Target: `WORKFLOW:PACKAGING-LEARNING-LOOP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-SPA-003 — Packaging & Metadata Experiment Laboratory
  - DEPENDENCY: IDEA-APP-025 — Governed Learning & Preference Promotion
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Pre-Launch Command** — Coordinate a minimal launch sequence around a finished video.  
  Target: `WORKFLOW:PRE-LAUNCH-COMMAND` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Retained requirements:
  - Coordinate a minimal launch sequence around a finished video. [IDEA-SRC-WF-020]
  - pinned comment, launch post, teaser Short and follow-up post readiness. [IDEA-SRC-VAE-013]
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Project Package Readiness** — Show only true blockers preventing a ContentBuild from publishing.  
  Target: `WORKFLOW:PROJECT-PACKAGE-READINESS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-TWB-010 — Asset Engine Toolbox
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Project Postmortem** — Preserve what actually happened during a project and what can safely be learned.  
  Target: `WORKFLOW:PROJECT-POSTMORTEM` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Research to Historical Video** — Build a source-backed history production workflow.  
  Target: `WORKFLOW:RESEARCH-TO-HISTORICAL-VIDEO` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Retention Rescue** — Turn retention evidence into reversible editing proposals.  
  Target: `WORKFLOW:RETENTION-RESCUE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-SPA-008 — Retention Lab — Scene & Chapter Diagnostics
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Revenue Opportunity Investigation** — Explore revenue differences without presenting correlation as guaranteed monetization.  
  Target: `WORKFLOW:REVENUE-OPPORTUNITY-INVESTIGATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-SPA-011 — Monetization & Revenue Opportunity Intelligence
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Script to Production Package** — Convert an approved script into the minimum complete production asset set.  
  Target: `WORKFLOW:SCRIPT-TO-PRODUCTION-PACKAGE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Search Gap to Video** — Convert a credible search gap into a channel-fit project.  
  Target: `WORKFLOW:SEARCH-GAP-TO-VIDEO` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Storyboard to Generated Sequence** — Produce a visually coherent generated shot sequence.  
  Target: `WORKFLOW:STORYBOARD-TO-GENERATED-SEQUENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **System Doctor to Recovery** — Route an app problem to its real owner instead of duplicating repair logic.  
  Target: `WORKFLOW:SYSTEM-DOCTOR-TO-RECOVERY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Thumbnail Refresh Experiment** — Run a traceable packaging experiment on an existing video.  
  Target: `WORKFLOW:THUMBNAIL-REFRESH-EXPERIMENT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-SPA-003 — Packaging & Metadata Experiment Laboratory
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Title Refresh Experiment** — Test a new framing strategy without losing the video's actual promise.  
  Target: `WORKFLOW:TITLE-REFRESH-EXPERIMENT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-SPA-003 — Packaging & Metadata Experiment Laboratory
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Trend Reaction Workflow** — Decide whether a current trend deserves accelerated production.  
  Target: `WORKFLOW:TREND-REACTION-WORKFLOW` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Underperforming Upload Rescue** — Diagnose and improve an existing upload without random simultaneous edits.  
  Target: `WORKFLOW:UNDERPERFORMING-UPLOAD-RESCUE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Vault Reuse to New Project** — Turn reusable archived material into a new coherent content project.  
  Target: `WORKFLOW:VAULT-REUSE-TO-NEW-PROJECT` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/workflows/cross-tool-creator-workflows-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

## Debugging & Simplification

### Debug Families

- **Debugging Family Records** — Group related bugs under stable debug/root-cause families.  
  Target: `GOVERNANCE:DEBUG-FAMILIES` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DISTINCT: IDEA-GOV-002 — Plan Families
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Duplicate Code

- **Duplicate-Code Detection Reports** — Find repeated stores/services/hooks/schemas/CSS/provider clients.  
  Target: `GOVERNANCE:CODE-OWNERSHIP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Implementation Families

- **Implementation Family Graphs** — Classify parallel implementations as canonical/adapter/compatibility/migration/donor/remove.  
  Target: `GOVERNANCE:CODE-OWNERSHIP` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Quarantine

- **Quarantine Registry** — Track uncertain legacy code/docs/prototypes with removal gates.  
  Target: `GOVERNANCE:DOCUMENTATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Removal

- **Removal Governance** — Require reachability/replacement/donor/rollback evidence before deletion.  
  Target: `GOVERNANCE:DOCUMENTATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Root Cause

- **Root-Cause Promotion** — Promote shared root causes above repeated symptom fixes.  
  Target: `GOVERNANCE:DEBUG-FAMILIES` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Shared Fixes

- **Fix Once / Prevent Everywhere Rule** — Prefer shared primitive/service/schema fixes over repeated local patches.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Simplification

- **Simplification Proposals** — Use a formal simplification work type for collapsing overlapping implementations.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Simplification Metrics

- **Architecture Simplification Scoreboard** — Track reductions in duplicate stores/routes/schemas/state owners/bridges.  
  Target: `GOVERNANCE:CONTROL-ROOM` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Google AI & Creative Providers

### Google AI Experiments

- **AI Studio Prompt-to-Tool Prototyping Bridge** — Use Google AI Studio as an experimentation donor for structured-output prompts, multimodal inputs, function/tool calling and model behavior. ViewTube should import proven prompt contracts and tests—not create a permanent second prompt authority.  
  Target: `FEATURE:GAI-12` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Cross-Modal Brand Consistency Engine** — Use Gemini reasoning plus Nano Banana/Veo/Flow references to compare thumbnails, frames, generated video and audio against the creator’s Style Fingerprint. Instead of a single vague style score, show concrete mismatches in palette, typography, subject treatment, pacing, camera language and recurring motifs.  
  Target: `FEATURE:GAI-14` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Flow / Veo Scene Director inside Video Director** — Turn a storyboard shot, reference frame, Asset Slot or selected Vault media into Veo scene generations, including portrait 9:16 outputs, first/last-frame continuity, ingredients/reference guidance and native audio when available. Generated clips should return as versioned assets with prompt/model/provenance metadata.  
  Target: `FEATURE:GAI-1` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-APP-031 — Media Provider Gateway & Legacy Provider Migration
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Flow Agent Batch Creative Director** — Map Flow Agent-style multi-step planning into ViewTube Projects: generate several scene variants, batch-edit a recurring visual choice, organize generated assets into collections and propose the next creative action while preserving explicit creator approval gates.  
  Target: `FEATURE:GAI-4` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Flow Music / Lyria Soundtrack Studio** — Generate project-scoped music beds, stingers, transitions and theme variations using Lyria-powered workflows, with duration, mood, tempo, intensity and edit-marker controls. Track usage rights/provenance and route approved audio directly into Editor/Vault.  
  Target: `FEATURE:GAI-6` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-APP-031 — Media Provider Gateway & Legacy Provider Migration
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Flow Tools / Creator Workflow Recipe Builder** — Create reusable visual workflow recipes such as “historical map → cinematic establishing shot → 9:16 crop → title card → music cue” or “product image → three ad concepts → six hook variants.” Where Flow Tools are not directly callable, export structured recipes/prompts and re-import resulting assets.  
  Target: `FEATURE:GAI-5` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Gemini API Model Router and Experiment Bench** — Build a controlled model-testing surface that compares Gemini model/prompt/context combinations against the versioned AI regression corpus. Capture latency, cost, schema validity, groundedness, usefulness and evidence quality before promoting a model configuration into production.  
  Target: `FEATURE:GAI-11` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Gemini Deep Research Topic Intelligence** — Run structured research for upcoming videos, competitors/topics, historical claims, product comparisons or audience questions, then convert the result into a ViewTube Evidence Pack with sources, confidence, freshness and explicit claims requiring human verification.  
  Target: `FEATURE:GAI-8` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Gemini Live Studio Copilot** — Add an optional voice-first copilot for brainstorming, script rehearsal, live editing decisions, shot review and hands-free navigation in the Studio Hub. The copilot should control ViewTube tools through typed actions rather than directly manipulating state outside canonical owners.  
  Target: `FEATURE:GAI-9` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Gemini Notebook Auto-Learning Library Builder** — Turn completed Projects, postmortems, high-performing videos and verified reference docs into source-grounded creator notebooks. The system could generate a “what we learned” brief, glossary, study guide, infographic or video overview and then publish approved versions into the ViewTube Library page.  
  Target: `FEATURE:GAI-13` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-GAI-007 — Gemini Notebook Creator Research Room
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Gemini Notebook Creator Research Room** — Create one source-grounded notebook per Project, series or channel topic containing research documents, transcripts, links, notes and prior videos. Use it to produce cited research answers, briefs, FAQs, timelines, Audio/Video Overviews and reusable evidence packets for the Brain.  
  Target: `FEATURE:GAI-7` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-GAI-013 — Gemini Notebook Auto-Learning Library Builder
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Google Photos / Personal Intelligence Reference Picker** — With explicit opt-in, allow creators to discover relevant personal photos or visual references from connected Google context for autobiographical content, thumbnails or B-roll planning. Nothing should be imported into Vault until the creator selects it.  
  Target: `FEATURE:GAI-10` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Multimodal Remix & Adaptation Factory** — Turn approved text/image/audio/video or ContentBuild inputs into governed remix/adaptation plans and derivatives—Shorts, teasers, alternate hooks/intros, localized versions, key art, social cutdowns and music treatments—while preserving source lineage and model provenance.  
  Target: `FEATURE:GAI-3` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-GAI-015 (Multimodal Adaptation Factory)
  Retained requirements:
  - Let creators drop text, images, audio and video references into one workspace and ask for a cohesive remix plan or generated output. Use cases include transforming an existing Short into a new visual concept, creating alternate hooks from footage, or adapting long-form material into several platform-ready variants. [IDEA-SRC-AUDIT-GAI-003]
  - Take one approved long-form ContentBuild and generate a governed adaptation plan for Shorts, teaser clips, thumbnail/key-art variants, localized versions, alternate intros, social cutdowns and music treatments. Each derivative remains linked to the source ContentBuild and records which Google model/tool created it. [IDEA-SRC-AUDIT-GAI-015]
  - expose Long / Short / Live package requirements without creating separate widget IDs. [IDEA-SRC-VAE-023]
  Linked ideas:
  - DEPENDENCY: IDEA-APP-031 — Media Provider Gateway & Legacy Provider Migration
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Nano Banana Thumbnail and Key-Art Lab** — Use Nano Banana 2/Pro for thumbnail ideation, controlled image editing, subject consistency, text-aware compositions, background replacement, visual cleanup and variant generation. It should operate on existing thumbnail assets rather than create a parallel image store.  
  Target: `FEATURE:GAI-2` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DEPENDENCY: IDEA-APP-031 — Media Provider Gateway & Legacy Provider Migration
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

## Integration & Decisions

### Assumptions

- **Assumption Registry** — Track unverified assumptions separately from facts/decisions.  
  Target: `GOVERNANCE:ASSUMPTIONS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Decision Conflicts

- **Decision Conflict Detection** — Flag new plans that contradict existing decisions/authorities.  
  Target: `GOVERNANCE:CONVERGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Decisions

- **Shared Decision Registry** — Assign stable IDs to durable product/architecture decisions.  
  Target: `GOVERNANCE:DECISIONS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Handoff Contracts

- **Handoff Contract Library** — Define reusable Project/Asset/Evidence/Generation/Publishing/Outcome handoffs.  
  Target: `WORKFLOW:HANDOFF-CONTRACTS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Integration Seams

- **Integration Seam Registry** — Record important system-to-system contracts and failure states.  
  Target: `GOVERNANCE:INTEGRATION-SEAMS` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Open Questions

- **Open Questions Queue** — Track unresolved research/creator/architecture questions separately from tasks.  
  Target: `GOVERNANCE:OPEN-QUESTIONS` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Provenance

- **Universal Provenance Envelope** — Use shared provenance fields for AI/assets/actions/renders/publish/outcomes.  
  Target: `GOVERNANCE:PROVENANCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Product Presentation & Demos

### Real UI Promotion

- **Real-UI Product Demo & Promo System** — Create reusable product demos, promo modules and presentation artifacts from actual ViewTube UI/components and real product states instead of maintaining visually divergent mock implementations.  
  Target: `FEATURE:REAL-UI-PRODUCT-DEMO` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/conversation-intake-opportunities-2026-09-27.md, tasks/conversation-intake/VT-CONV-SETTINGS-BACKLOG-GOVERNANCE-2026-09-27/worklog.json#VT-CWI-022

## Studio / Projects / Analytics Tools

### Creator Workflow Tools

- **Audience Intelligence & Cohort Workbench** — A reusable audience intelligence workbench for new/returning viewers, subscriber conversion, geography, device, format, traffic-source and lifecycle cohorts with strict metric comparability and compact segment-shift Dashboard status.  
  Target: `FEATURE:SPA-10` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-017 (Audience Intelligence)
  Retained requirements:
  - Compare new viewers, returning viewers, subscriber conversion, geography, device, format, traffic-source and lifecycle cohorts with strict metric-compatibility rules. Save useful cohorts as reusable analytics lenses rather than permanent duplicate datasets. [IDEA-SRC-AUDIT-SPA-010]
  - Promote or consolidate Audience Matrix + Device Matrix + Guest Ratio into Audience Intelligence; Dashboard role: top segment shift. [IDEA-SRC-TWB-017]
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Channel Change Journal and Outcome Map** — Automatically log significant creator actions—new thumbnail, title change, publish, playlist move, live event, experiment, major editor revision—and overlay later analytics so creators can inspect correlations without pretending they prove causation.  
  Target: `FEATURE:SPA-14` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-APP-022 — Outcome & Evaluation Closure Framework
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Comment-to-Content Opportunity Miner** — Cluster repeated viewer questions, requests and pain points across comments; connect clusters to existing videos/projects; estimate evidence strength; and create a Project or follow-up idea only after creator approval.  
  Target: `FEATURE:SPA-13` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-WF-007 — Comment to New Video
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Content Experiment Manager** — Create experiments around packaging, intro structure, publishing time, format or follow-up strategy; lock the hypothesis and changed variables; then join measured results back to the exact variant and ContentBuild.  
  Target: `FEATURE:SPA-7` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Retained requirements:
  - Create experiments around packaging, intro structure, publishing time, format or follow-up strategy; lock the hypothesis and changed variables; then join measured results back to the exact variant and ContentBuild. [IDEA-SRC-AUDIT-SPA-007]
  - show whether the selected title/thumbnail belongs to an active A/B or multivariate experiment. [IDEA-SRC-VAE-017]
  Linked ideas:
  - COMPLEMENTARY: IDEA-WF-034 — Experiment Design Workflow
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Creator Mission Control / Daily Command** — A creator command surface showing active Project/ContentBuild, blockers, approvals, readiness, anomalies, strongest evidence-backed recommendation and next action, with a compact Daily Oracle instrument and full Toolbox workstation.  
  Target: `FEATURE:SPA-1` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-006 (Daily Creator Command Toolbox)
  Retained requirements:
  - A Studio Hub command surface that shows the active Project, current ContentBuild, blockers, next action, pending approvals, publishing readiness, recent anomalies and the most important evidence-backed recommendation without becoming another Brain. [IDEA-SRC-AUDIT-SPA-001]
  - Promote or consolidate Daily Oracle into Daily Creator Command Toolbox; Dashboard role: daily top action + compact evidence. [IDEA-SRC-TWB-006]
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Discovery & Distribution Pathway Explorer** — A discovery/distribution workbench combining traffic-source mix, playback origins, sharing/bridge efficiency and flow/network visualization of how viewers arrive and continue through the channel.  
  Target: `FEATURE:SPA-9` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-018 (Discovery & Distribution)
  Retained requirements:
  - A flow/network visualization showing how viewers arrive through Search, Browse, Suggested, playlists, external sources, Shorts Feed, channel pages and internal routing, then where they go next when evidence is available. [IDEA-SRC-AUDIT-SPA-009]
  - Promote or consolidate Traffic Sources + Playback Origins + Sharing DNA + Bridge Efficiency into Discovery & Distribution; Dashboard role: current discovery mix. [IDEA-SRC-TWB-018]
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Monetization & Revenue Opportunity Intelligence** — A monetization intelligence workbench combining revenue momentum, ad/Premium signals, geography, format, watch behavior, memberships and cadence to explain observed revenue changes and surface evidence-qualified opportunities.  
  Target: `FEATURE:SPA-11` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-019 (Monetization Intelligence)
  Retained requirements:
  - Join content type, traffic, geography, watch behavior, ad/Premium revenue, memberships and publishing cadence to identify where revenue changes came from—while separating observed data from inferred opportunity. [IDEA-SRC-AUDIT-SPA-011]
  - Promote or consolidate Revenue Tracker + Revenue Momentum + Ad Stack + CPM Geography + Premium Pulse into Monetization Intelligence; Dashboard role: revenue pulse. [IDEA-SRC-TWB-019]
  Linked ideas:
  - COMPLEMENTARY: IDEA-WF-035 — Revenue Opportunity Investigation
  - COMPLEMENTARY: IDEA-YT-007 — Analytics, Revenue and Membership Intelligence Center
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Packaging & Metadata Experiment Laboratory** — A packaging laboratory for title, thumbnail, description, tags/SEO and related metadata with variant sets, evidence, rubric comparison, creator selection, historical context and outcome attribution to the exact package used.  
  Target: `FEATURE:SPA-3` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 4
  Consolidates: IDEA-TWB-013 (Metadata / SEO Workbench)
  Retained requirements:
  - A dedicated title-thumbnail-description experimentation workspace with variant sets, evidence, rubric comparison, creator selection, historical performance context and later outcome attribution to the exact package used. [IDEA-SRC-AUDIT-SPA-003]
  - Promote or consolidate Title Rewriter + Description Editor + Tag Generator + Hashtag Analyzer into Metadata / SEO Workbench; Dashboard role: package score/status + open workbench. [IDEA-SRC-TWB-013]
  - expose title, thumbnail, hook, or metadata variants and identify the selected/final candidate. [IDEA-SRC-VAE-005]
  - indicate whether approved SEO/entity intelligence has been attached to the publishing package. [IDEA-SRC-VAE-015]
  Linked ideas:
  - DEPENDENCY: IDEA-WF-004 — Thumbnail Refresh Experiment
  - DEPENDENCY: IDEA-WF-005 — Title Refresh Experiment
  - DEPENDENCY: IDEA-WF-031 — Packaging Learning Loop
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Project Dependency and Blocker Radar** — Visualize tasks and assets that are actually preventing completion: missing thumbnail choice, unresolved research claim, render failure, auth problem, unapproved package, absent captions or incomplete rights review. Rank blockers by downstream impact.  
  Target: `FEATURE:SPA-6` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Research-to-Project Builder** — Turn a research brief, Gemini Notebook, URL set, transcript bundle or Brain conversation into a real Project with goals, evidence, tasks, script outline, asset slots and a ContentBuild identity in one guided flow.  
  Target: `FEATURE:SPA-2` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Retention Lab — Scene & Chapter Diagnostics** — A Retention Lab that combines retention alerts/benchmarks/simulation with scene, chapter, transcript and edit-marker diagnostics so creators can move from evidence to precise content structure analysis.  
  Target: `FEATURE:SPA-8` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-014 (Retention Lab)
  Retained requirements:
  - Overlay retention behavior on chapters, transcript sections, edit markers and scene boundaries so creators can see where viewer behavior changes relative to actual content structure rather than only a generic line chart. [IDEA-SRC-AUDIT-SPA-008]
  - Promote or consolidate Retention Dip + Benchmark + Simulator into Retention Lab; Dashboard role: retention alert/summary. [IDEA-SRC-TWB-014]
  Linked ideas:
  - DEPENDENCY: IDEA-WF-006 — Retention Rescue
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Scenario Planner** — Let creators model “what if” plans such as more Shorts, fewer but larger long-form uploads, a weekly live stream, a sequel series or different publishing cadence. Use historical channel evidence to show assumptions and ranges, not fake forecasts or guaranteed outcomes.  
  Target: `FEATURE:SPA-15` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Series and Playlist Architect** — Plan a multi-video series visually, assign Projects/ContentBuilds to episodes, define playlist order, internal routing, follow-up candidates, recurring assets and publication cadence, then sync the supported playlist structure to YouTube.  
  Target: `FEATURE:SPA-12` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-WF-023 — Content Series Builder
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Video Lifecycle Timeline** — A single chronological view of idea, research, project creation, script, generated assets, edits, render, package approval, publish, analytics checkpoints, experiments, comments, outcomes and learned corrections for one video.  
  Target: `FEATURE:SPA-5` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

## Task & Plan State

### Maturity

- **Plan Maturity Model** — Track Architecture, Backend, Frontend, Integration, Tests, Runtime, Responsive, Documentation and Release maturity instead of vague almost-finished states.  
  Target: `GOVERNANCE:PLAN-MATURITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Plan Consolidation

- **Feature Cluster Documents** — For systems with many related improvements, maintain one compact living feature-cluster document instead of many micro-plans.  
  Target: `GOVERNANCE:PLAN-FAMILIES` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Progress Projection

- **Task Completion Feedback Into Plans** — When tasks become verified DONE, update owning plan maturity/progress projections instead of copying status prose.  
  Target: `GOVERNANCE:TASK-AUTHORITY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## Toolbox & Widget Architecture

### Promotion Candidates

- **Asset Engine Toolbox** — Promote or consolidate Video Asset Engine into Asset Engine Toolbox; Dashboard role: package readiness + missing slot launcher.  
  Target: `FEATURE:ASSET-ENGINE-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 9
  Retained requirements:
  - Promote or consolidate Video Asset Engine into Asset Engine Toolbox; Dashboard role: package readiness + missing slot launcher. [IDEA-SRC-TWB-010]
  - central 16:9 package surface showing the currently selected video/package and its most important visual asset. [IDEA-SRC-VAE-001]
  - one progress instrument that scores which required package parts exist, are approved, or are missing. [IDEA-SRC-VAE-002]
  - thumbnail, title, description, tags/SEO, script, community, routing, and production slots tied to real Vault assets. [IDEA-SRC-VAE-003]
  - compact list of the newest durable creator assets with kind, project and recency. [IDEA-SRC-VAE-009]
  - move the widget between current project, current video, or recent unscoped assets. [IDEA-SRC-VAE-010]
  - keep the default widget understandable while exposing deeper capability without making it permanently huge. [IDEA-SRC-VAE-011]
  - flag missing URLs, invalid previews, orphaned parents, unresolved project ownership or stale generation records. [IDEA-SRC-VAE-020]
  - branch a package for a sequel, localization, alternate format or experiment while preserving lineage. [IDEA-SRC-VAE-022]
  Linked ideas:
  - COMPLEMENTARY: IDEA-WF-017 — Missing Asset Finder Loop
  - COMPLEMENTARY: IDEA-WF-019 — Project Package Readiness
  - DEPENDENCY: IDEA-APP-019 — Asset Engine + Vault Identity & Lineage Contract
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Dashboard Control Toolbox** — Promote or consolidate Settings widget into Dashboard Control Toolbox; Dashboard role: compact switchboard.  
  Target: `FEATURE:DASHBOARD-CONTROL-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Keyword Intelligence** — Promote or consolidate Keyword Engine + Keyword Overlap into Keyword Intelligence; Dashboard role: top opportunity/overlap alert.  
  Target: `FEATURE:KEYWORD-INTELLIGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-TWB-020 — Opportunity Intelligence Workbench
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Opportunity Intelligence Workbench** — Promote or consolidate Opportunity Radar into Opportunity Intelligence Workbench; Dashboard role: spatial opportunity map + open action.  
  Target: `FEATURE:OPPORTUNITY-INTELLIGENCE-WORKBENCH` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-TWB-015 — Keyword Intelligence
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Thumbnail Studio Toolbox** — Promote or consolidate Thumbnail Lab / ThumbAI / A-B Thumbnail into Thumbnail Studio Toolbox; Dashboard role: selected variant + experiment status.  
  Target: `FEATURE:THUMBNAIL-STUDIO-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **UI Reference Studio Toolbox** — Promote or consolidate UI Reference Library into UI Reference Studio Toolbox; Dashboard role: developer/reference launcher only.  
  Target: `FEATURE:UI-REFERENCE-STUDIO-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Video Director Toolbox** — Promote or consolidate Video Director into Video Director Toolbox; Dashboard role: active job, preset, queue and Generate launcher.  
  Target: `FEATURE:VIDEO-DIRECTOR-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Video Manager Toolbox** — Promote or consolidate Video Manager into Video Manager Toolbox; Dashboard role: selected-video status + quick actions.  
  Target: `FEATURE:VIDEO-MANAGER-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Video Performance Autopsy & Optimization Toolbox** — One video performance workstation that diagnoses CTR, retention, traffic, audience, packaging and distribution issues, then turns supported findings into bounded optimization actions and experiments.  
  Target: `FEATURE:VIDEO-PERFORMANCE-AUTOPSY-TOOLBOX` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-009 (Video Optimization Toolbox)
  Retained requirements:
  - Promote or consolidate Video Autopsy into Video Performance Autopsy Toolbox; Dashboard role: headline diagnosis + strongest issue. [IDEA-SRC-TWB-005]
  - Promote or consolidate Longform Optimization into Video Optimization Toolbox; Dashboard role: strongest optimization signal. [IDEA-SRC-TWB-009]
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

### Workflow Infrastructure

- **Brain-compatible destination ranking** — Preference-based ranking already exists; extend ranking with bounded Project/evidence/required-context compatibility and User Controls.  
  Target: `SYSTEM:BRAIN-COMPATIBLE-DESTINATION-RANKING` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Universal Tool & Widget Handoff Metadata** — Unify tool and widget handoff metadata around accepts, produces, suggested handoffs, required context, mutation/external-write class and resumable destination semantics without recreating registry ownership.  
  Target: `SYSTEM:HANDOFF-METADATA-CONVERGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-APP-045 (Widget Handoff Capability Metadata)
  Retained requirements:
  - Extend widget/tool registries with accepts, produces, suggestedHandoffs and context requirements. [IDEA-SRC-APP-045]
  - `accepts` / `produces` already exist in `VIEWTUBE_TOOL_CAPABILITIES`; add required-context, mutation/resume semantics, explicit suggested-handoff metadata where useful, and bridge tool metadata with WidgetRegistry rather than recreating it. [IDEA-SRC-WFI-002]
  - contextual destinations such as Studio, Editor, Publisher, Projects, Community, or Vault. [IDEA-SRC-VAE-008]
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md, ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

- **Widget-to-Toolbox Promotion Framework** — Create one reusable compact-widget → Toolbox launcher/resume/context contract, then apply it through audited promotion matrices to Director, Publisher, Manager, Autopsy, Oracle, Brain Hub, Comment Operations, Optimization, Asset Engine and Thumbnail Studio.  
  Target: `SYSTEM:PROMOTION-FRAMEWORK` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-WFI-008 (Core Toolbox promotions)
  Retained requirements:
  - Reusable compact-widget → Toolbox launcher/resume contract. [IDEA-SRC-WFI-001]
  - Director, Publisher, Manager, Autopsy, Oracle, Brain Hub, Comment Operations, Optimization, Asset Engine and Thumbnail Studio. [IDEA-SRC-WFI-008]
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Workflow chain viewer convergence** — WorkflowChainBuilder/workflowEngine already exist; connect them to universal packet receipts, evidence, canonical IDs and outcomes instead of building a parallel viewer.  
  Target: `SYSTEM:WORKFLOW-CHAIN-VIEWER-CONVERGENCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Workflow recipe registry** — Eight hard-coded suggested chain templates already exist; generalize them into structured validated recipe definitions and add the remaining catalog without creating another execution owner.  
  Target: `SYSTEM:WORKFLOW-RECIPE-REGISTRY` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - DISTINCT: IDEA-GOV-046 — Reusable Workflow Registry
  Source refs: ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

## Verification & Health

### Capability Coverage

- **Capability Coverage Audit** — Show authority/code/tasks/tests/UI/Guide/verification coverage per capability.  
  Target: `GOVERNANCE:CAPABILITY-COVERAGE` · Status: `IMPLEMENTATION_WAVE` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Document Health

- **Documentation & Plan Health CI** — Automate documentation/plan health checks for stale metadata, duplicate authorities, broken supersession/references, missing ownership/acceptance/code links, unregistered docs, archive manifests and substantial plan overlap.  
  Target: `CAPABILITY:CAP-DOCUMENT-GOVERNANCE` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 3
  Consolidates: IDEA-GOV-042 (Plan Health Audit); IDEA-APP-012 (Documentation CI/Governance Automation)
  Retained requirements:
  - Detect stale SHA metadata, duplicate authorities, broken supersession and orphan docs. [IDEA-SRC-GOV-041]
  - Flag plans with no active tasks, no owner, no acceptance criteria, no code links, staleness or substantial overlap with another plan. [IDEA-SRC-GOV-042]
  - Add stale-plan, unregistered-doc, duplicate-active-concern, broken-ref, metadata, supersession and archive-manifest checks. [IDEA-SRC-APP-012]
  Source refs: ideas/lists/governance/document-governance-improvements.md, ideas/lists/product/app-plan-convergence-and-completion-ideas-2026-09-27.md

### Evidence

- **Evidence Bundles** — Collect tests/screenshots/logs/runtime/PR/deployment evidence under receipt IDs.  
  Target: `CAPABILITY:CAP-VERIFICATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Verification Debt

- **Verification Debt Registry** — Track implementation that lacks required runtime/visual/auth/deploy verification.  
  Target: `CAPABILITY:CAP-VERIFICATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

### Visual Certification

- **Screenshot Certification Records** — Standardize desktop/mobile/orientation screenshot evidence records.  
  Target: `CAPABILITY:CAP-VERIFICATION` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/governance/document-governance-improvements.md

## YouTube Platform Integration

### YouTube API & Studio

- **Analytics, Revenue and Membership Intelligence Center** — Unify YouTube Analytics/Reporting metrics and dimensions for views, watch time, retention, traffic, devices, geography, subscribers, playlists, livestreams, estimated revenue, ad performance, Premium revenue and available membership signals. Every number should retain unit, scope, window, format and provenance so comparisons pass the canonical metric-compatibility guard.  
  Target: `FEATURE:YT-7` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Linked ideas:
  - COMPLEMENTARY: IDEA-SPA-011 — Monetization & Revenue Opportunity Intelligence
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Channel Customization and Homepage Architect** — Manage supported channel branding and channel sections/shelves from ViewTube, with a visual preview of how playlists, popular uploads, featured groups and channel sections will appear. Where YouTube exposes only partial customization control, ViewTube should guide the creator to the exact remaining Studio action.  
  Target: `FEATURE:YT-3` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Comment & Community Operations Toolbox** — One creator-controlled comment/community operations workspace for triage, reply drafting, moderation, audience signals, prioritization, routing, and compact Dashboard queue/status.  
  Target: `FEATURE:YT-4` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-008 (Comment Operations Toolbox)
  Retained requirements:
  - Combine comment threads, replies, moderation state, spam/report actions where supported, creator notes, saved reply styles, suggested-video routing and audience intelligence into one triage workspace. High-volume channels should get batch filters, sentiment/theme clustering and “needs creator attention” prioritization without auto-posting unless explicitly allowed. [IDEA-SRC-AUDIT-YT-004]
  - Promote or consolidate Comment Responder into Comment Operations Toolbox; Dashboard role: queue count + priority replies. [IDEA-SRC-TWB-008]
  Linked ideas:
  - DEPENDENCY: IDEA-WF-029 — Comment Response Campaign
  - DEPENDENCY: IDEA-WF-008 — Comment to Community Campaign
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Live Control Room** — Create and schedule broadcasts, bind streams, monitor stream health, manage eligible live settings, operate live chat moderation, moderators/bans and supported monetization/cuepoint controls, and preserve the resulting livestream as a normal ContentBuild/video after the event.  
  Target: `FEATURE:YT-6` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Monetization, Shopping and Commerce Operations Hub** — Combine revenue analytics, ad-performance signals, Premium revenue, Super Chat/Super Thanks-style event data where available, memberships and YouTube Shopping/merchant readiness into one commerce workspace. Shopping controls that are not exposed by a supported API should appear as synchronized status, checklist and deep-link handoffs rather than fake in-app controls.  
  Target: `FEATURE:YT-9` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Playlist, Series and Content Architecture Manager** — Create, edit, reorder and organize playlists and playlist items; connect each playlist to Projects, series strategy, end-screen routing and channel sections. Add playlist health metrics, missing-video alerts, duplicate placement detection and sequence recommendations based on actual viewer flows.  
  Target: `FEATURE:YT-5` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Publisher & Publish Flight Deck** — One canonical Publisher workstation covering readiness, approved package intent, upload/schedule, metadata and assets, external-write approval, retry/recovery, remote verification, post-publish updates, and compact Dashboard status/resume.  
  Target: `FEATURE:YT-2` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 4
  Consolidates: IDEA-SPA-004 (Publish Flight Deck); IDEA-TWB-003 (Video Publisher Toolbox)
  Retained requirements:
  - Extend the Publisher into a full YouTube operations console for upload, title/description/tags, thumbnail, captions where supported, visibility, audience settings, scheduling, premiere/live handoff, playlist placement, remote verification, retry/recovery and post-publish metadata updates. The ApprovedPublishSnapshot should remain the immutable approval boundary. [IDEA-SRC-AUDIT-YT-002]
  - A dense but visual final readiness tool showing VIDEO → PACKAGE → RIGHTS → METADATA → AUDIENCE → SCHEDULE → APPROVAL → PUBLISH → VERIFY. It should absorb duplicate preflight/checklist surfaces rather than add another parallel publisher. [IDEA-SRC-AUDIT-SPA-004]
  - Promote or consolidate Video Uploader / Publisher into Video Publisher Toolbox; Dashboard role: readiness/publish status + resume. [IDEA-SRC-TWB-003]
  - show pre-publish, launch, early-post-launch and sustain assets beside the publishing package. [IDEA-SRC-VAE-012]
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Publishing Calendar & YouTube State Sync** — One publishing calendar for Projects, drafts, scheduled uploads, premieres, livestreams, campaigns, checkpoints, drift/conflicts, readiness and YouTube state synchronization, with compact next-slot status on Dashboard.  
  Target: `FEATURE:YT-10` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 2
  Consolidates: IDEA-TWB-016 (Publishing Calendar)
  Retained requirements:
  - One calendar for Projects, drafts, scheduled uploads, premieres, livestreams, campaign moments, community tasks and post-publish checkpoints. It should reconcile planned ViewTube dates with actual YouTube publish/live state and flag drift, missed deadlines, competing releases, missing assets and under-supported launch windows. [IDEA-SRC-AUDIT-YT-010]
  - Promote or consolidate Mini Calendar + Upload Scheduler into Publishing Calendar; Dashboard role: next slot + conflict/status. [IDEA-SRC-TWB-016]
  Linked ideas:
  - DEPENDENCY: IDEA-WF-024 — Calendar Gap Filler
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md, ideas/lists/product/toolbox-widget-promotion-and-workbench-ideas-2026-09-27.md, docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md

- **Subscriber, Subscription and Member Relationship Center** — Separate three commonly confused concepts: channel subscriber performance, the authenticated account's own subscriptions, and channel membership data available to eligible channels. Build cohort views, churn/cancellation-reason analysis where data exists, member-perk tracking, subscriber conversion paths and relationship history without pretending that private subscriber identities are universally available.  
  Target: `FEATURE:YT-8` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

- **Unified YouTube Studio Control Center** — A single ViewTube workspace that merges supported channel, video, playlist, comment, subscription, membership, live, analytics and revenue controls behind one account-scoped command surface. It should show whether each control is **directly writable**, **read-only**, **requires YouTube Studio**, or **blocked by permissions**, so the product never implies unsupported authority.  
  Target: `FEATURE:YT-1` · Status: `UNREVIEWED` · Review: `CONSOLIDATED` · Source items: 1
  Source refs: ideas/lists/product/current-main-audit-expansion-opportunities.md, docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md

