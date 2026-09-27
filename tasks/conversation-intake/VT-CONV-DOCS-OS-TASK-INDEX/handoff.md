# ViewTube Documents Structure Handoff

**Conversation ID:** VT-CONV-DOCS-OS-TASK-INDEX  
**Handoff ID:** VT-HANDOFF-DOCUMENTS-STRUCTURE  
**Produced:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Source Host:** ChatGPT  
**Reconciliation Status:** PARTIALLY_RECONCILED  
**Current Main at branch cut:** `57df0f760a3360a6b65d5b8e101dee633870848c`  
**Current handoff branch:** `docs/documents-structure-handoff-2026-09-27`

## 1. Purpose

This is the comprehensive handoff for the ViewTube documentation/governance/agent/task operating-system work developed through this conversation.

It exists so a new ChatGPT/Codex/Claude/agent can resume without rereading the full thread and without recreating systems that are already merged.

This document distinguishes:

- **MERGED / CURRENT** — in main and current unless newer code disproves it;
- **BRANCH / PR COMPLETE** — built and reviewed but not yet merged;
- **PLANNED / INCOMPLETE** — accepted direction that still needs implementation/reconciliation;
- **IDEA-ONLY** — retained idea, not committed work.

Conversation-local claims never outrank current code/tests/runtime evidence.

---

## 2. Executive readback

The documentation system has evolved from a loose collection of `MASTER` documents and plans into a governed development operating system with:

1. Documentation Governance;
2. Product Completion Constitution;
3. Product Architecture + Capability Registry;
4. Integrated Application Program;
5. Task Authority / planned Task Index VNext;
6. Domain Authorities / Specifications;
7. Conversation & Improvement OS;
8. Crown / Royal Exchange mission coordination;
9. Verification authority;
10. Long-conversation Handoff + Work Reconciliation;
11. Convergence Governance;
12. Capability Homes / Plan Families / Ideas Library / Workflows / Control Room;
13. Removed Archive + no-loss consolidation manifests;
14. MASTER_SOURCE strategic prior-art tier.

The core rule is:

`current code/tests/runtime → canonical task/evidence state → bounded authorities/programs → plans/conversations/donors`

The newer convergence rule is:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`

New parallel systems/plans/tools/workflows are the final option, not the default.

---

## 3. Current repository / PR history

### Merged foundation work

- **PR #462 — merged**  
  Documentation system foundation + Product Completion/Product Architecture/Integrated Application + Deep Research MASTER_SOURCE.  
  Merge commit: `e657cefe83f3f66d5a8316543814d9d18197b338`.

- **PR #464 — merged**  
  Conversation OS + Crown + Task Authority; Herald demoted.  
  Merge commit: `82460536651d1de368e09a2fb685a335cd27f312`.

- **PR #481 — merged**  
  Brain / Prompt authority consolidation.  
  Merge commit: `4f10cca0928985ea7a5b2ca9a09f26d7500331a4`.

- **PR #503 — merged**  
  Conversation Handoff + Work Reconciliation system.  
  Merge commit: `e5bbb56fee503c26a1251c6e3643307af12c4632`.

- **PR #500 — closed / DONOR**  
  Became stale/unmergeable. Do not reopen or force merge.

- **PR #506 — merged replacement for #500**  
  Recovered #500's unique 22 completion fronts, critical path, activation rule, MASTER_SOURCE relationship, and missing authority links without overwriting newer work.  
  Merge commit: `1ce551f61da0468e07cd06e768dc224c1e908d0c`.

- **PR #513 — merged**  
  Convergence Governance + Capability Homes + Plan Families + Master Ideas Library + workflow/control-room system.  
  Merge commit: `57df0f760a3360a6b65d5b8e101dee633870848c`.

### PR #513 verification state

Passed:
- production-build;
- focused-contracts;
- source-governance;
- local-smoke.

Failed in inherited/untouched application code:
- static-quality / typecheck;
- full-suite.

These failures are not caused by the governance/docs branch. Exact inherited debt is listed later in this handoff.

---

## 4. Canonical authority hierarchy

### 4.1 Documentation Governance
**Path:** `docs/governance/DOCUMENTATION.md`

Owns:
- document classes;
- authority rules;
- registry/metadata;
- supersession;
- no-loss consolidation;
- Removed Archive policy;
- source/donor handling;
- document creation/update rules.

Key rule:
> one primary authority per bounded concern.

### 4.2 Product Completion Constitution
**Path:** `docs/architecture/PRODUCT_COMPLETION_CONSTITUTION.md`

Owns:
- what complete/coherent ViewTube means;
- product-wide completion standards;
- system invariants;
- strategic completion requirements;
- quality principles lower plans cannot contradict.

Replaces the former "One Goal" role.

### 4.3 Product Architecture
**Path:** `docs/architecture/PRODUCT_ARCHITECTURE.md`

Owns:
- what ViewTube consists of;
- creator lifecycle;
- Master Tools;
- durable capability topology;
- system/domain ownership boundaries.

Replaces the old giant Master Product Architecture role.

### 4.4 Capability Registry
**Path:** `docs/architecture/capabilities.json`

Accepted capabilities currently include:

- `CAP-CREATOR-CONTEXT`
- `CAP-EVIDENCE-INTELLIGENCE`
- `CAP-PROJECT-CONTENT-IDENTITY`
- `CAP-ASSET-LINEAGE`
- `CAP-CREATOR-OPERATIONS`
- `CAP-OUTCOME-LEARNING`
- `CAP-BRAIN-EXPERIENCE`
- `CAP-ANALYTICS-CANON`
- `CAP-EDITOR-RENDER`
- `CAP-PUBLISH`
- `CAP-WIDGET-SURFACES`
- `CAP-DOCUMENT-GOVERNANCE`
- `CAP-VERIFICATION`

### 4.5 Integrated Application Program
**Path:** `docs/programs/INTEGRATED_APPLICATION.md`

Owns:
- cross-system convergence;
- integration workstreams;
- dependency order;
- completion fronts;
- critical path;
- missing seams;
- application-level coordination.

It is **not** the exact task ledger.

Replaces the former dated Finish Program role.

### 4.6 Task Authority
**Path:** `docs/governance/TASK_AUTHORITY.md`

Owns:
- permanent task identity;
- canonical lifecycle mutation;
- dedupe/merge/supersession;
- evidence-gated DONE;
- task aliases;
- task proposals;
- Task Index mutation semantics.

Until Task Index VNext lands, Task Authority still lacks the final repo-native canonical writer/storage.

### 4.7 Domain Authorities / Specifications

Important current domain authorities include:

- Brain: `docs/domains/BRAIN.md`
- Prompts: `docs/specifications/PROMPTS.md`
- Prompt inventory: `docs/specifications/prompt-registry.json`
- Analytics/VT-SYNC: `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`
- Projects/ContentBuild: `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- Asset Engine: `docs/architecture/VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
- Editor: `docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md`
- Widgets/Dashboard: `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md`
- Toolbox UI: `docs/architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- Auth current authority: `SIMPLE_AUTH_V1.md` where referenced by current repo; dated simplification plan is historical design rationale.

