# ViewTube Integrated Application Program

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-27  
**Class:** PROGRAM  
**Status:** ACTIVE  
**Concern:** permanent cross-system convergence, integration seams, dependencies, and critical-path completion  
**Owner:** Integrated Application Program  
**Registry ID:** DOC-PROGRAM-INTEGRATED  
**Last Audited Main SHA:** 76519e3d81f33df4a3084f49a369f5edbb1ee937  
**Supersedes:** docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md after migration certification  
**Consolidates:** system convergence program relationships while preserving its detailed classification/task sources  
**Related Authorities:** docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md; docs/architecture/PRODUCT_ARCHITECTURE.md; Task Index

## Purpose

This is the permanent application-level integration program. It answers how ViewTube's accepted capabilities become one coherent production application. It does not own domain internals or exact task status.

## Program loop

Data/account
→ VT-SYNC
→ analytics-canon
→ evidence/intelligence
→ BrainRuntime
→ Project + ContentBuild
→ operations/generation/assets
→ package
→ Editor/Remotion
→ approved publish
→ YouTube
→ post-publish analytics
→ outcomes/evaluation
→ governed learning.

## Program responsibilities

- cross-system seams;
- dependency chains;
- critical paths;
- vertical completion slices;
- integration blockers/risks;
- migration and consolidation sequencing;
- capability maturity summaries;
- verification requirements;
- references to canonical VT task IDs.

Detailed task state belongs in Task Index. Domain internals belong in Domain Authorities. Product acceptance belongs in Product Architecture.

## Current cross-system workstreams

### Creator Context convergence
Converge channel profile, channel knowledge, style, active Project/ContentBuild and surface context through the current CreatorContextResolver direction introduced in PR #458. Avoid new persistence. Demote UI visible context to bounded selection/fallback where canonical project state exists.

### Evidence and Intelligence convergence
Use analytics-canon and other canonical evidence sources with explicit provenance/freshness/missingness. Reduce duplicated evidence bridges into projections/adapters while preserving specialist intelligence.

### Project / Content / Asset continuity
Maintain Project ↔ ContentBuild ↔ Asset identity across generation, Vault, Editor, packaging, approved publish and measured outcome. Prefer projections over copied package stores.

### Creator Operations convergence
Bring GenerationRecord, ActionPacket, ToolReceipt, render/generation/research operations and model/tool traces toward a shared operation identity without destabilizing live stores.

### Publishing continuity and recovery
Freeze approved publish intent, make retries idempotent/recoverable, reconcile remote YouTube state and preserve exact asset/metadata identity into outcome measurement.

### Outcome / Evaluation / Learning closure
Standardize producer contracts, evaluation targets/checkpoints, comparability and governed learning promotion across Publisher, Projects, Editor, Community, experiments and Brain actions.

### Editor / Asset / Outcome closure
Every final render should become a canonical versioned asset that can be selected for publishing and later attributed to measured outcomes.

### UI / Widget / Toolbox certification
Finish shared primitive migration, natural responsive behavior, truthful preview/empty/disconnected states and screenshot-driven certification without forcing unique tools into identical internal layouts.

### Brain and Prompt architecture convergence
Converge creator-facing AI on the stable Brain domain authority and Prompt specification. Remove AI-management work/status responsibilities from Brain docs; route continuity through Conversation OS, missions through Crown and exact state through Task Authority. Continue migration of direct legacy provider/generator paths, prompt-family/version coverage, context/evidence consistency, outcome/evaluation producers and governed learning. Preserve prompt inventory/reachability as machine projections rather than a second work ledger.

### Documentation / Agent operating system
Complete the Task Index VNext, Crown/Conversation OS integration, Documentation Registry, Removed Archive, lossless Consolidation Compiler, verification receipts and governed skill workflows.

### System convergence cleanup
Use KEEP / MERGE / PROJECT / ADAPTER / PAIR / QUARANTINE / REMOVE classifications. No removal before donor harvest, zero production reachability, parity/verification and rollback preservation.

