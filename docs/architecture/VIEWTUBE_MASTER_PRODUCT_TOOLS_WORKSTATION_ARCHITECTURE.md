# ViewTube Master Product, Tools & Workstation Architecture

**Status:** CANONICAL LIVING COORDINATION RESOURCE — bounded cross-system product/tool architecture  
**Created:** 2026-09-25  
**Last updated:** 2026-09-25  
**Repository baseline at creation:** `f3898dc3f7199d7f0433b16641f618b9c6d04b36`  
**Scope owner:** cross-system creator lifecycle, Master Tool taxonomy, product-surface coordination, integration planning, widget/tool consolidation, product-level capability boundaries  
**Does not replace:** scoped authorities for Analytics/VT-SYNC, BrainRuntime, Projects/ContentBuild, Asset Engine, Toolbox UI, Dashboard Widget Registry, Editor, Auth, Deployment, User Guide, or Herald  
**Primary repository entrypoint:** `docs/README.md`  
**Documentation governance:** `docs/DOCUMENTATION_GOVERNANCE.md`

---

## 0. Authority boundary

This resource answers:

- What are the major creator jobs ViewTube should solve?
- Which product capabilities belong together as Master Tools?
- Which widgets are views into those tools rather than standalone products?
- Which canonical systems and code owners already exist?
- Where should a new capability integrate instead of creating duplicate stores, ledgers, runtimes, registries, or lifecycle models?
- Which ideas are buildable now, which are provider-dependent, and which should remain research hypotheses?

It **does not** redefine the internal contracts of the systems below. Their scoped authorities remain primary:

- Project / ContentBuild: `VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- Asset Engine: `VIEWTUBE_ASSET_ENGINE_MASTER_RESOURCE.md`
- Analytics / VT-SYNC: `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`
- Brain runtime: `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`
- AI systems management: `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`
- Toolbox UI: `VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md`
- Dashboard widget identity: `src/views/dashboard/WidgetRegistry.ts`
- Editor: `docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md`
- Deployment: `docs/deployment/VIEWTUBE_DEPLOYMENT_RELEASE_MASTER_RESOURCE.md`
- Herald repository governance: `agent/contracts/herald-*.md`

When this document conflicts with a scoped authority about that authority's internal behavior, the scoped authority and current code/tests win.

---

## 1. Executive product decision

Do not build the donor research as 50–100 independent mini-tools.

The strongest ideas describe one integrated creator operating system, but many proposed tools overlap, assume data or write-actions that YouTube does not expose publicly, or encode strategy opinions as if they were measurable platform facts.

ViewTube should consolidate them into a smaller set of deep **Master Tools** connected by shared canonical systems:

```
Channel / Workspace
        ↓
Project → ContentBuild → Publication
        ↓           ↓
      Assets      Experiments
        ↓           ↓
Analytics evidence → BrainRuntime → Recommendations / Actions
        ↓                               ↓