### 4.8 Verification
**Path:** `docs/governance/VERIFICATION.md`

Owns:
- evidence required before completion;
- test/runtime/visual/deployment/auth verification expectations;
- completion proof semantics.

### 4.9 Conversation & Improvement OS
**Path:** `docs/governance/CONVERSATION_OS.md`

Owns:
- conversation continuity;
- prior-art reconciliation;
- proactive improvement recommendations;
- context selection;
- natural user-facing interaction;
- agent continuity.

Internal sequence:

`ORIENT → RESOLVE → RECONCILE → INSPECT → IMPROVE → PLAN → ACT → VERIFY → RECORD → RECOMMEND`

### 4.10 Crown
**Path:** `docs/governance/CROWN.md`

Owns substantial mission coordination.

Roles:
- KING — desired-state/product architecture coordination;
- EMPEROR — executable-state/repository coordination;
- TASK AUTHORITY — canonical task mutation;
- ARCHIVIST — documentation/lineage;
- VERIFIER — completion evidence;
- DOMAIN SPECIALISTS — bounded execution;
- CREATOR — consequential product/permission/billing/publishing/irreversible decisions.

Royal Exchange is coordination/provenance, not Task Index.

### 4.11 Conversation Handoffs
**Path:** `docs/governance/CONVERSATION_HANDOFFS.md`

Owns:
- long-thread handoff;
- conversation work logs;
- reconciliation review;
- promotion/merge/archive routing.

Workspace:
`tasks/conversation-intake/<conversation-id>/`

### 4.12 Convergence Governance
**Path:** `docs/governance/CONVERGENCE.md`

Owns:
- anti-splintering rules;
- capability-centered routing;
- plan families;
- prior-art gates;
- similarity/convergence;
- ideas routing;
- work packets;
- capability coverage;
- reusable workflows;
- improvement log;
- generated control-room projection.

### 4.13 MASTER_SOURCE
**Key source:** `docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md`

Role:
- privileged strategic prior art;
- mandatory idea/resource mining source;
- does **not** override code, current authorities, or Task Index.

---

## 5. Current documentation classes

Use explicit role nouns instead of casually creating more "MASTER" docs.

Current classes/roles include:

