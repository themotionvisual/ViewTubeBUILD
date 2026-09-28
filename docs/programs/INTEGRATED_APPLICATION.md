# ViewTube Integrated Application Program

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-27  
**Class:** PROGRAM  
**Status:** ACTIVE  
**Concern:** permanent cross-system convergence, integration seams, dependencies, and critical-path completion  
**Owner:** Integrated Application Program  
**Registry ID:** DOC-PROGRAM-INTEGRATED  
**Last Audited Main SHA:** 3ed2bc91f324338fd110a160d65ddbed93806142
**Supersedes:** archive/removed/docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md after migration certification  
**Consolidates:** system convergence program relationships while preserving its detailed classification/task sources  
**Related Authorities:** docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md; docs/architecture/PRODUCT_ARCHITECTURE.md; docs/governance/CONVERSATION_OS.md; docs/governance/DOCUMENTATION.md; docs/governance/TASK_AUTHORITY.md; docs/governance/VERIFICATION.md; docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md; Task Index

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

### Toolbox promotion + workflow-chain convergence
Keep the Dashboard as an instrument panel rather than a collection of permanently expanded mini-applications. Complex surfaces should use a compact widget for status/selection/resume plus a Toolbox workstation for multi-stage editing, generation, provenance, comparison, history and cross-tool routing. Reuse canonical domain owners rather than synchronizing private widget/tool state.

The subordinate specification is `docs/specifications/TOOLBOX_PROMOTION_AND_WORKFLOW_CHAINS.md`. It consolidates the current oversized-widget audit, twenty promotion/workbench candidates and forty creator workflow recipes. The recipes are orchestration prior art, **not forty automatic tasks**. Shared implementation should converge on the reusable seams first: widget→Toolbox context/resume, registry handoff metadata, ActionPacket/operation identity, Project/ContentBuild/asset/evidence continuity, chain inspection, outcome/evaluation closure and responsive certification.

Initial pilot chains are Thumbnail Refresh Experiment, Comment→New Video, Editor Missing-Shot Recovery, 72-Hour Launch Review and Missing Asset Finder. Their task-workspace proposal lives at `tasks/toolbox-workflow-convergence/`; permanent VT task IDs remain gated by Task Authority.

### Brain and Prompt architecture convergence
Converge creator-facing AI on the stable Brain domain authority and Prompt specification. Remove AI-management work/status responsibilities from Brain docs; route continuity through Conversation OS, missions through Crown and exact state through Task Authority. Continue migration of direct legacy provider/generator paths, prompt-family/version coverage, context/evidence consistency, outcome/evaluation producers and governed learning. Preserve prompt inventory/reachability as machine projections rather than a second work ledger.

### Conversation handoff and work reconciliation
Use the global Conversation Handoff specification and `tasks/conversation-intake/` workspace to prevent long ChatGPT/Codex/Claude threads from losing or duplicating development work. Every substantial handoff should capture completed, partial, planned, blocked, abandoned and discovered work, then reconcile it against current main, Task Index, this Program, Product Architecture, Domain Authorities, existing plans/handoffs and active PRs. Similar plans/features/tools/widgets/pages/processes should be grouped into plan families and merged into a surviving plan/authority after unique-content harvest. Domain-specific update-log/handoff conventions should migrate toward the global process where doing so does not lose specialized evidence.

### Documentation / Agent operating system
Complete the Task Index VNext, Crown/Conversation OS integration, Documentation Registry, Removed Archive, lossless Consolidation Compiler, verification receipts and governed skill workflows.

### System convergence cleanup
Use KEEP / MERGE / PROJECT / ADAPTER / PAIR / QUARANTINE / REMOVE classifications. No removal before donor harvest, zero production reachability, parity/verification and rollback preservation.


## Cross-system completion front routing map

