# ViewTube Ideas Consolidation Report — 2026-09-27

**Run:** `IDEA-REVIEW-RUN-2026-09-27-001`  
**Baseline main:** `bdceef1de0d6c0784a5aca86ad365f2c237815b9`  
**Authority:** `docs/governance/CONVERGENCE.md`  
**Process:** `tasks/convergence-governance-wave/IDEAS_CONSOLIDATION_PLAN.md`

## Result

The Ideas Library was inventoried, expanded to include previously unregistered explicit idea sources, normalized to source-item provenance, semantically reviewed, consolidated, and regenerated as a reviewed master projection.

- Source lists: **7**
- Atomic source items: **254**
- Idea records / stable IDs: **228**
- Active master ideas after consolidation: **190**
- Merged alias IDs preserved for lineage: **38**
- Semantic merge groups: **25**
- Linked keep-separate relationship decisions: **27**
- Unresolved source items: **0**
- Task Index mutations: **0**

The reduction from 228 stable idea records to 190 active master ideas does **not** delete the merged idea IDs. Donor IDs remain in `ideas/registry.json` with `lifecycle: MERGED` and a reversible `mergedInto` pointer.

## Inventory additions

Two missing provenance sources were brought into the governed intake:

1. `docs/architecture/VIDEO_ASSET_ENGINE_WIDGET_IDEAS_2026-09-20.md` — 25 Asset Engine widget ideas, preserved under `ideas/lists/product/video-asset-engine-widget-ideas-2026-09-20.md`.
2. Two explicit `IDEA / CREATE_OPPORTUNITY` records from the conversation-intake worklogs, preserved under `ideas/lists/governance/conversation-intake-opportunities-2026-09-27.md`.

The Asset Engine catalog was treated as source requirements rather than creating 25 new parallel master products. Each of its 25 items now maps to the relevant existing master idea (Asset Engine, Missing Asset Finder, Packaging Lab, asset lineage, outcomes, localization, and related workflows).

## Consolidated master groups

### IDEA-MERGE-001 — Publisher & Publish Flight Deck

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-YT-002`  
**Merged IDs:** `IDEA-SPA-004`, `IDEA-TWB-003`  
All three proposals describe the same publishing owner at different UI depths; retaining them separately would recreate Publisher/preflight/toolbox duplication.

### IDEA-MERGE-002 — Comment & Community Operations Toolbox

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-YT-004`  
**Merged IDs:** `IDEA-TWB-008`  
The Toolbox proposal is the deep-workstation form of the existing comment/community operations idea.

### IDEA-MERGE-003 — Publishing Calendar & YouTube State Sync

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-YT-010`  
**Merged IDs:** `IDEA-TWB-016`  
Both ideas own the same calendar/scheduling outcome.

### IDEA-MERGE-004 — Creator Mission Control / Daily Command

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-SPA-001`  
**Merged IDs:** `IDEA-TWB-006`  
Daily Creator Command is the Toolbox-scale manifestation of Creator Mission Control.

### IDEA-MERGE-005 — Retention Lab — Scene & Chapter Diagnostics

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-SPA-008`  
**Merged IDs:** `IDEA-TWB-014`  
The workbench and diagnostics are complementary parts of one retention investigation capability.

### IDEA-MERGE-006 — Audience Intelligence & Cohort Workbench

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-SPA-010`  
**Merged IDs:** `IDEA-TWB-017`  
Both proposals describe one audience segmentation/cohort workstation.

### IDEA-MERGE-007 — Discovery & Distribution Pathway Explorer

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-SPA-009`  
**Merged IDs:** `IDEA-TWB-018`  
Traffic pathway visualization is the signature visualization inside the broader Discovery & Distribution workbench.

### IDEA-MERGE-008 — Monetization & Revenue Opportunity Intelligence

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-SPA-011`  
**Merged IDs:** `IDEA-TWB-019`  
The widget-family consolidation and Revenue Opportunity Analyzer have one analytical goal.