## Program completion semantics

A workstream is not complete because implementation exists. It is complete when relevant capability maturity, acceptance and task-specific verification gates are satisfied and canonical Task Authority records support closure.

## Relationship to historical program material

The dated Finish Program, its backlog registry, the 100-item audit, and system-convergence classification remain donor/audit/work sources during migration. Their IDs become aliases or references to permanent VT task records rather than parallel status ledgers.


## Master-source input

`docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md` is a MASTER_SOURCE for discovering missing capabilities, stronger master-tool consolidation, external API/research workstreams, creator-workflow improvements, AI/video-generation opportunities, analytics/visualization ideas, infrastructure/economics considerations, and product-roadmap candidates.

Program work should reconcile its proposals against current code, Product Architecture, Domain Authorities, current API/provider reality, and Task Index state. Accepted work becomes CAP/VT/decision/program records; unaccepted ideas remain source material rather than hidden backlog commitments.


## Page-surface opportunity integration workstream

The canonical 80-item page opportunity catalog now lives in \`docs/architecture/PRODUCT_ARCHITECTURE.md#page-surface-feature-opportunity-registry\` under stable \`IDEA-*\` IDs for Dashboard, Studio, Projects, Analytics, Editor, Vault, Settings and User Guide.

This program treats those ideas as an **integration intake**, not a second task ledger. When one is activated:

- identify the existing CAP ID(s) and canonical owner(s);
- link the scoped Domain Authority and live code/registry anchor;
- prefer extension/projection/composition over a new backend store;
- preserve Project/ContentBuild/asset/operation/publication/outcome identity across handoffs;
- add exact implementation state to Task Authority rather than this document;
- require evidence → logic → UI → action/outcome where the feature claims intelligence or recommendations;
- update Guide teaching/projection when creator-visible behavior ships;
- record \`IDEA-*\` IDs in plans/PRs until promoted, merged, deferred, retired or shipped.

Cross-page ideas should be implemented as shared capability extensions whenever possible. In particular, Command Center/Briefing/Intelligence features should reuse BrainRuntime and Evidence & Intelligence; pipeline/project features should reuse Project/ContentBuild; asset features should reuse Asset Engine/Vault; analytics features should reuse VT-SYNC/analytics-canon; and activity/learning features should project existing operations/outcomes rather than create another ledger.


## Current-main backlog reconciliation plan

**Reconciliation baseline:** `76519e3d81f33df4a3084f49a369f5edbb1ee937` on 2026-09-27.  
**Mission:** `VT-MISSION-current-main-backlog-reconciliation`  
**Rule:** current main + focused tests/runtime evidence eliminate obsolete backlog claims before any item is promoted into Task Authority. Historical plans, conversation memory, old audits, branches and prototypes remain donor/evidence inputs, not competing status ledgers.

### Completed or absorbed work removed from the active implementation backlog

The following older plan items are no longer greenfield work and must not be re-created as new tasks merely because they still appear in dated audits or conversation summaries:

- **Projects reassembly and project creation:** current Projects is already organized around Project Builder, Project Board/Calendar and Storyboard Studio. Shared project selection, New Project creation, ContentBuild initialization, project tasks/goals, publishing-package projection and board-to-builder opening exist.
- **Projects duplicate level-0 shell/title implementation bug:** current source has explicit shell-ownership governance, embedded tools suppress their own level-0 chrome, and the Projects shell contract is covered by `ProjectsShellGovernance.test.ts`. Production screenshot verification remains a certification concern, not a request to rebuild the hierarchy.
- **Project ↔ ContentBuild / Video Package foundations:** durable ContentBuild identity, Project bridging, revision protection, versions/VariantGroups, Video Package synchronization, `GenerationRequest` and `ToolReceipt` foundations exist. Remaining work is continuity/certification at later lifecycle seams.
- **Approved publish contract and transaction binding:** `ApprovedPublishSnapshot` exists and `PublishTransaction` persists/binds the approved snapshot, uses an idempotency key, protects the final-render upload identity and persists YouTube identity as steps complete. Remove the old claim that the snapshot contract/runtime binding is absent. Retain durable server authority, remote reconciliation and failure/recovery certification as open work.
- **Brain runtime foundation:** shared `BrainRuntime` exists. Remaining Brain work is context/evidence/outcome/evaluation/learning convergence, surface integration and certification rather than creation of another Brain.
- **Resource Library base product:** `/resources`, the Resource Library UI, document renderer and contract coverage exist. Retain catalog/content/integration expansion; remove “create Resource Library page” as greenfield work.
- **Workspace/mobile preference controls:** compact mobile top bar, navigation auto-hide, edge swipe, thumb-zone shortcuts, orientation/page-position preservation, sticky module headers, keyboard restoration, toolbox-state memory, desktop keyboard navigation and quick-switcher preferences already have a canonical Settings surface. Retain runtime/mobile certification and any missing behavior, not duplicate settings construction.
- **Remotion 100-asset library:** the registered library contains and validates exactly 50 static + 50 motion assets with deterministic motion utilities, ratio support, gallery/contact-sheet/renderer integration and editor adapter. Remove the original “build 100 assets” item; retain only discovered quality/integration defects.
- **Video Director greenfield build:** the production Video Director surface, category schemas, project/recipe/scope stores, provider routing/job client and contract tests exist. Retain provider/runtime/mobile certification and specific capability gaps instead of rebuilding the tool.
- **Conversation/agent governance foundation:** Documentation Governance, Conversation & Improvement OS, Crown, Task Authority, Verification and Royal Exchange are active. Herald contracts are superseded migration donors. Do not create a second conversation/task/status system.
- **Page feature ideation intake:** the 80 page-surface opportunities are already preserved under stable `IDEA-*` IDs in Product Architecture and routed through this program. Do not duplicate them into another idea backlog.

### Surviving open work routed by canonical owner

| Work family | Keep as open | Canonical routing |
| --- | --- | --- |
| Projects UI | Convert lifecycle lanes/cards/filters where appropriate to canonical Subtoolbox primitives; finish New Project as a true Subtoolbox-style popover; define a Project Details projection/popover without reintroducing a second Project store/editor; certify current single-shell composition on mobile/desktop | Projects Domain Authority + Toolbox UI + Task Authority candidate |
| Project/Content lifecycle | Cross-surface identity continuity, completion/abandonment outcomes, later-stage asset/package/outcome continuity | Projects/ContentBuild Domain Authority + Integrated Program |
| Publishing | durable non-browser authority for approved snapshots/transactions, remote YouTube reconciliation, retry/recovery certification, post-publish identity and outcome writers | Publisher/ContentBuild/YouTube owners + Integrated Program |
| Brain / intelligence | evidence trace/explorer, editable knowledge, project-aware context, Opportunity evidence, unified outcomes/evaluation, governed learning, prompt/runtime reachability | Brain Domain Authority + Prompt Specification + Integrated Program |
| Analytics | metric comparability enforcement, dataset/dimension completeness, geography/retention/import joins, provenance/missingness UX, responsive Data Visual certification | Analytics Domain Authority |
| Toolbox/UI | remaining primitive migration, CSS ownership cleanup, responsive/accessibility/screenshot certification, portal/focus/dropdown correctness | Toolbox UI Domain Authority + Verification |
| Dashboard/widgets | Top-cohort certification, renderer/registry cleanup, CSS ownership, persistence migrations, evidence-backed opportunity/anomaly/operations surfaces | Widget Domain Authority |
| Vault / Asset Engine | remaining production lanes, import dedupe/provenance, media player/Quick Look, asset-slot and lineage closure, ContentBuild handoffs | Asset Engine Domain Authority + Vault handoff |
| Editor | canonical final-render asset, preview/final parity, four-layout/mobile certification, render progress/recovery, shared media/transcript/marker compounds | Editor Domain Authority |
| Video Manager / packaging | AI-assisted update workflow, optional title/thumbnail experiments, dirty/rollback/retry semantics, cross-surface parity and measured outcome linkage | Studio/Publishing/Brain owners |
| Auth / diagnostics | canonical auth/session/readiness errors, route regression closure, permanent diagnostics/copy-bug-report, authenticated mobile verification | Auth Domain Authority + Verification |
| Resource/Guide | expand curated creator resources, reference catalog and Guide projections as creator-visible capabilities ship | Resource Library handoff + User Guide authority |
| Documentation/agents | Task Index VNext, Removed Archive, no-loss consolidation manifests, stale-doc cleanup, branch/PR donor ledger, public agent readiness and governed receipts | Documentation Governance + Task Authority + Crown |

### Source disposition

Use the following sources as reconciliation inputs, not live status authorities:

- `docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` — DONOR/REVIEW until every unique item is harvested.
- `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md` — AUDIT snapshot; item status must be rechecked against current main before promotion.
- `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` and `tasks/viewtube-finish-program/**` — superseded/donor execution sources; preserve aliases and unique acceptance criteria.
- Conversation-derived backlog summaries — evidence/intake only; route accepted durable work through the owning authority and Task Authority.
- Old branches/PRs/prototypes — donor/evidence only unless current-main reconciliation proves a missing capability.

### Execution waves

1. **Inventory and dedupe.** Build one source manifest across the unfinished-work master, 100-item audit, Finish Program/backlog, active domain plans/handoffs, recent conversation backlog, active missions/PRs and relevant donor branches.
2. **Current-main proof pass.** For every candidate, classify `DONE_IN_CODE`, `IMPLEMENTED_NEEDS_VERIFICATION`, `PARTIAL`, `OPEN`, `SUPERSEDED`, `DUPLICATE`, `DONOR_ONLY` or `IDEA_ONLY`. A current-main symbol is not enough for DONE when runtime/visual/external evidence is required.
3. **Route surviving work.** Put cross-system dependencies here; bounded truth in the Domain Authority/Specification; exact work as Task Authority mutation proposals; durable tradeoffs in Decision records; evidence in Receipts; useful historical material in References/Donors.
4. **Task reconciliation.** Resolve the actual canonical Task Index VNext writer before mutation. Dedupe surviving candidates against permanent VT IDs, preserve historical aliases and propose lifecycle/maturity/evidence changes through Task Authority. Until the writer is positively resolved, remain read/reconcile/propose only.
5. **No-loss archive wave.** After harvested material, inbound-reference checks and runtime reachability checks, move superseded sources to `archive/removed/` with consolidation manifests. Never delete unique material because a newer document exists.
6. **Verification wave.** Reclassify implemented-but-unverified work using the Verification authority: focused tests/build for code, screenshot analysis for visible UI, authenticated runtime for external account/API behavior, deployment evidence for release claims.
7. **Automation.** Add deterministic reports for stale authority metadata, orphan task/document links, supersession chains, donor sources awaiting harvest and merged implementation lacking verification receipts. Generated reports remain projections, not a second task ledger.

### Immediate reconciliation priorities

The first Task Authority proposal batch should be limited to high-confidence surviving work after dedupe: publishing durability/recovery; post-publish identity/outcomes; Project page Subtoolbox/popover visual correction; application-wide responsive/visual certification; auth/diagnostics reliability; outcome/evaluation/learning closure; analytics comparability/provenance; and documentation/Task Index migration.

Do **not** reopen completed greenfield programs listed above. Do **not** promote every `IDEA-*` opportunity to a task. Do **not** archive the September donor/audit sources until their unique acceptance criteria, references and unresolved work have been harvested.