**Recovered source:** PR #500 (`docs/incomplete-work-program-reconciliation`), reconciled against current main `e5bbb56fee503c26a1251c6e3643307af12c4632`.  
**Authority boundary:** This is a program-level routing map, not a second task ledger. Each front must still be reconciled against current code, the owning Domain Authority, Task Authority, active PRs/branches and verification evidence before exact work is committed.

PR #500 could no longer merge after newer governance/program work landed, but it contained useful cross-system synthesis not fully represented elsewhere. The unique material is preserved here while newer current-main backlog reconciliation remains authoritative for item-level activation.

### Completion fronts

| Completion front | Program-level unfinished objective | Canonical routing / owner |
|---|---|---|
| Brain / AI convergence | Finish migration from overlapping context, evidence, intelligence, generation and legacy provider paths into BrainRuntime + Creator Context + Evidence & Intelligence, with provenance, prompt/version coverage and governed learning. | `docs/domains/BRAIN.md`; `docs/specifications/PROMPTS.md`; Product Architecture systems 1, 2, 5 and 6 |
| Creator Context / profile / style | Resolve channel knowledge, creator profile, style, goals, active Project/ContentBuild and current surface context without creating another persistence universe. | Creator Context & Knowledge; Projects/ContentBuild authority |
| Evidence / Intelligence | Make analytics evidence, audience evidence, anomaly/opportunity/algorithm/statistical interpretation share provenance, freshness and missingness while preserving specialist modules. | Evidence & Intelligence; Analytics/VT-SYNC authority |
| Project / ContentBuild continuity | Make Project planning and durable ContentBuild identity survive every handoff through research, generation, Vault, Editor, packaging, publishing and outcome measurement. | Projects/ContentBuild authority |
| Asset Graph / Vault | Complete canonical asset identity, lineage, versions, variants, selection, usage history, import/batch flows, search and Project/ContentBuild relationships; keep Vault as the management experience over Asset Engine semantics. | Asset Engine authority + Vault handoff |
| Creator Operations | Converge GenerationRecord, ActionPacket, ToolReceipt, render/research/generation/tool traces toward shared operation identity and reusable handoffs. | Creator Operations & Generation system |
| Outcome / evaluation / learning | Close recommendation → approval → action → receipt → outcome → evaluation → learning, including user ratings/rejections and post-publish analytics, without silent memory mutation. | Outcomes, Evaluation & Learning system |
| Packaging / experiments | Preserve title, thumbnail, metadata and package variants as attributable experiments; connect native/external tests to measured outcomes and learning. | Packaging/Experiment capabilities + Publisher + Analytics |
| Publishing / recovery | Complete approved-package freezing, idempotent retry, remote reconciliation, schedule/publish recovery and exact asset/metadata attribution. | Publishing owner + Integrated Application |
| Analytics / VT-SYNC | Finish canonical dataset/window ownership, traffic/geography/retention coverage, CSV augmentation, missing-data truthfulness and the combined Sync Controller/Progress experience. | Analytics/VT-SYNC authority |
| Widgets / Dashboard | Promote prototypes only through the canonical registry/shell/certification path; finish six-state behavior, mobile density, shared intelligence/provenance and consolidation of overlapping widgets. | Dashboard Widget authority |
| Toolbox / primitives / CSS | Finish canonical CSS ownership, input/focus/dropdown/split-left behavior, intrinsic mobile geometry, accessibility and screenshot certification; remove feature-local geometry conflicts after parity. | Toolbox UI authority + Studio component-library authority |
| Studio creation tools | Complete Video Manager, Video Director, Thumbnail/Packaging, Publisher and related creator tools as Project/ContentBuild-aware surfaces rather than independent stores. | Product Architecture + Projects + Asset Engine + Brain + Toolbox |
| Editor / Remotion | Finish mobile editor composition, timeline/mini-map, transition system, deterministic Remotion asset library, Vault/Asset integration and render → asset → publish continuity. | Editor authority + Asset Engine |
| Audience / Community | Unify comments, audience requests, audience intelligence and content-feedback loops through canonical evidence and outcomes; remove expensive/redundant fetch paths. | Evidence & Intelligence + Community capabilities |
| Auth / account / diagnostics | Stabilize the simplified Google/YouTube account/session architecture, mobile sign-in persistence, proxy/API behavior and production diagnostics before dependent workflows are treated as complete. | Simple Auth authority + integration diagnostics |
| User Guide / Resource Library | Finish creator-facing algorithm/recommendation education, analytics metric/dimension education, workflow recipes, contextual help, feature discovery and Resource Library integration from governed registries. | User Guide authority + Resource Library handoff |
| Documentation / Conversation OS | Finish Task Index VNext, registry coverage, Removed Archive migration, no-loss consolidation compiler, governed receipts and reusable skills so agents share one work state. | Documentation Governance + Conversation OS + Crown + Task Authority |
| CI / verification debt | Reduce baseline test/type/lint failures so regressions are trustworthy; make runtime interaction, responsive screenshots and visual analysis mandatory for visible completion. | Verification authority + scoped domain tests |
| Branch / donor cleanup | Harvest unique code/docs/prototypes before branch deletion; classify KEEP/MERGE/PROJECT/ADAPTER/PAIR/QUARANTINE/REMOVE and preserve rollback lineage. | Documentation Governance + Task Authority + owning domains |
| Standalone prototype promotion | Rebuild or promote prototypes using canonical primitives/tokens/contracts; treat visual donor HTML as reference until production integration and certification are proven. | Toolbox/Widget/Domain authorities |
| Universal workflow handoffs | Standardize context/artifact/evidence/operation handoffs so Brain, Projects, Vault, Studio, Editor, Publisher and Analytics can exchange work without copied state. | Integrated Application + canonical convergence systems |