- CONSTITUTION
- PRODUCT_ARCHITECTURE / ARCHITECTURE
- PROGRAM
- DOMAIN_AUTHORITY
- SPECIFICATION
- TASK_LEDGER / Task Authority data
- REFERENCE
- MASTER_SOURCE
- DONOR
- EVIDENCE
- RECEIPT
- PROTOTYPE
- GENERATED
- HISTORICAL
- SUPERSEDED
- ARCHIVE

A document title containing MASTER/CANONICAL/AUTHORITY alone does not make it authoritative. The registry and bounded concern decide authority.

---

## 6. Naming and metadata rules

Settled user preference:

- living document filenames should be clear, short and descriptive;
- avoid dates in living canonical filenames;
- every important living document should show:
  - Production Date;
  - Last Edited;
  - Class;
  - Status;
  - Concern;
  - Owner;
  - Registry ID where applicable;
  - Last Audited Main SHA.

Historical/donor files may retain dated names for provenance.

---

## 7. Document creation / consolidation rules

Before creating a new plan/document/system:

1. resolve capability ID(s);
2. read capability home;
3. identify plan family;
4. check Task Authority;
5. check Integrated Application Program;
6. check owning Domain Authority/Specification;
7. check Ideas Registry;
8. check conversation-intake packages;
9. check active branches/PRs/missions;
10. inspect current code/tests where implementation is claimed;
11. check relevant MASTER_SOURCE/donor material;
12. record Existing Work Checked;
13. choose:
   `EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`.

New filenames are not evidence of new concerns.

When multiple versions/plans overlap:
- choose one survivor;
- harvest every unique requirement, code reference, test, decision, UI idea and acceptance criterion;
- create/update Plan Merge record;
- preserve provenance;
- move obsolete source to Removed Archive only after no-loss verification.

---

## 8. Product architecture knowledge

### Creator lifecycle

Canonical product lifecycle remains:

`Discover → Validate → Design → Produce → Assemble → Package → Publish → Engage → Learn → Operate`

### 12 Master Tools

1. Opportunity Radar
2. Channel Intelligence Hub
3. Content Strategy Lab
4. Project & Production Command
5. Script & Story Studio
6. Visual Development Studio
7. Vault & Asset Engine
8. Video Director & Editor
9. Packaging & Experiment Lab
10. Publisher & Distribution Center
11. Audience & Community Desk
12. Monetization & Operations Hub

### Six-system convergence model

1. Creator Context & Knowledge
2. Evidence & Intelligence
3. Project / Content / Asset Graph
4. Creator Operations & Generation
5. Outcomes, Evaluation & Learning
6. Brain Runtime & Experience

Global end-to-end loop:

`data → VT-SYNC → analytics-canon → evidence → BrainRuntime → Project+ContentBuild → generation/assets → package → editor → publish → analytics → outcomes/evaluation → governed learning`

---

## 9. Important system invariants

- Missing ≠ zero.
- Synthetic ≠ live.
- Cached data cannot authorize privileged operations.
- Client feature gating is advisory.
- Recommendation/proposal ≠ execution receipt.
- Brain evidence → reviewed action → mutation/project → render → publish are separate stages.
- Current measured evidence outranks stale learning.
- Model inference never silently becomes confirmed creator preference.
- Publishing/external mutation stays behind its owning approval path.
- Prototype/demo/vision ≠ production implementation.
- Passing build alone ≠ complete.
- Filename recency ≠ completion.
- Plan existence ≠ implementation.
- Static "unused" evidence alone ≠ safe deletion.
- One writer per governed path when agents are coordinating.

---

## 10. Verification / completion rules

After code changes, agents should verify the work with the strongest applicable evidence:

- focused tests;
- typecheck/build;
- runtime/browser interaction;
- authenticated flows where relevant;
- desktop screenshots;
- mobile screenshots;
- portrait/landscape screenshots when layout changes;
- console/network checks;
- deployment verification;
- persistence/reload/import/export checks for stateful features;
- rollback/recovery checks for migrations;
- real YouTube API read/write/sync when relevant.

Visible UI work is not considered fully verified from code/tests alone.

Screenshot analysis should check:
- clipping;
- overflow;
- hidden/cutoff controls;
- wrong typography;
- primitive drift;
- broken mobile states;
- inaccessible touch targets;
- unexpected black strokes/text;
- incorrect focus/default modes;
- spacing/grid misalignment.

---

## 11. Conversation handoff / work reconciliation model

For substantial long-running threads:

`tasks/conversation-intake/<conversation-id>/`
contains:

- `handoff.md`
- `worklog.json`
- `review.md`