### IDEA-MERGE-009 — Video Performance Autopsy & Optimization Toolbox

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-TWB-005`  
**Merged IDs:** `IDEA-TWB-009`  
Autopsy and longform optimization are adjacent phases of the same per-video diagnostic/action workstation.

### IDEA-MERGE-010 — Brain Hub Product Toolbox

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-APP-026`  
**Merged IDs:** `IDEA-TWB-007`  
The two ideas are the same Brain Hub product surface at different detail levels.

### IDEA-MERGE-011 — Universal Tool & Widget Handoff Metadata

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-WFI-002`  
**Merged IDs:** `IDEA-APP-045`  
Both ideas request the same registry-level handoff capability metadata.

### IDEA-MERGE-012 — Universal OperationRecord & Receipt Convergence

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-020`  
**Merged IDs:** `IDEA-APP-021`, `IDEA-WFI-003`  
These proposals are three descriptions of the same operation-identity convergence objective.

### IDEA-MERGE-013 — Cross-Surface Identity & Evidence Continuity

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-039`  
**Merged IDs:** `IDEA-APP-016`, `IDEA-WFI-010`  
Evidence continuity and project/asset handoff continuity are facets of one end-to-end identity certification objective.

### IDEA-MERGE-014 — Outcome & Evaluation Closure Framework

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-022`  
**Merged IDs:** `IDEA-APP-023`, `IDEA-APP-024`, `IDEA-APP-038`, `IDEA-WFI-011`  
Producer contracts, coverage, evaluation targets and publish outcome linkage are required parts of one outcome/evaluation closure system.

### IDEA-MERGE-015 — Governed Learning & Preference Promotion

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-025`  
**Merged IDs:** `IDEA-WFI-007`  
Handoff preference feedback is one learning-input path and should not remain a separate learning system.

### IDEA-MERGE-016 — Prompt Production Reachability, Recipes & Evaluation

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-027`  
**Merged IDs:** `IDEA-APP-028`, `IDEA-APP-029`  
Reachability, canonical recipes and evaluation are successive phases of one prompt production-governance objective.

### IDEA-MERGE-017 — Media Provider Gateway & Legacy Provider Migration

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-031`  
**Merged IDs:** `IDEA-APP-032`  
A canonical gateway and removal of direct callers are one migration objective.

### IDEA-MERGE-018 — Vault Creator Workspace Completion

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-033`  
**Merged IDs:** `IDEA-APP-034`, `IDEA-APP-035`, `IDEA-APP-036`  
The four ideas are slices of one Vault completion program rather than separate products.

### IDEA-MERGE-019 — Dashboard Domain Workbench Consolidation

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-APP-042`  
**Merged IDs:** `IDEA-WFI-009`  
The two records are the same domain-workbench consolidation program.

### IDEA-MERGE-020 — Widget Production Cohort & State Certification

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-APP-043`  
**Merged IDs:** `IDEA-APP-044`, `IDEA-WFI-012`  
Cohort certification, universal empty/preview behavior and responsive/accessibility certification belong to one widget production-readiness program.

### IDEA-MERGE-021 — Widget-to-Toolbox Promotion Framework

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-WFI-001`  
**Merged IDs:** `IDEA-WFI-008`  
The generic promotion framework and its core promotion wave are one program.

### IDEA-MERGE-022 — Historical Backlog & Program Reconciliation

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-APP-004`  
**Merged IDs:** `IDEA-APP-005`, `IDEA-APP-006`, `IDEA-APP-007`  
These are source-specific instances of one historical backlog/program reconciliation objective.