Outcome / evaluation / governed learning
```

Widgets are product views into these systems. They are not separate data owners.

---

## 2. Product principles

1. **One creator lifecycle, many surfaces.** Project identity survives from idea to publication to post-mortem.
2. **Deep modules, narrow interfaces.** Prefer a few powerful systems over dozens of disconnected tools.
3. **Evidence before scores.** Show component evidence, provenance and confidence before inventing composite grades.
4. **Current code beats old plans.** Historical branches and documents are donors, not automatic authority.
5. **No duplicate truth stores.** Reuse canonical Projects, ContentBuild, Asset Engine, VT-SYNC, analytics-canon, BrainRuntime, existing outcome/evaluation/learning owners and widget registries.
6. **Capability-check every provider action.** A planned UI action is not assumed to be an available API write.
7. **Human approval for high-impact actions.** Publishing, destructive writes, external contact, spending and other consequential operations require explicit permission policy.
8. **Mobile is a first-class workspace.** Master Tools must have deliberate portrait and landscape compositions.
9. **Empty states demonstrate value.** Disconnected/no-data states preview the tool's purpose instead of appearing broken.
10. **Every plan can become a testable vertical slice.** A feature is not considered integrated until data → logic → UI → outcome is connected.

---

## 3. Canonical domain vocabulary

| Term | Canonical meaning |
| --- | --- |
| Workspace | Team/tenant boundary containing channels, members, integrations, permissions, settings and billing. |
| Channel | Connected YouTube channel plus identity, authorization and ingestion state. |
| Idea | An uncommitted content opportunity or hypothesis. |
| Project | Creator-facing lifecycle container. |
| ContentBuild | Durable identity for one evolving piece of content across tools and stages. |
| Asset | Reusable media/document object with provenance and lifecycle relationships. |
| Research Signal | Sourced observation such as an analytics anomaly, audience question, competitor example or external trend. |
| Insight | Interpretation derived from signals, with evidence and confidence. |
| Recommendation | Proposed action linked to evidence; never silently treated as truth. |
| Experiment | Structured comparison of variants, exposure/observation periods and outcomes. |
| Publication | Platform-specific published/scheduled content instance. |
| Workflow | Durable job/state graph connecting actions, approvals, retries and integrations. |
| Tool | Coherent capability with a narrow contract. |
| Widget | Visual surface into a Tool or dataset. |
| Agent | AI actor operating through explicit tools, context, permissions and evidence. |
| Integration | Vendor/platform adapter implementing a ViewTube-owned interface. |
| Data Source | Authoritative origin of a datum, including API/report/version/window. |

---

## 4. Creator lifecycle taxonomy

Use one lifecycle vocabulary across Projects, Studio, Vault, Brain, widgets, tasks and analytics:

1. **Discover** — collect trends, anomalies, audience questions, competitor examples and opportunities.
2. **Validate** — test demand, channel fit, differentiation, evidence, cost and production feasibility.
3. **Design** — define brief, angle, hook, narrative, packaging hypothesis and success criteria.
4. **Produce** — script, storyboard, shot plan, generate/record media and coordinate resources.
5. **Assemble** — edit, caption, localize, quality-control and version media.
6. **Package** — titles, thumbnails, descriptions, chapters and presentation variants.
7. **Publish** — schedule, approve, disclose, upload and synchronize publication state.
8. **Engage** — comments, community, audience feedback, moderation and follow-up.
9. **Learn** — retention, traffic, experiments, outcomes, anomalies and post-mortems.
10. **Operate** — calendar, budgets, sponsors, integrations, permissions, usage and reusable knowledge.

---

## 5. The 12 Master Tools

### 5.1 Opportunity Radar

**Jobs:** Discover + Validate  
**Consolidates:** trend/outlier monitoring, competitor intelligence, keyword/topic gaps, audience-question mining, semantic/niche maps, opportunity cards.  
**Inputs:** canonical channel evidence, Research Signals, competitor/reference set, external research where permitted.  
**Outputs:** evidence-backed opportunities, confidence, missing evidence and suggested next validation action.  
**Current code/system anchors:** Opportunity evidence work in Brain/Finish Program; analytics-canon evidence; Dashboard widget system.  
**Guardrail:** do not expose an unexplained "virality score" as truth.

### 5.2 Channel Intelligence Hub

**Jobs:** Learn + Operate  
**Consolidates:** channel health, velocity, traffic, audience, geography, comparisons, revenue views, anomaly detection and drill-down.  
**Inputs:** VT-SYNC raw ingestion through analytics-canon normalized access.  
**Outputs:** insights, cohorts, alerts, evidence packs and post-mortem context.  
**Current anchors:** `src/services/analytics-canon/**`, VT-SYNC visible table definitions, Analytics master resource.  
**Guardrail:** no consumer invents a second analytics store.

### 5.3 Content Strategy Lab

**Jobs:** Validate + Design  
**Consolidates:** idea validation, content pillars, portfolio balance, audience jobs, series planning, briefs and evergreen/buffer strategy.  
**Inputs:** opportunities, channel knowledge, project constraints and historical performance.  
**Outputs:** approved Project brief, hypotheses and success criteria.  
**Integration:** creates/updates canonical Project + ContentBuild context.

### 5.4 Project & Production Command

**Jobs:** Design + Produce  
**Consolidates:** Project planning, Kanban, calendar/Gantt, batching, shot lists, resource scheduling, sponsor requirements, approvals, locations/equipment/release tasks.  
**Inputs:** brief, team/resources, schedule and production constraints.  
**Outputs:** executable lifecycle plan.  
**Current anchors:** Projects / ContentBuild living master, current Projects code and shared ContentBuild identity.

### 5.5 Script & Story Studio

**Jobs:** Design + Produce  
**Consolidates:** outline/script, hook variants, stress testing, dialogue/readability, production-logic checks, teleprompter, B-roll and shot suggestions.  
**Inputs:** Project brief, channel style, research evidence.  
**Outputs:** versioned script/story structure attached to ContentBuild.  
**Integration:** generation receipts/assets should flow through existing governed generation + Asset Engine/Vault paths.

### 5.6 Visual Development Studio

**Jobs:** Design + Produce  
**Consolidates:** storyboard, visual seeds, character/prop continuity, shot visualization, camera/lens/style plans and thumbnail ideation.  
**Outputs:** storyboards and visual references/assets with lineage.  
**Current anchors:** Asset Engine, Vault, Video Director and existing generation providers.

### 5.7 Vault & Asset Engine

**Jobs:** All lifecycle phases  
**Consolidates:** import station, batch upload, tagging, notes, editable metadata, smart filters, lineage, versions/options, transcripts, rights/provenance and project attachment.  
**Current anchors:** canonical Asset Engine + Vault implementation.  
**Rule:** Vault is a manifestation/operations surface over canonical asset concepts, not a parallel ContentBuild lifecycle store.

### 5.8 Video Director & Editor

**Jobs:** Produce + Assemble  
**Consolidates:** video generation, edit timeline, media player, captions, transitions, clip extraction, rendering and QC.  
**Current anchors:** Editor master resource, generation/video provider adapters, ContentBuild identity.  
**Outputs:** versioned edit/render assets tied to the active project.

### 5.9 Packaging & Experiment Lab

**Jobs:** Package + Learn  
**Consolidates:** title/thumbnail workspace, device previews, legibility/saliency analysis, variant history, experiments and result interpretation.  
**Inputs:** final/near-final content plus packaging variants.  
**Outputs:** packaging decision plus experiment evidence.  
**Guardrail:** native/official experiment capability must be checked before assuming automated platform testing.

### 5.10 Publisher & Distribution Center

**Jobs:** Publish + Engage  
**Consolidates:** metadata, scheduling, captions/localization, disclosure checks, upload state, social distribution adapters, launch checklist and approval gates.  
**Outputs:** Publication records and external distribution jobs.  
**Guardrail:** every write action is provider-capability checked.

### 5.11 Audience & Community Desk

**Jobs:** Engage + Learn  
**Consolidates:** comment triage, audience-question mining, themes/sentiment, moderation workflow and reply drafting.  
**Outputs:** prioritized engagement queue + Research Signals.  
**Rule:** qualitative audience themes remain probabilistic; do not infer private traits.

### 5.12 Monetization & Operations Hub

**Jobs:** Operate + Learn  
**Consolidates:** revenue/RPM analysis, sponsor deliverables, budgets, media kit, affiliate/commerce adapters, usage/cost controls.  
**Outputs:** operational/financial views with stated assumptions.  
**Guardrail:** high-impact spending or financial actions require explicit human approval.

---

## 6. Current code reality anchors

This section prevents the product architecture from drifting away from implementation.

| Concern | Current code/document anchor | Architectural rule |
| --- | --- | --- |
| Analytics normalized reads | `src/services/analytics-canon/index.ts`, contracts/evidence modules | All consumers use analytics-canon; do not read VT-SYNC internals directly. |
| Raw analytics ingestion | VT-SYNC Local + sync category/query infrastructure | Raw sync ownership remains VT-SYNC. |
| Dataset visibility | `VT_SYNC_VISIBLE_TABLE_DEFINITIONS` | Dataset IDs/status must come from canonical registry. |
| Project lifecycle | Projects / ContentBuild master | Reuse Project and ContentBuild; no second project identity. |
| Durable content identity | `src/services/asset-engine/ContentBuildRepository.ts` and related owners | One content lifecycle identity across tools. |
| Asset generation/storage | Asset Engine + Vault | Generated assets land with provenance and project relationship. |
| Brain reasoning | `src/services/brain/**` + Brain canonical contract | BrainRuntime orchestrates; it does not own analytics storage. |
| Outcome feedback | existing Brain/Algorithm outcome/evaluation/learning owners, including `BrainOutcomeLedger.ts` | Do not create another generic outcome ledger. |
| Dashboard widget identity | `src/views/dashboard/WidgetRegistry.ts` / registry base and certification | New widgets register through existing widget identity system. |
| Sync execution | `src/services/SyncCoordinator.ts`, VT-SYNC adapters/controllers | Controller UI reflects real dataset/job state. |
| Editor | Editor master + current editor bridge | Preserve Project/ContentBuild identity into editing/rendering. |
| Repository agent governance | Herald contracts and Finish Program | Repository agents update living docs/receipts; Herald is not creator BrainRuntime. |

### Reality rule

A future update to this document must label each major capability as one of:

- **IMPLEMENTED**
- **PARTIAL**
- **PLANNED**
- **DONOR ONLY**
- **PROVIDER DEPENDENT**
- **DEFERRED**
- **RETIRED**

No unlabeled prose should imply implementation.

---

## 7. Widget catalog: views, not separate products

Candidate views include:

- Mission Control Today / Channel Pulse
- Upload & Publication Calendar
- Anomaly Monitor
- Opportunity Radar Map
- Topic / Keyword Cluster Graph
- Competitor Outlier Board
- Research Evidence Stack
- Idea Validation Matrix
- Project Heatmap
- Kanban / Production Pipeline
- Batching Planner
- Sponsor Compliance Checklist
- Script Retention Map
- Hook Variant Comparator
- Storyboard Strip
- Shot List
- Vault Asset Grid
- Asset Lineage Inspector
- Video Player / QC Panel
- Render Queue
- Thumbnail Preview Matrix
- Thumbnail Saliency / Legibility View
- Packaging Variant Board
- Experiment Timeline
- Views × Impressions Scatter
- CTR / Impression Opportunity Quadrants
- Retention Curve + Segment Notes
- Traffic Source Explorer
- Search Terms Explorer
- Suggested / Related Network
- Shorts Performance Matrix
- Geography Map
- Device / OS Matrix
- Subscriber Status Comparison
- Revenue / RPM Explorer
- Comment Theme / Sentiment Queue
- Audience Question Miner
- Post-Mortem Report
- Learning Ledger view
- Brain Evidence Panel
- Agent Run Inspector
- Workflow Queue
- Integration Health
- Sync Controller + Progress
- Data Freshness / Quota Monitor
- Media Kit Preview
- Cost / Credit Usage

Dashboard production identity still belongs to the existing Widget Registry and certification system.

---

## 8. Analytics capability model

Never treat YouTube Analytics as arbitrary `dimension × metric`.

Create/use a versioned **Analytics Capability Registry**. Each report contract should record:

- provider/API family;
- owner/channel scope;
- OAuth requirements;
- valid dimensions;
- valid metrics;
- required filters;
- date/window rules;
- privacy thresholds;
- incompatibilities;
- quota/cost;
- freshness;
- null/partial semantics;
- fallback behavior;
- evidence/provenance metadata.

Important planning rules:

- targeted Analytics queries and bulk Reporting ingestion are complementary;
- `province` must not be treated as a generic worldwide "state/province" dimension;
- retention is a specialized report family, not a generic join;
- monetary metrics receive stronger permission handling;
- Studio-only UI data is not assumed to be available through a public API;
- unsupported browser scraping must not become a foundational dependency.

---

## 9. Data architecture

1. **Connectors** — OAuth-aware platform/provider adapters.
2. **Ingestion planner** — targeted query vs bulk sync, backfills, windows, cursors, retries and quota budgets.
3. **Raw landing** — immutable source payload/report plus request/schema/version/time/channel provenance.
4. **Normalization** — provider data → canonical entities without destroying raw provenance.
5. **OLTP** — projects, tasks, assets, experiments, permissions, workflows and current state.
6. **Analytics store** — historical facts/aggregates optimized for creator analysis.
7. **Event/job layer** — lifecycle transitions, syncs, agent runs, generation, publishing and experiments.
8. **Evidence layer** — observation → insight → recommendation → action → outcome.
9. **Knowledge/RAG** — scripts, transcripts, research and decisions; structured analytics remains structured truth.
10. **Agent tool gateway** — typed tools, workspace/channel scope, approval policy and idempotency.
11. **Observability** — run IDs, latency, failures, quota, freshness, cost and tool/agent audit.

---

## 10. Integration contracts

ViewTube owns the interfaces; providers implement adapters.

| Contract | Narrow responsibility |
| --- | --- |
| AnalyticsProvider | query verified report contract; bulk sync; advertise capabilities |
| PublishingProvider | create/update supported publication state; expose unsupported actions explicitly |
| StorageProvider | put/get/list/version/share asset |
| LLMProvider | structured generation/reasoning with usage + provenance |
| ImageProvider | generate/edit/upscale with lineage |
| VideoProvider | generate/render/status with stable job identity |
| VoiceProvider | synthesize/translate/dub with consent and voice identity metadata |
| SocialDistributionProvider | publish/schedule/status per-network |
| SignatureProvider | template/send/status/archive |
| CommerceProvider | products/links/attribution where permitted |
| AutomationProvider | triggers/actions/webhooks while ViewTube workflow remains canonical |

---

## 11. Brain and agent architecture

Brain Hub is a governed orchestration layer, not a prompt collection.

Every agent run should receive:

- channel + workspace scope;
- active Project / ContentBuild where relevant;
- allowed tools;
- budget/cost limits;
- evidence requirements;
- model/tool provenance;
- write/approval policy;
- failure and escalation behavior.

Core roles:

- Research Agent
- Analyst Agent
- Strategy Agent
- Script Agent
- Packaging Agent
- Production Agent
- Publisher Agent
- Community Agent
- Learning Agent

Recommendations carry evidence and confidence. Weak correlations must not silently become permanent channel rules.

---

## 12. Workstation information architecture

- **Mission Control** — today, health, alerts, active projects, upcoming publications, data/integration state.
- **Projects** — brief, research, script, storyboard, production, assets, package, publish, results.
- **Research Lab** — Opportunity Radar and saved evidence.
- **Analytics Lab** — validated analysis views.
- **Experiment Center** — variants, observations, decisions and learning.
- **Vault** — assets, import, search, tags, notes, lineage, versions.
- **Studio** — writing, visual development, Video Director and Editor.
- **Audience** — comments, themes, questions and engagement workflow.
- **Automations** — workflow templates, triggers, approvals and run history.
- **Brain Hub** — agent controls, evidence, recommendations and learning.
- **Settings/Admin** — integrations, permissions, security, costs, data and feature toggles.

Progressive disclosure:

- **Level 1:** decision/status card
- **Level 2:** expanded widget with evidence/filters
- **Level 3:** dedicated workbench with full controls/history/export

Do not hard-code generic eye-tracking heuristics such as an F-pattern as a universal layout law.

---

## 13. Security, privacy and governance

- least-privilege OAuth;
- encrypted credential/token storage;
- workspace/channel isolation in storage, cache, jobs and agent tools;
- explicit approval for destructive/external/high-impact writes;
- immutable audit trail;
- stronger permissions around monetary analytics;
- consent/provenance/revocation for voice and likeness assets;
- synthetic/generated-media disclosure state follows the ContentBuild;
- third-party data-retention and terms constraints are recorded;
- export/deletion propagates through structured, raw, vector and cached data.

---

## 14. Donor feature consolidation

| Donor concepts | Canonical destination | Disposition |
| --- | --- | --- |
| Trend monitor, virality alert, niche finder, keyword gap, sentiment mining | Opportunity Radar | MERGE |
| Brief builder, scorecards, content pillars, evergreen buffer | Content Strategy Lab | MERGE; evidence before scores |
| Script structurer, hook analyzer, stress tester, dialogue/logic/B-roll | Script & Story Studio | MERGE |
| Storyboard, visual seeds, continuity, shot/thumbnail visual research | Visual Development Studio | MERGE |
| Budget, crew, equipment, location, releases, batching, sponsor tracking | Project Command + Operations Hub | SPLIT BY DOMAIN |
| Cloud folders and asset organization | Vault & Asset Engine | MERGE |
| Summarizer, clip finder, captions, overdub, QC | Video Director & Editor | MERGE |
| Thumbnail/title tooling and A/B/C concepts | Packaging & Experiment Lab | MERGE + capability-check |
| Scheduling, metadata, captions, cross-post launch workflow | Publisher & Distribution | MERGE + capability-check |
| Comment triage, questions, sentiment | Audience & Community Desk | MERGE |
| Post-mortem, retention, traffic, geography, revenue views | Channel Intelligence Hub | MERGE |
| Brand matching, media kit, commerce/affiliate, ad operations | Monetization & Operations | KEEP SELECTIVELY |

---

## 15. Do not build yet / reframe

- Universal 1–100 "virality", "hook" or "viability" scores without calibration.
- Deterministic algorithm-priming recipes or exact ranking formulas.
- Arbitrary Analytics metric/dimension query builders.
- Worldwide province/state assumptions.
- Automated writes to YouTube surfaces that do not expose supported APIs.
- Browser-scraped Studio-private data as a core dependency.
- Automatic title/thumbnail rotation through fragile or policy-risky mechanisms.
- Outcome-based billing tied to claimed incremental YouTube revenue before attribution is defensible.
- Autonomous ad-spend changes without a dedicated validated Ads integration and approval.
- Psychographic certainty inferred from comments/transcripts.

---

## 16. Roadmap

### Foundation / MVP-A

- canonical tool/domain vocabulary;
- Analytics Capability Registry;
- channel OAuth/data sync foundations;
- Project + ContentBuild continuity;
- Vault / Asset Engine continuity;
- evidence/provenance;
- Sync Controller accuracy;
- Mission Control shell.

**Exit:** connected channel → supported sync → project → asset → evidence are traceable end-to-end.

### MVP-B

- Channel Intelligence Hub;
- Opportunity Radar;
- Content Strategy Lab;
- Project Command;
- Script Studio;
- Audience Desk;
- basic Publisher;
- Brain evidence-backed recommendations.

**Exit:** evidence → idea → brief → content work → publication → post-mortem remains one connected lifecycle.

### V1

- Packaging / Experiment Lab;
- Visual Development;
- Video Director / Editor integration;
- Monetization Ops;
- collaboration and approvals.

### V2 / Advanced

- richer cross-platform adapters;
- sophisticated agent orchestration;
- calibrated predictive models;
- advanced sponsor/commerce;
- advanced localization/dubbing.

---

## 17. Acceptance gates

Every new Master Tool, subtool or widget must pass:

1. **Purpose gate** — one named user decision/job.
2. **Ownership gate** — canonical data/system owner is named.
3. **Data gate** — source/API/report contract verified.
4. **Evidence gate** — AI claims have provenance/confidence.
5. **Permission gate** — read/write authority is explicit.
6. **Failure gate** — empty, stale, disconnected, quota, partial and provider-error states exist.
7. **Mobile gate** — portrait and landscape compositions are deliberate.
8. **Performance gate** — expensive work is lazy/asynchronous/resumable.
9. **Learning gate** — meaningful outcomes can feed existing learning/evaluation owners.
10. **Accessibility gate** — focus, keyboard, touch, labels, contrast and touch targets.
11. **Observability gate** — run IDs, provider usage, errors, latency and cost are inspectable.

---

## 18. Immediate implementation backlog

### P0

- map every existing ViewTube tool/widget/page to one Master Tool owner;
- generate the Analytics Capability Registry from verified contracts;
- unify Project, ContentBuild, Publication, Asset and Experiment identity handoffs;
- connect remaining anomaly/outcome/evaluation callers instead of creating replacements;
- keep Brain project/channel scoping consistent across surfaces;
- finish Sync Controller state accuracy/inclusion/window semantics;
- maintain an explicit current-code crosswalk in this document.

### P1

- Opportunity Radar vertical slice using canonical evidence;
- consolidate Project Planner donor features into Project & Production Command;
- finish Video Package → ContentBuild production synchronization where still incomplete;
- standardize useful empty/no-account widget preview states;
- expose Experiment Center + learning evidence before adding predictive scores.

### P2

- add voice/image/video/social/e-signature/commerce adapters only after their contracts, permissions and product value are stable.

---

# 19. Ten additional sections that would make this document substantially more useful

These are the recommended next additions. They are intentionally code-aware and living-document oriented.

## Idea 1 — Live Code Ownership Map

**What it adds:** a maintained table of each Master Tool → frontend routes/components → services → stores → registries → tests → canonical documents.

**Why it matters:** a future agent can see whether a concept already exists before creating another implementation.

**Suggested fields:** Master Tool, capability, code owner, files, current status, canonical contract, tests, last verified commit.

## Idea 2 — Cross-System Dependency & Data-Flow Graph

**What it adds:** explicit upstream/downstream relationships between Project, ContentBuild, Vault, Analytics, Brain, Publisher, Editor, experiments and outcomes.

**Why it matters:** makes hidden coupling visible and prevents a local feature from bypassing canonical owners.

**Maintain as:** Mermaid graph plus a machine-readable companion registry if needed.

## Idea 3 — Implementation Reality Matrix

**What it adds:** every major feature labeled IMPLEMENTED / PARTIAL / PLANNED / DONOR ONLY / PROVIDER DEPENDENT / DEFERRED / RETIRED.

**Why it matters:** eliminates ambiguity between brainstorms and production behavior.

**Rule:** status changes require a code/test/PR receipt.

## Idea 4 — Integration & API Capability Ledger

**What it adds:** per provider, list exactly what ViewTube can read/write, required scope, quota, webhook support, limitations, current adapter and fallback.

**Why it matters:** prevents product plans from assuming nonexistent YouTube or third-party APIs.

**Include:** YouTube Data, Analytics, Reporting, Ads where applicable, AI/image/video/voice vendors, storage, distribution, commerce and signing.

## Idea 5 — UI Surface / Route / Widget Crosswalk

**What it adds:** maps each capability to its actual page, toolbox/subtoolbox, dashboard widget, modal/popover and mobile composition.

**Why it matters:** turns architecture into a navigable product map and exposes duplicate UI.

**Link to:** Widget Registry and Toolbox/Component authorities rather than duplicating their detailed geometry.

## Idea 6 — Event, Contract & Handoff Matrix

**What it adds:** named events/contracts for Project transitions, generation receipts, asset creation, publication changes, analytics arrival, handoffs and outcomes.

**Why it matters:** integrations fail most often at system boundaries. This section makes those boundaries reviewable.

**Rule:** reuse existing event/ledger owners; do not create a second generic event bus or outcome store.

## Idea 7 — Verification, Test & Observability Index

**What it adds:** capability → unit/integration/e2e/visual tests → diagnostics → telemetry → last verified commit/PR.

**Why it matters:** converts "finished" from a prose claim into evidence.

**Include:** known unverified areas and tests blocked by infrastructure/rate limits.

## Idea 8 — Agent Responsibility & Automation Map

**What it adds:** which agent may read, recommend, generate, mutate, publish or spend; required tools, approvals and failure behavior.

**Why it matters:** makes Brain Hub and future automation safer and easier to reason about.

**Include:** repository-agent/Herald boundary so product agents and coding agents are never conflated.

## Idea 9 — Decision, Supersession & Change Ledger

**What it adds:** append-only decisions: date, decision, reason, evidence, supersedes, affected systems, PR/commit, follow-up.

**Why it matters:** prevents old plans from silently returning as "current" requirements and makes the document genuinely living.

## Idea 10 — Gaps, Opportunities & Next-Best-Work Board

**What it adds:** a prioritized editable list of missing integrations, duplicated tools, orphan systems, weak UX, unsupported API ideas and high-leverage vertical slices.

**Why it matters:** turns the document from reference material into an operating instrument.

**Suggested fields:** item, user value, current state, dependencies, risk, owner, evidence, next action, acceptance test, status.

---

## 20. Living-document maintenance protocol

### Before changing this resource

1. Read `docs/README.md` and `DOCUMENTATION_REGISTRY.md`.
2. Identify the scoped domain authority.
3. Verify the relevant claim against current `main` code/tests.
4. Search for duplicate tool/widget/system concepts.
5. Prefer linking to a canonical owner over copying its entire contract here.

### When adding a new tool/widget

Record:

- creator job;
- owning Master Tool;
- canonical data/system owners;
- frontend surface;
- inputs/outputs;
- provider/API dependencies;
- failure/empty states;
- mobile behavior;
- permission class;
- observability/tests;
- implementation status;
- evidence/PR/commit.

### When work lands

Update:

- implementation status;
- Code Ownership Map;
- dependency/event matrix if boundaries changed;
- test/verification index;
- decision/change ledger;
- next-best-work board.

### Never

- mark planned work as implemented without a receipt;
- duplicate a canonical store/runtime/ledger;
- promote a donor branch wholesale without current-main comparison;
- turn an external research claim into an internal platform invariant without evidence;
- delete historical documents before unique-content/reference review.

---

## 21. Source and evidence foundation

This resource began by consolidating two supplied creator-workstation/project-planner research reports, then reconciling their ideas with current ViewTube documentation and code ownership.

Repository evidence used at creation included:

- `docs/README.md`
- `docs/DOCUMENTATION_REGISTRY.md`
- `docs/VIEWTUBE_100_ITEM_CURRENT_MAIN_UNFINISHED_WORK_AUDIT_2026-09-25.md`
- `docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md`
- `docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`
- `docs/brain/VIEWTUBE_AI_SYSTEMS_MASTER_RESOURCE.md`
- `docs/brain/UNIFIED_AI_SYSTEM_CANONICAL_CONSOLIDATION_CONTRACT_2026-09-17.md`
- `src/services/analytics-canon/**`
- `src/services/asset-engine/ContentBuildRepository.ts`
- `src/services/brain/BrainOutcomeLedger.ts`
- `src/views/dashboard/WidgetRegistry.ts`
- `src/services/SyncCoordinator.ts`

This is not a substitute for re-verifying current code after later merges.

---

## 22. Update log

### 2026-09-25 — Initial repository version

- converted the research-derived architecture into a living Markdown resource;
- established authority boundaries;
- defined 12 Master Tools;
- anchored the plan to current code/system owners;
- added 10 recommended code-aware living-document sections;
- added a maintenance protocol to keep future edits grounded in current `main`.