Conversation-local states include:
- PLANNED
- STARTED
- PARTIAL
- COMPLETED_IN_CONVERSATION
- VERIFIED_IN_CONVERSATION
- BLOCKED
- ABANDONED
- DISCOVERED

These do **not** mutate Task Index automatically.

Reconciliation dispositions include:
- ALREADY_TRACKED
- MERGE_INTO_EXISTING_TASK
- CREATE_TASK_CANDIDATE
- UPDATE_INTEGRATED_APPLICATION_PROGRAM
- UPDATE_PRODUCT_ARCHITECTURE
- UPDATE_DOMAIN_AUTHORITY
- UPDATE_SPECIFICATION
- UPDATE_EXISTING_PLAN
- MERGE_PLANS
- CREATE_PLAN
- CREATE_DECISION_RECORD
- CREATE_OPPORTUNITY
- CREATE_RISK
- ATTACH_RECEIPT_EVIDENCE
- ARCHIVE_AS_DONOR
- NO_ACTION_REQUIRED
- REJECT

---

## 12. Convergence Governance knowledge

### Current merged implementation

PR #513 merged:

- `docs/governance/CONVERGENCE.md`
- capability homes for all 13 accepted capabilities;
- plan-family registry;
- plan-merge registry;
- code-ownership registry;
- open-questions registry;
- reusable workflow registry;
- skill/workflow map;
- improvement recommendation log;
- capability-coverage projection;
- generated convergence control room;
- Universal Work Packet schema/contract;
- similar-record detector;
- idea-consolidation tooling;
- Convergence Governance skill;
- Ideas Curator skill.

### Convergence rule

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`

Similarity scores are advisory; no-loss review decides merges.

---

## 13. Master Ideas Library

Current merged structure:

`ideas/`
- `README.md`
- `registry.json`
- `MASTER_IDEAS.md`
- `lists/`
  - governance
  - product
  - ui-ux
  - ai
  - analytics
  - editor-video
  - workflows
  - infrastructure

Source lists are preserved as provenance.

`ideas/registry.json` is the normalized unique-idea registry.

`ideas/MASTER_IDEAS.md` groups unique ideas by category/subcategory and target.

The first source list contains 50 governance ideas.

### Implemented governance ideas

Merged through PR #513:

1. Capability Home Pages
2. Plan Families
3. Automatic Similar-Plan Detection
4. Mandatory Existing Work Checked
5. Universal Work Packet
6. Capability IDs Everywhere
7. Plan Merge Records
8. Feature Idea Registry
9. Idea-to-Capability Routing
10. Code Ownership Map
37. Open Questions Queue
43. Capability Coverage Audit
46. Reusable Workflow Registry
47. Skill-to-Workflow Mapping
48. Improvement Recommendation Log
49. Unified Development Control Room
50. Convergence-First Governance Rule

The duplicated request for item 37 was treated as one implementation.

---

## 14. Task Index legacy donor knowledge

The old Task Index is highly valuable donor material and should not be discarded.

Primary donors used in this conversation:

- `ViewTube-Task-Index-Canonical-AI-Efficient-Debug-VT14-2026-08-28(1).html`
- `ViewTube-Task-Index(5).html`

Conversation-local comparison found:

- older donor: 1,297 unique tasks;
- newer donor: 1,542 unique tasks;
- newer donor adds 245 tasks;
- no older task IDs were lost in the newer donor;
- only a small number of shared task records materially changed;
- backend compact references were embedded in `AI_BACKEND_REFERENCE`;
- stable `vt-####` identity is valuable and should be preserved.

Legacy statuses must be imported as historical claims only.

A donor task saying "Finished" does **not** become canonical DONE without current evidence.

The old HTML's strong features worth preserving:
- stable IDs;
- module taxonomy;
- search/filter/sort;
- Quick Wins;
- statuses/debug notes;
- code/resource links;
- local backup/import/export behavior;
- AI backend reference cache;
- provenance/debug log concepts.

---

## 15. Task Index VNext — PLANNED / INCOMPLETE / TOP PRIORITY

Task Authority exists, but its final repo-native ledger/writer still needs to be completed.

### Intended Task Index VNext model

One logical Task Index with structured repo-native storage.

Recommended fields:
- id
- title
- type
- domains
- capabilityIds
- Master Tool
- creator lifecycle
- primary owner
- impacted domains
- lifecycle
- evidence state
- priority
- maturity axes
- dependencies
- blocks
- relationships
- aliases
- source/provenance
- acceptance
- verification needed
- next action
- updatedAt

### Primary lifecycle

Suggested:
- CANDIDATE
- ACCEPTED
- READY
- IN_PROGRESS
- BLOCKED
- VERIFYING
- DONE
- DEFERRED
- REJECTED
- SUPERSEDED

### Evidence state