### IDEA-MERGE-023 — Documentation & Plan Health CI

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-GOV-041`  
**Merged IDs:** `IDEA-GOV-042`, `IDEA-APP-012`  
The audit ideas and CI proposal are one persistent documentation/plan health capability.

### IDEA-MERGE-024 — Multimodal Remix & Adaptation Factory

**Classification:** SAME_OBJECTIVE  
**Survivor:** `IDEA-GAI-003`  
**Merged IDs:** `IDEA-GAI-015`  
Both Google-AI proposals describe the same multimodal adaptation workspace at different levels of specificity.

### IDEA-MERGE-025 — Packaging & Metadata Experiment Laboratory

**Classification:** COMPLEMENTARY  
**Survivor:** `IDEA-SPA-003`  
**Merged IDs:** `IDEA-TWB-013`  
Metadata/SEO is a package-creation mode inside the existing Packaging Laboratory, not a separate product owner.

## Keep-separate relationships

The following records were intentionally linked rather than merged because they represent a tool vs workflow, provider vs gateway, education vs execution, or otherwise distinct owner/lifecycle role.

- **COMPLEMENTARY:** `IDEA-SPA-013` Comment-to-Content Opportunity Miner ↔ `IDEA-WF-007` Comment to New Video — Opportunity Miner is the persistent analysis/tool capability; Comment → New Video is the reusable orchestration recipe.
- **DEPENDENCY:** `IDEA-YT-004` Comment & Community Operations Toolbox ↔ `IDEA-WF-029` Comment Response Campaign — Comment Response Campaign executes through the canonical Comment/Community Operations workspace.
- **DEPENDENCY:** `IDEA-YT-004` Comment & Community Operations Toolbox ↔ `IDEA-WF-008` Comment to Community Campaign — Comment → Community Campaign starts from the same comment/audience operations owner.
- **COMPLEMENTARY:** `IDEA-SPA-011` Monetization & Revenue Opportunity Intelligence ↔ `IDEA-WF-035` Revenue Opportunity Investigation — The workbench explains revenue evidence; the workflow turns an investigation into a bounded creator action.
- **COMPLEMENTARY:** `IDEA-SPA-012` Series and Playlist Architect ↔ `IDEA-WF-023` Content Series Builder — Series/Playlist Architect is the planning tool; Content Series Builder is the orchestration recipe.
- **COMPLEMENTARY:** `IDEA-SPA-007` Content Experiment Manager ↔ `IDEA-WF-034` Experiment Design Workflow — Content Experiment Manager is the experiment owner; Experiment Design Workflow is its setup recipe.
- **DEPENDENCY:** `IDEA-SPA-003` Packaging & Metadata Experiment Laboratory ↔ `IDEA-WF-004` Thumbnail Refresh Experiment — Thumbnail Refresh Experiment is a packaging-lab workflow.
- **DEPENDENCY:** `IDEA-SPA-003` Packaging & Metadata Experiment Laboratory ↔ `IDEA-WF-005` Title Refresh Experiment — Title Refresh Experiment is a packaging-lab workflow.
- **DEPENDENCY:** `IDEA-SPA-003` Packaging & Metadata Experiment Laboratory ↔ `IDEA-WF-031` Packaging Learning Loop — Packaging Learning Loop evaluates the exact package variants produced/selected by the lab.
- **DEPENDENCY:** `IDEA-SPA-008` Retention Lab — Scene & Chapter Diagnostics ↔ `IDEA-WF-006` Retention Rescue — Retention Rescue consumes Retention Lab evidence and diagnostics.
- **DEPENDENCY:** `IDEA-YT-010` Publishing Calendar & YouTube State Sync ↔ `IDEA-WF-024` Calendar Gap Filler — Calendar Gap Filler is a scheduling recipe over the canonical Publishing Calendar.
- **COMPLEMENTARY:** `IDEA-TWB-010` Asset Engine Toolbox ↔ `IDEA-WF-017` Missing Asset Finder Loop — Asset Engine exposes missing slots; Missing Asset Finder resolves them through reuse/generation.
- **COMPLEMENTARY:** `IDEA-TWB-010` Asset Engine Toolbox ↔ `IDEA-WF-019` Project Package Readiness — Asset Engine package state supplies Project Package Readiness.
- **DEPENDENCY:** `IDEA-APP-031` Media Provider Gateway & Legacy Provider Migration ↔ `IDEA-GAI-001` Flow / Veo Scene Director inside Video Director — Veo/Flow scene generation should route through the canonical media provider gateway.
- **DEPENDENCY:** `IDEA-APP-031` Media Provider Gateway & Legacy Provider Migration ↔ `IDEA-GAI-002` Nano Banana Thumbnail and Key-Art Lab — Thumbnail image generation/edit providers should route through the canonical media provider gateway.
- **DEPENDENCY:** `IDEA-APP-031` Media Provider Gateway & Legacy Provider Migration ↔ `IDEA-GAI-003` Multimodal Remix & Adaptation Factory — Multimodal generation adapters should use the canonical provider/generation boundary.
- **DEPENDENCY:** `IDEA-APP-031` Media Provider Gateway & Legacy Provider Migration ↔ `IDEA-GAI-006` Flow Music / Lyria Soundtrack Studio — Generated audio should use the governed provider/generation boundary and asset lineage.
- **DEPENDENCY:** `IDEA-APP-019` Asset Engine + Vault Identity & Lineage Contract ↔ `IDEA-TWB-010` Asset Engine Toolbox — Asset Engine Toolbox visualizes and operates on the canonical asset identity/lineage contract.
- **COMPLEMENTARY:** `IDEA-APP-022` Outcome & Evaluation Closure Framework ↔ `IDEA-SPA-014` Channel Change Journal and Outcome Map — Change Journal is a creator-facing projection over canonical action/outcome/evaluation identity.
- **DEPENDENCY:** `IDEA-APP-025` Governed Learning & Preference Promotion ↔ `IDEA-WF-031` Packaging Learning Loop — Packaging lessons are candidates for governed learning, not direct memory writes.
- **DEPENDENCY:** `IDEA-APP-025` Governed Learning & Preference Promotion ↔ `IDEA-WF-032` Hook Learning Loop — Hook lessons are candidates for governed learning, not direct memory writes.
- **DEPENDENCY:** `IDEA-APP-025` Governed Learning & Preference Promotion ↔ `IDEA-WF-040` Full Creator Improvement Loop — The full improvement loop depends on governed promotion of durable learning.
- **DISTINCT:** `IDEA-GOV-046` Reusable Workflow Registry ↔ `IDEA-WFI-004` Workflow recipe registry — Governance reusable workflows orchestrate development processes; creator workflow recipes orchestrate product tools. They share patterns but need separate registries/namespaces.
- **COMPLEMENTARY:** `IDEA-TWB-015` Keyword Intelligence ↔ `IDEA-TWB-020` Opportunity Intelligence Workbench — Keyword Intelligence can be a lens/provider for Opportunity Intelligence but also serves metadata/search workflows; keep ownership separate until product boundaries are proven.
- **COMPLEMENTARY:** `IDEA-YT-007` Analytics, Revenue and Membership Intelligence Center ↔ `IDEA-SPA-011` Monetization & Revenue Opportunity Intelligence — The broad analytics/revenue center supplies canonical data; the Monetization & Revenue Opportunity workbench is a focused analytical experience.
- **DEPENDENCY:** `IDEA-GAI-007` Gemini Notebook Creator Research Room ↔ `IDEA-GAI-013` Gemini Notebook Auto-Learning Library Builder — Research notebooks and post-project auto-learning notebooks share infrastructure but operate at different lifecycle stages.
- **DISTINCT:** `IDEA-GOV-002` Plan Families ↔ `IDEA-GOV-022` Debugging Family Records — Plan families govern planned work; debugging families govern root-cause incidents. Similar naming does not imply one owner.

## Lossless guarantees

- Every one of the 254 source items maps to exactly one active master idea.
- Every active master idea carries source-item IDs and retained requirement mappings.
- Every merged idea ID remains addressable and points to its survivor.
- Source lists remain preserved as provenance.
- Automatic similarity was used only for candidate discovery; it did not make merge decisions.
- Tool/workflow ideas that share vocabulary but have distinct product roles remain linked rather than flattened.
- No idea was promoted to a Task merely because it survived consolidation.

## Next review boundary

Future idea intake should enter as source items first, run candidate discovery against these 190 active masters, receive an explicit SAME_OBJECTIVE / COMPLEMENTARY / DEPENDENCY / CONFLICT / DISTINCT review decision, and only then modify the master projection.