### Critical-path sequence

The completion fronts reinforce the existing program loop. Preferred dependency order:

1. **Foundation truth:** auth/account → VT-SYNC → analytics-canon → evidence provenance.
2. **Canonical identity:** Creator Context + Project + ContentBuild + Asset/Version + Operation identity.
3. **Brain convergence:** BrainRuntime + Prompt System + specialist intelligence + governed context/evidence.
4. **Creator production continuity:** Projects → Studio generation → Vault/Asset Engine → Editor/Remotion → Packaging.
5. **External execution:** approved publish → retry/recovery/reconciliation → YouTube binding.
6. **Learning closure:** post-publish analytics → outcomes → evaluation → learning promotion → future Brain decisions.
7. **Surface certification:** Toolbox/primitives/widgets/mobile/accessibility/Guide/diagnostics verified across complete vertical slices.
8. **Cleanup:** quarantine/remove legacy paths only after donor harvest, parity, reachability checks and rollback preservation.

### Activation rule

A remembered, donor-derived or conversation-derived item becomes committed work only through:

`observation/source → reconcile current main → identify CAP/owner → check Task Authority → classify NEW/CONTINUATION/DUPLICATE/SUPERSEDES/EXPANDS/BUG/VERIFICATION → create or update canonical task → implement → verify → receipt → authority update if durable meaning changed`

This preserves historical planning value without allowing memory, old PRs or donor documents to become competing implementation truth.

### Master-source relationship

The original ViewTube Master Plan is preserved as `docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md` with MASTER_SOURCE status. Its strategic principles remain prior art; this Program promotes only reconciled cross-system implications and never treats speculative source material as shipped behavior.


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

- `archive/removed/docs/VIEWTUBE_UNFINISHED_WORK_MASTER_RESOURCE_2026-09-11.md` — DONOR/REVIEW until every unique item is harvested.
- `archive/removed/docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md` — AUDIT snapshot; item status must be rechecked against current main before promotion.
- `archive/removed/docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md` and `tasks/viewtube-finish-program/**` — superseded/donor execution sources; preserve aliases and unique acceptance criteria.
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