- UNKNOWN
- CLAIMED
- PROVEN

### Maturity axes

- Architecture
- Backend
- Frontend
- Integration
- Tests
- Runtime
- Responsive
- Documentation
- Release

### Task relationships

- parentOf
- dependsOn
- blocks
- duplicateOf
- supersedes
- relatedTo
- implementsCapability
- closesGap
- derivedFrom

### Writer rules

Task Authority should be the single canonical mutation interface.

Agents/humans submit:
- task candidates;
- mutation proposals;
- evidence receipts.

DONE should require:
- acceptance criteria;
- required verification;
- PROVEN evidence appropriate to the task.

### Conversation-local prototype evidence

A Phase E scratch implementation was built/tested during this conversation but was not successfully landed in the repository.

Reported scratch results:
- 1,542 donor tasks imported;
- 35 module shards;
- 228 aliases;
- ~230 backend task references;
- all imported tasks marked reconciliation-required;
- focused core/storage tests green;
- read-only Task Index control room rendered;
- mobile horizontal overflow found and fixed;
- Task mutation touched only affected shard + manifest/ledgers.

Treat these as **design/prototype evidence**, not current repo implementation.

Phase E must be rebuilt/revalidated from current main and donor sources before canonical use.

---

## 16. Crown / Task Index relationship

Crown:
- Mission;
- Work Order;
- Decision;
- Artifact;
- Receipt;
- Handoff;
- Conflict.

Task Index:
- permanent task identity;
- lifecycle/status;
- dependencies;
- evidence/maturity;
- exact canonical work state.

Royal Exchange:
- mission/work-order/receipt/decision provenance.

Do not make Crown a second Task Index.

Task Index VNext should become the repo-native default for Crown reporting instead of requiring an external local HTML path.

---

## 17. Brain / Prompt consolidation knowledge

Current:
- `docs/domains/BRAIN.md`
- `docs/specifications/PROMPTS.md`
- `docs/specifications/prompt-registry.json`

Brain owns creator-facing AI reasoning/orchestration.

It does **not** own:
- repository-agent conversation continuity;
- task status;
- Crown missions;
- analytics truth;
- Project truth;
- asset identity;
- publishing transactions;
- documentation governance.

Prompt system target:
`Prompt Constitution + task family + task-specific context recipe + creator/project personalization + current evidence + output schema + deterministic validators + bounded repair`

Legacy direct model/provider/generator paths remain implementation migration debt.

---

## 18. Deep Research / Ultimate Construction MASTER_SOURCE

The uploaded deep-research/construction document is considered unusually valuable strategic prior art.

Current governed location:
`docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md`

Use it for:
- feature/tool ideas;
- agent/tool integrations;
- AI/video-generation research;
- capability discovery;
- architecture alternatives;
- future opportunities.

Do not treat it as runtime truth or override current owners.

---

## 19. 22 cross-system completion fronts recovered from PR #500

These are program-level unfinished objectives, not exact tasks:

1. Brain / AI convergence
2. Creator Context / profile / style
3. Evidence / Intelligence
4. Project / ContentBuild continuity
5. Asset Graph / Vault
6. Creator Operations
7. Outcome / evaluation / learning
8. Packaging / experiments
9. Publishing / recovery
10. Analytics / VT-SYNC
11. Widgets / Dashboard
12. Toolbox / primitives / CSS
13. Studio creation tools
14. Editor / Remotion
15. Audience / Community
16. Auth / account / diagnostics
17. User Guide / Resource Library
18. Documentation / Conversation OS
19. CI / verification debt
20. Branch / donor cleanup
21. Standalone prototype promotion
22. Universal workflow handoffs

These should be decomposed into Task Index work after Phase E rather than duplicated into another backlog.

---

## 20. Critical-path sequence

Recovered and merged through PR #506:

1. **Foundation truth**  
   auth/account → VT-SYNC → analytics-canon → evidence provenance.

2. **Canonical identity**  
   Creator Context + Project + ContentBuild + Asset/Version + Operation identity.

3. **Brain convergence**  
   BrainRuntime + Prompt System + specialist intelligence + governed context/evidence.

4. **Creator production continuity**  
   Projects → Studio generation → Vault/Asset Engine → Editor/Remotion → Packaging.

5. **External execution**  
   approved publish → retry/recovery/reconciliation → YouTube binding.

6. **Learning closure**  
   post-publish analytics → outcomes → evaluation → learning promotion → future Brain decisions.

7. **Surface certification**  
   Toolbox/primitives/widgets/mobile/accessibility/Guide/diagnostics verified across vertical slices.

8. **Cleanup**  
   quarantine/remove legacy paths only after donor harvest, parity, reachability and rollback preservation.

---

## 21. Legacy / donor / archive status

The following important sources are superseded/donor/historical and still need lossless Removed Archive processing where not already completed:

- `docs/DOCUMENTATION_GOVERNANCE.md`
- `docs/architecture/VIEWTUBE_ONE_GOAL_COMPLETION_OPERATING_SYSTEM.md`
- `docs/architecture/VIEWTUBE_MASTER_PRODUCT_TOOLS_WORKSTATION_ARCHITECTURE.md`
- `docs/architecture/VIEWTUBE_FINISH_PROGRAM_2026-09-24.md`
- `docs/architecture/VIEWTUBE_SYSTEM_CONVERGENCE_AND_CONSOLIDATION.md` — donor until all useful program content is harvested
- `docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md`
- `agent/contracts/herald-in.md`
- `agent/contracts/herald-out.md`
- `agent/contracts/herald-workflow.md`
- `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`
- `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`
- `docs/brain/VIEWTUBE_PROMPT_SYSTEM_AUTHORITY_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_IMPROVEMENT_PROGRAM_2026-09-24.md`
- `docs/brain/VIEWTUBE_PROMPT_REGISTRY_2026-09-24.json`
- `docs/brain/ai-systems/DOCUMENT_CONSOLIDATION_REGISTER_2026-09-24.md`
- historical auth simplification plan where superseded by `SIMPLE_AUTH_V1.md`
- superseded Vault implementation plans after their durable architecture/work has been harvested

Do not physically remove/archive any source until:
- inbound references checked;
- unique material accounted;
- runtime consumers checked;
- canonical survivor updated;
- rollback/provenance preserved.

---

## 22. Inherited CI / application debt discovered during documentation PR verification

These are not documentation-system regressions, but they are real unresolved application work and should become Task Index candidates during Phase F.

### Static-quality / TypeScript debt observed

Examples include:
- `src/app/superToolViewRegistry.ts` — PublishingScheduleArchitect component typing;
- `src/components/CommentResponder.tsx` — StudioIconButton children typing;
- `src/components/brain/BrainRuntimePanel.test.tsx` — incomplete provenance-chain fixture;
- `src/components/crown/CrownLiveBrain.tsx` — possibly undefined variations/results/events;
- `src/components/studio-hub/StudioHubPrimitiveMigrationCatalog.tsx` — VaultAssetModule props drift;
- `src/components/subtoolbox/SubToolboxMediaPrimitives.tsx` — onVolumeChange prop type conflict;
- `src/components/subtoolbox/SubToolboxSplitPrimitives.test.tsx` — globalThis typing;
- Editor design-library templates — palette/signature mismatches;
- `src/services/brain/__tests__/BrainConversationController.test.ts` — stale conversation-thread shape;
- `src/views/CreatorVaultOS.tsx` — data-table column key typing.

### Full-suite debt observed

Examples include:
- Vault workspace customization expectations;
- VT-SYNC manual-import snapshot behavior;
- analytics visual contract expectations;
- BrainHub project-context assertions;
- dashboard shared color ownership still finding `border-black`;
- `assistantIntelligenceSystem.ts` undefined/filter failure affecting LongformOptimizationWidget tests;
- WidgetPrimitives footer class expectation drift.

### External deployment issue

Vercel has repeatedly reported build-rate-limit/account-plan failures even when GitHub production-build passes.

Track deployment-account limits separately from code regressions.

---

## 23. COMPLETE PLANNED / INCOMPLETE WORK LIST

### P0 — next continuation

#### A. Finish this documents-structure handoff
- verify branch;
- open PR;
- merge if clean;
- keep this handoff as the first read for future documentation-structure sessions.

#### B. Phase E — Task Index VNext
Highest-priority missing governance capability.

Needs:
- current-main branch;
- donor import;
- repo-native canonical structured storage;
- Task Authority writer;
- append-only evidence/history;
- permanent ID allocation;
- status/evidence/maturity model;
- alias preservation;
- generated read-only control room;
- Crown default reader;
- import/export/backup;
- donor archive provenance;
- tests;
- browser/visual verification;
- PR/receipt.

#### C. Phase F — global work reconciliation
After Task Index VNext exists:
- reconcile Integrated Application Program;
- reconcile 100-item unfinished-work audit;
- reconcile dated Finish Program/backlog registries;
- reconcile Brain/Prompt remaining work;
- reconcile Vault plans;
- reconcile Editor plans;
- reconcile Analytics plans;
- reconcile Widget/Toolbox plans;
- reconcile Auth plans;
- reconcile Projects/ContentBuild plans;
- reconcile recent conversation-intake packages;
- allocate/merge permanent VT tasks without duplication.

### P1 — Convergence Governance maturation

PR #513 establishes the framework, but the registries need real-world population/certification.

#### Capability coverage
For all 13 capabilities, populate/verify:
- exact Task refs;
- focused tests;
- UI surfaces;
- User Guide refs;
- verification receipts;
- code ownership confidence.

Do not fabricate missing coverage.

#### Code ownership
Convert `PARTIAL` ownership records to `VERIFIED` only after:
- source/reachability audit;
- tests;
- current callers;
- domain-owner confirmation.

Do not enforce uncertain ownership in CI yet.

#### Plan families
Populate family membership with actual:
- plans;
- handoffs;
- audits;
- donor docs;
- prototypes;
- Task IDs;
- merge records.

#### Similarity
Tune similarity thresholds using real plan/idea corpora.
Consider domain-specific thresholds only after evidence.

#### Control room
Extend generated control room to include:
- Task Index VNext;
- Crown Missions;
- Work Orders;
- PRs;
- Decisions;
- Risks;
- evidence/receipts;
- verification debt;
- stale plans;
- unresolved merges.

Keep it a projection, never a database.

### P1 — Conversation handoff system maturation

- migrate scattered Editor/Toolbox/Vault/domain handoff/update-log patterns toward the global system;
- add deterministic schema validation for intake packages;
- add unreconciled-package report;
- add cross-conversation similarity detection;
- decide whether a generated handoff/reconciliation dashboard is useful;
- preserve specialized domain evidence without preserving duplicate protocols.

### P1 — Documentation health / archive

- audit all registered docs for stale SHA metadata;
- find unregistered docs;
- detect competing ACTIVE concerns;
- detect broken supersession chains;
- detect orphan plans;
- detect stale authority links;
- complete no-loss consolidation manifests;
- move obsolete sources to `archive/removed/` after safety checks;
- preserve original hashes/commit identities.

### P1 — Herald / compatibility retirement

- remove/replace remaining Herald compatibility readers/scripts;
- ensure agent registries no longer present Herald as current;
- migrate any remaining useful state/projection to Conversation OS/Crown/Task Authority;
- prove zero required reachability before removal.

### P1 — Brain / Prompt implementation migration

Documentation authority is consolidated; application migration remains:
- direct legacy provider/generator callers;
- model-gateway migration;
- prompt-family/version coverage;
- outcome/evaluation producer coverage;
- active Project/Opportunity evidence coverage;
- metric comparability guard;
- duplicate evidence/context bridge cleanup;
- governed learning closure.

### P1 — 22 completion-front execution

Decompose the 22 fronts into permanent Task Index tasks after Phase E.
Do not create a second global backlog document.

### P1 — inherited CI debt

Create Task Index candidates for the inherited static/full-suite failures listed above.
Group by shared root cause where possible instead of one task per assertion.

---

## 24. IDEA-ONLY BACKLOG — NOT COMMITTED WORK

The remaining 33 ideas in `ideas/registry.json` are preserved but should not become tasks automatically.

11. Bidirectional Code ↔ Document Links
12. Change Impact Graph
13. Unified Before Building Gate
14. Convergence Inbox
15. Conversation Work Harvester
16. Cross-Conversation Similarity Review
17. Plan-to-Task Compiler
18. Task-to-Plan Backlinks
19. Task Completion Feedback Into Plans
20. Plan Maturity Model
21. Feature Cluster Documents
22. Debugging Family Records
23. Root-Cause Promotion
24. Fix Once / Prevent Everywhere Rule
25. Duplicate-Code Detection Reports
26. Simplification Proposals
27. Removal Governance
28. Quarantine Registry
29. Implementation Family Graphs
30. Architecture Simplification Scoreboard
31. Integration Seam Registry
32. Handoff Contract Library
33. Universal Provenance Envelope
34. Shared Decision Registry
35. Decision Conflict Detection
36. Assumption Registry
38. Verification Debt Registry
39. Evidence Bundles
40. Screenshot Certification Records
41. Document Health Audit
42. Plan Health Audit
44. Agent Context Builder
45. Just-in-Time Documentation Retrieval

Review them through Convergence Governance before promotion.

---

## 25. Six current open governance questions

From the merged Convergence Governance baseline:

1. What is the final canonical repo-native Task Index storage/writer shape?
2. Should capability home pages become fully generated or remain partly hand-authored?
3. What code-ownership confidence is required before CI may enforce path ownership?
4. Should the Unified Development Control Room remain generated documentation or become an application route?
5. Should similarity thresholds differ by domain or remain globally configured?
6. What review gate promotes an accepted idea into a permanent Task Candidate?

These are questions, not tasks, until accepted resolution work exists.

---

## 26. Reusable workflow baseline

Current reusable workflows include:

- Feature Build
- Bug Fix
- Plan Consolidation
- Document Consolidation
- Prototype Promotion
- Legacy Migration
- Long Conversation Handoff
- Capability Change
- Visible UI Ship
- Release Verification

Workflows orchestrate skills; they do not own product truth.

---

## 27. Skills / agent procedures to know

Important current skills include:

- `viewtube-document-system`
- `viewtube-main-document-editor`
- `viewtube-document-consolidation`
- `viewtube-conversation-os`
- `viewtube-conversation-handoff`
- `viewtube-conversation-work-reconciliation`
- `viewtube-crown`
- `viewtube-task-authority`
- `viewtube-task-artifact-bridge`
- `viewtube-ai-system-governor`
- `viewtube-convergence-governance`
- `viewtube-ideas-curator`
- domain-specific Editor/Widget/Toolbox/etc. skills.

Skill rule:
> use the narrowest current skill(s) that match the bounded work; do not create a new skill when an existing workflow/skill can absorb the job.

---

## 28. Conversation OS recommendation responsibilities

The user explicitly wants Conversation OS to proactively recommend:

- better code architectures;
- simplification/stabilization;
- bugs;
- dead code;
- performance improvements;
- UX/mobile/accessibility improvements;
- easier/natural user flows;
- current AI-agent best practices;
- current AI models/providers;
- video-generation systems;
- Remotion improvements;
- UI/design-system improvements;
- repositories/libraries/tools/MCPs/plugins;
- CI/developer-experience improvements;
- documentation improvements;
- security/cost/reliability risks;
- plan/document/skill/workflow/prototype creation when justified.

Current external technologies must be verified before being named/adopted.

Recommendations first become ideas/improvement records unless accepted work already exists.

---

## 29. Do not redo

Do not recreate:

- One Goal as a new authority;
- dated Finish Program as a new authority;
- Master Product mega-document;
- Herald as current protocol;
- AI Systems Management as a separate work ledger;
- dated Brain/Prompt authorities;
- a second Task Index;
- a second conversation backlog;
- a second Ideas Registry;
- per-domain duplicate handoff systems;
- arbitrary new "MASTER" docs;
- parallel capability owners because a new conversation uses different naming.

Do not:
- import old task statuses as canonical;
- delete donor docs from static-unused evidence;
- archive before unique-content accounting;
- use conversation memory as the only record of unfinished work;
- mark visible UI complete without screenshots/runtime checks.

---

## 30. Exact next action

1. Merge this handoff update.
2. Start a fresh **Task Index VNext Phase E** branch from latest `main`.
3. Read this handoff first.
4. Read:
   - `docs/governance/TASK_AUTHORITY.md`
   - `docs/governance/CONVERGENCE.md`
   - `docs/programs/INTEGRATED_APPLICATION.md`
   - legacy Task Index donor files.
5. Rebuild/revalidate the Phase E prototype as repo-native canonical work.
6. Open/verify/merge Phase E PR.
7. Begin Phase F global reconciliation.
8. Use Task Index VNext to turn the 22 completion fronts + inherited CI debt + accepted plan-family work into deduped permanent tasks.
9. Continue Removed Archive/document-family consolidation after task identity is stable.

---

## 31. Handoff references

**Work log:**  
`tasks/conversation-intake/VT-CONV-DOCS-OS-TASK-INDEX/worklog.json`

**Review:**  
`tasks/conversation-intake/VT-CONV-DOCS-OS-TASK-INDEX/review.md`

**Documentation registry:**  
`docs/registry.json`

**Capability registry:**  
`docs/architecture/capabilities.json`

**Capability homes:**  
`docs/capabilities/`

**Plan families:**  
`governance/convergence/plan-families.json`

**Ideas:**  
`ideas/registry.json`  
`ideas/MASTER_IDEAS.md`

**MASTER_SOURCE:**  
`docs/references/DEEP_RESEARCH_CONSTRUCTION_SOURCE.md`

**Integrated Program:**  
`docs/programs/INTEGRATED_APPLICATION.md`

**Task Authority:**  
`docs/governance/TASK_AUTHORITY.md`

**Conversation OS:**  
`docs/governance/CONVERSATION_OS.md`

**Convergence Governance:**  
`docs/governance/CONVERGENCE.md`

**Verification:**  
`docs/governance/VERIFICATION.md`

---

## 32. Final status

The documentation/governance system is now substantially established and merged.

The most important missing piece is **Task Index VNext**.

Once Phase E is complete, the next major operation is **global reconciliation**: convert fragmented historical plans, audits, handoffs, bugs, branches, prototypes and conversation work into one deduped task/capability/plan-family model while preserving every useful idea and source.
