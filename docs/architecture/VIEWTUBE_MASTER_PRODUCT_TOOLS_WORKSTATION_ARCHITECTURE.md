> **MIGRATION NOTICE — 2026-09-26:** Product/capability architecture moved to `docs/architecture/PRODUCT_ARCHITECTURE.md` and `docs/architecture/capabilities.json`. This source remains intact below for consolidation lineage and pending archive.

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

# 19. Live Code Ownership Map

**Audit baseline:** 52f655a5d3cb5bc2d16fc8a285a8b129bb3b9f1a

This map is the product-level answer to “where does this capability actually live?” It is intentionally narrower than a full file inventory. Scoped domain masters remain responsible for their internal details.

| Master Tool | Current production anchors | Current status | Verification / authority |
| --- | --- | --- | --- |
| Opportunity Radar | Dashboard Widget Registry; opportunity-radar registration/certification; Brain opportunity/anomaly evidence; analytics-canon evidence | PARTIAL / VERIFYING | src/views/dashboard/WidgetRegistry.ts; src/views/dashboard/__tests__/opportunityRadarRegistration.test.ts; One-Goal VT-004 |
| Channel Intelligence Hub | VT-SYNC Local; analytics-canon; Data Visual contracts; analytics widgets | IMPLEMENTED FOUNDATION / MIGRATION ACTIVE | src/services/analytics-canon/**; docs/analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md |
| Content Strategy Lab | Projects/ContentBuild context; BrainRuntime; opportunity evidence; project briefs/goals | PARTIAL | Project/ContentBuild master; Brain master; current Projects UI |
| Project & Production Command | ProjectBuilder; ProjectCreationDialog; ProjectContentIdentityService; ProjectContentBuildBridge; Board/Calendar | IMPLEMENTED FOUNDATION / ACTIVE CONSOLIDATION | docs/architecture/VIEWTUBE_PROJECTS_CONTENTBUILD_WORKFLOW_MASTER_RESOURCE.md |
| Script & Story Studio | Hook Generator; script tooling; Brain/provider generation paths; GenerationRequest/ToolReceipt | PARTIAL | src/services/asset-engine/GenerationWorkflow.ts; prompt/Brain authorities |
| Visual Development Studio | Asset Engine; Vault; Video Director; generated media assets/receipts | PARTIAL | Asset Engine master; Video Director project store; generation contracts |
| Vault & Asset Engine | /vault; Asset Engine facade; ContentBuildRepository; Vault services; recent Asset Operations/Text Editor/Import Tags work | IMPLEMENTED FOUNDATION / ACTIVE UX EVOLUTION | Asset Engine master; current Vault code/tests |
| Video Director & Editor | /editor; Video Director; renderJobContract; render/export asset paths | PARTIAL / VERIFYING | Editor master; One-Goal VT-029–031 |
| Packaging & Experiment Lab | ab-thumbnail widget; ContentBuild selections/versions; packaging fields; experiment/evaluation owners | PARTIAL | Widget Registry; Asset Engine; outcome/evaluation owners |
| Publisher & Distribution Center | VideoPublisher; PublishingPackageProjection; ApprovedPublishSnapshot contract; PublishTransaction | PARTIAL / HIGH-PRIORITY HARDENING | One-Goal VT-002, VT-014–018; Asset Engine/Projects masters |
| Audience & Community Desk | Community post controller; comment/community widgets; handoff/action rules | IMPLEMENTED FOUNDATION / PARTIAL OUTCOMES | creator-engagement controller; Dashboard Widget Registry; One-Goal VT-009 |
| Monetization & Operations Hub | Revenue/RPM analytics widgets; monetary analytics evidence; sponsor/ops planning | PARTIAL / PROVIDER DEPENDENT | analytics-canon + widget registry; product-level provider capability checks required |

### Ownership update rule

When a capability moves:

1. update its scoped authority first;
2. update this table to the new owner;
3. update route/widget/contract/test crosswalks below;
4. attach the PR/commit receipt in the Decision Ledger;
5. do not preserve a second “temporary” owner after migration is complete.

---

# 20. Cross-System Dependency & Data-Flow Graph

## 20.1 Canonical creator loop

Channel / Workspace  
→ Project  
→ ContentBuild  
→ Research / Script / Assets / Packaging  
→ Publishing Package  
→ Approved Publish Snapshot  
→ Publish Transaction  
→ YouTube binding / Publication  
→ VT-SYNC / analytics-canon evidence  
→ Brain / evaluation  
→ outcome + governed learning  
→ future channel/project context

Parallel production path:

Project + ContentBuild  
→ GenerationRequest + ContextManifest  
→ provider/tool execution  
→ ToolReceipt  
→ Asset Engine / Vault  
→ selection/version/finalization  
→ Editor / Publisher

Internal orchestration path:

Evidence + Project context  
→ BrainRuntime  
→ recommendation / ActionPacket  
→ destination ViewTube tool  
→ creator decision  
→ domain action  
→ outcome/evaluation

## 20.2 Boundary matrix

| Producer | Boundary / contract | Consumer | Bypass risk |
| --- | --- | --- | --- |
| Project UI | ProjectContentIdentityService / ProjectContentBuildBridge | ContentBuild | duplicate or missing project identity |
| Video Package | VideoPackageContentBuildBridge | ContentBuild / packaging | stale package identity or selections |
| Brain / generation tool | GenerationRequest + ContextManifest | provider/tool runtime | missing context/provenance/cost lineage |
| Generation runtime | ToolReceipt | Asset Engine / BrainTrace | orphan outputs and unverifiable generations |
| BrainRuntime | ActionPacket / handoff | destination tool | Brain duplicates domain logic or mutates externally |
| Asset Engine | version/selection relationships | Editor / Publisher | wrong variant reaches final output |
| Publishing projection | PublishingPackageProjection | approval/publisher | mutable late edits leak into execution |
| Approval | ApprovedPublishSnapshot | PublishTransaction | retry sees different approved inputs |
| PublishTransaction | YouTube binding / receipts | ContentBuild | duplicate upload or broken post-publish lineage |
| VT-SYNC | analytics-canon | Dashboard / Brain / evaluations | multiple analytics truths |
| Domain action | BrainOutcomeLedger / domain outcome owner | evaluation | creator preference confused with measured performance |
| Evaluation | governed learning candidate | Channel Knowledge | correlation promoted as durable truth |

### Dependency rule

New work must join an existing boundary whenever one exists. A UI event or localStorage key may support an implementation, but it is not automatically a canonical cross-system contract.

---

# 21. Implementation Reality Matrix

This matrix translates architecture prose into current-main reality. Status follows the vocabulary defined earlier in this resource.

| Capability | Reality status | Evidence on current main | What remains |
| --- | --- | --- | --- |
| Canonical Project → ContentBuild identity | IMPLEMENTED | ProjectContentIdentityService, ProjectContentBuildBridge, Projects master | broader certification and legacy cleanup |
| Video Package scoped to ContentBuild | IMPLEMENTED FOUNDATION | package repository/bridge and current master | certify every production caller/handoff |
| Asset versions, variant groups and selections | IMPLEMENTED | ContentBuildRepository + Asset Engine/Vault tests | surface consistency and readiness UX |
| GenerationRequest / ContextManifest / ToolReceipt | IMPLEMENTED FOUNDATION | GenerationWorkflow.ts + focused tests | migrate remaining direct/legacy generation paths |
| Dashboard widget registry | IMPLEMENTED | 68 registered widget IDs in current Widget master | certification/backend quality varies by widget |
| Opportunity Radar evidence | PARTIAL / VERIFYING | registered widget + evidence feed work | finish one reusable canonical opportunity evidence path |
| Analytics canonical consumer API | IMPLEMENTED FOUNDATION | analytics-canon | legacy selectors/cache consumers still need retirement |
| Intelligence dataset boundary | IMPLEMENTED | 34 active canonical intelligence datasets; registry v1 tracks report definitions | dataset expansion/real-account validation continues |
| Metric comparability policy | PARTIAL / VERIFYING | One-Goal VT-001 | integrate into evaluation + visual/experiment consumers |
| Sync/Data Visual controller migration | PARTIAL | shared controllers/canvas contracts exist | controllerSpec/legacy preview/mark-scale cleanup |
| ApprovedPublishSnapshot contract | PARTIAL / VERIFYING | immutable schema/hash landed in PR #420 | durable persistence and runtime binding |
| PublishTransaction snapshot binding | PLANNED / NOT STARTED | explicit One-Goal task | bind retries/recovery to immutable approved identity |
| Post-publish ContentBuild checkpoint chain | PLANNED / NOT STARTED | One-Goal VT-017–018 | YouTube binding + analytics checkpoint → evaluation |
| Generic outcome/evaluation infrastructure | IMPLEMENTED FOUNDATION | BrainOutcomeLedger and existing evaluation/learning owners | production writers across Publisher/Projects/Community/Editor/Experiments |
| Editor final-render ContentBuild identity | PARTIAL / VERIFYING | renderJobContract carries contentBuildId; final asset path under certification | parity + four-layout/runtime certification |
| Vault asset operations | IMPLEMENTED FOUNDATION | /vault + canonical asset services + recent organization/editor work | continue UX consolidation without parallel lifecycle state |
| Cross-system correlation/idempotency envelope | PLANNED / READY | One-Goal VT-005 | define reusable envelope before adding producer writers |
| Structured failure taxonomy | PLANNED | One-Goal VT-036 | auth/API/sync/AI/render/publish error contract |
| External provider expansion | PROVIDER DEPENDENT | adapter/generation contracts exist | capability, cost, permission and data-rights validation per provider |

### Status rule

A document, test, registry entry or type definition alone does not prove runtime reachability. “IMPLEMENTED” should mean a production path reaches the capability; otherwise use PARTIAL or PLANNED.

---

# 22. Integration & API Capability Ledger

This ledger records ViewTube integration posture, not a substitute for official provider documentation. Before enabling a new external write, verify the provider’s current official API, scopes, quotas, terms and account eligibility.

| Provider / integration class | ViewTube use | Read / write posture | Current owner / adapter direction | Product rule |
| --- | --- | --- | --- | --- |
| YouTube Data API | channel/video metadata, upload/publishing-related operations where supported | READ + SELECTIVE WRITE | auth + YouTube/publishing services | capability-check every write; unsupported Studio surfaces stay manual/workflow-only |
| YouTube Analytics API | targeted authorized analytics | READ ONLY | VT-SYNC / analytics-canon | only verified report contracts; missing is not zero |
| YouTube Reporting API | bulk/historical report ingestion | READ ONLY | VT-SYNC ingestion/report registry | use for compatible bulk jobs; keep targeted Analytics queries for interactive needs |
| Google Ads / paid media | optional campaign/financial workflows | PROVIDER DEPENDENT | not a core product owner yet | never auto-spend from organic signals; separate scopes + approvals |
| LLM / Gemini-class providers | reasoning/generation | EXTERNAL COMPUTE | BrainModelGateway/provider layer | creator UI must not bypass governed provider layer |
| Image generation providers | thumbnails/concepts/assets | EXTERNAL GENERATION | ImageProvider-style adapter + Asset Engine | store output provenance, model/version/cost and ContentBuild relationship |
| Video generation providers | generated clips/video | EXTERNAL GENERATION | VideoProvider-style adapter + Video Director/Asset Engine | stable job identity, status, cost disclosure and canonical asset ingestion |
| Voice/dubbing providers | narration, translation, dubbing | EXTERNAL GENERATION | VoiceProvider-style adapter | consent/voice identity/provenance required |
| Storage providers | asset persistence/sync | READ/WRITE | Vault / Asset Engine adapter | canonical asset IDs and lineage remain ViewTube-owned |
| Social distribution providers | cross-platform publishing/scheduling | PROVIDER DEPENDENT | SocialDistributionProvider direction | per-network capability map; creator approval for external writes |
| E-signature | releases/contracts | PROVIDER DEPENDENT | SignatureProvider direction | documents and signature status only after explicit integration |
| Commerce / affiliate | product/link/attribution | PROVIDER DEPENDENT | CommerceProvider direction | attribution uncertainty must stay explicit |

### Required fields for every future adapter

- provider and API version;
- supported capability IDs;
- read/write classification;
- OAuth/API-key requirements;
- quota/rate limit model;
- webhook/polling behavior;
- data-retention and privacy constraints;
- cost model;
- idempotency/retry semantics;
- approval class;
- current adapter implementation;
- fallback/manual path;
- last verified date and source.

---

# 23. UI Surface / Route / Widget Crosswalk

## 23.1 Primary application routes

Current navigation contract on the audited main defines:

| Route | Surface |
| --- | --- |
| / | Dashboard / Mission Control |
| /studio | Studio |
| /projects | Projects |
| /ai-brain | AI Brain |
| /local-analytics | Analytics / VT-SYNC |
| /editor | Editor |
| /vault | Vault |
| /settings | Settings |
| /user-guide | User Guide |

Primary route authority: src/components/navigation/navigationContract.ts. AppShell/AppRoutes own runtime route composition.

## 23.2 Master Tool surface mapping

| Master Tool | Primary surface(s) | Existing widget/tool examples | Coordination rule |
| --- | --- | --- | --- |
| Opportunity Radar | Dashboard; AI Brain; Research-oriented project context | opportunity-radar, anomaly-radar, keyword tools | opportunity selection and anomaly detection remain distinct jobs sharing evidence |
| Channel Intelligence Hub | Analytics; Dashboard | Channel Overview, traffic, retention, device, CPM, realtime, progress | Analytics owns data truth; widgets own presentation |
| Content Strategy Lab | Projects; AI Brain; Studio | goals/tasks, Next Best Action, research/brief tooling | write into Project/ContentBuild rather than separate strategy store |
| Project & Production Command | /projects | Project Builder, Board, Calendar, task/goal systems | Project is lifecycle owner |
| Script & Story Studio | /studio; project tool surfaces | Hook Generator, script tools | generation must preserve Project/ContentBuild + receipts |
| Visual Development Studio | /studio; /vault; Video Director | image/video generation, storyboard/visual assets | generated media becomes canonical assets |
| Vault & Asset Engine | /vault; Projects; Studio | Asset Operations, import/tags, text editor, Video Asset Engine widget | Vault must not create a second content lifecycle |
| Video Director & Editor | Studio; /editor | video-director widget, editor/render surfaces | carry ContentBuild identity into render/export |
| Packaging & Experiment Lab | Dashboard; Projects; Publisher | ab-thumbnail, thumbnail/title tools | exact variant IDs must survive to outcomes |
| Publisher & Distribution Center | Publisher surfaces; Projects; Dashboard Publishing Command | flight-check, Video Publisher, uploader/scheduler | approval snapshot + transaction should own execution |
| Audience & Community Desk | Dashboard; Studio/engagement surfaces | comment-replier, video-comment-operator, audience-requests, community-post | external mutations remain approval-gated |
| Monetization & Operations Hub | Dashboard; Analytics; Projects | revenue widgets, CPM geo, sponsor/project operations | financial assumptions and scopes stay explicit |

### UI duplication rule

Before creating a new page or widget, answer:

1. Is this a new job or another view of an existing Master Tool?
2. Does an existing primary route already own the workflow?
3. Can the feature be a widget/compound component inside that route?
4. Would a new surface create a second persistence/data owner?
5. Which mobile portrait/landscape composition is required?

---

# 24. Event, Contract & Handoff Matrix

| Lifecycle transition | Canonical contract / owner | Current state | Required identity/provenance |
| --- | --- | --- | --- |
| Project create/open | ProjectContentIdentityService | IMPLEMENTED | projectId + contentBuildId |
| Project status/lifecycle sync | ProjectContentBuildBridge | IMPLEMENTED FOUNDATION | projectId, contentBuildId, stage/status |
| Video Package reconciliation | VideoPackageContentBuildBridge | IMPLEMENTED FOUNDATION | videoPackageId + contentBuildId + revision |
| Generation request | GenerationRequest | IMPLEMENTED | request ID, project/contentBuild, tool/provider intent |
| Generation context | GenerationContextManifest | IMPLEMENTED FOUNDATION | evidence/context refs, scope, model/tool intent |
| Generation completion | ToolReceipt | IMPLEMENTED FOUNDATION | request/output asset IDs, versions, provider/model provenance |
| Internal tool continuation | ActionPacket / handoff system | IMPLEMENTED FOUNDATION | source, destination, inputs, evidence, confidence, contentBuild scope |
| Asset attach/version/select | ContentBuildRepository + Asset Engine | IMPLEMENTED | asset ID, relation, version/variant/selection |
| Editor render request/status | renderJobContract | IMPLEMENTED FOUNDATION | projectId/contentBuildId, render job ID, composition, diagnostics |
| Publishing projection | PublishingPackageProjection | IMPLEMENTED | exact current package projection |
| Creator approval freeze | ApprovedPublishSnapshot | PARTIAL / VERIFYING | contentBuild revision + exact assets/metadata + approver + hash |
| Publish execution | PublishTransaction | PARTIAL | snapshot identity, durable step receipts, retries/recovery |
| Remote publication binding | YouTube binding / ContentBuild checkpoints | PARTIAL / OPEN LOOP | remote video ID + exact approved variant lineage |
| Analytics arrival | VT-SYNC → analytics-canon | IMPLEMENTED FOUNDATION | channel/video/window/dataset/report provenance |
| Creator outcome | BrainOutcomeLedger / domain outcome owners | IMPLEMENTED FOUNDATION | action/asset/variant identity + creator decision |
| Measured evaluation | Algorithm/Brain evaluation owners | PARTIAL | target metric, compatible scope/window, insufficient-data state |
| Learning promotion | governed learning → Channel Knowledge | PARTIAL | repeated evidence + creator confirmation/promotion rule |

### Event discipline

- Prefer domain contracts over ad hoc browser events for durable cross-system behavior.
- DOM/custom events may notify UI surfaces, but durable identity belongs in canonical repositories/contracts.
- Correlation/idempotency must be added through one cross-system envelope, not per-feature bespoke IDs.

---

# 25. Verification, Test & Observability Index

| Capability | Existing evidence/tests | Observability surface | Open verification |
| --- | --- | --- | --- |
| ContentBuild repository | src/services/asset-engine/ContentBuildRepository.test.ts | ContentBuild event history | end-to-end lifecycle receipts |
| Project identity | src/services/projects/ProjectContentIdentityService.test.ts; ProjectContentBuildBridge.test.ts | project/contentBuild IDs | certify all creation/recovery paths |
| Video Package bridge | ProjectVideoPackageBridge.test.ts; VideoPackageContentBuildBridge.test.ts | package recovery/revision state | production caller/handoff coverage |
| Generation workflow | src/services/asset-engine/GenerationWorkflow.test.ts | GenerationRequest, ToolReceipt, BrainTrace | migrate remaining legacy/direct paths |
| Publishing projection | PublishingPackageProjection.test.ts | publishing readiness/projection | approval snapshot persistence |
| Publish transaction | PublishTransaction.test.ts | transaction steps/receipts | retry/recovery + immutable snapshot binding |
| Analytics intelligence evidence | src/services/analytics-canon/intelligenceEvidence.test.ts | sync status, evidence freshness/coverage | report capability + real-account certification |
| Brain outcome path | src/services/brain/__tests__/assetOutcomes.test.ts | BrainOutcomeLedger / runtime snapshot | writers across all consequential producer families |
| Dashboard registry | dashboardPhase0Contracts.test.ts; routeRegistryGovernance.test.ts | registry/certification metadata | full responsive/visual acceptance |
| Opportunity Radar | opportunityRadarRegistration.test.ts | widget evidence/confidence | reusable evidence feed + runtime validation |
| Video Asset Engine widget | videoAssetEngineRegistration.test.ts | widget registry + Asset Engine | end-to-end generation/selection/publish loop |
| Settings widget | SettingsWidget.test.ts | connection/sync/AI/account states | acceptance screenshots + stale/error detail |
| Editor render | renderJobContract + Editor master test program | render job status/progress/diagnostics | preview/final golden parity + four-layout certification |

## 25.1 Shared observability anchors

- DiagnosticOverlay and on-screen diagnostics for client/runtime troubleshooting.
- Vercel Speed Insights for route/device performance telemetry in production.
- VT-SYNC dataset/job status and freshness.
- BrainTrace, GenerationRequest and ToolReceipt for AI/generation provenance.
- PublishTransaction step receipts for publishing recovery.
- RenderJob status/progress/diagnostics for Editor renders.
- Herald claims/receipts for repository-agent work.

### Completion rule

A capability is not DONE because a type, test or UI exists. Completion evidence should combine:

1. current-main reachability;
2. focused tests;
3. integration/runtime verification;
4. failure-state verification;
5. mobile/visual certification where user-facing;
6. receipt in the relevant living master/ledger.

---

# 26. Agent Responsibility & Automation Map

| Agent / actor | May read | May recommend/generate | May mutate ViewTube state | May mutate external systems | Approval rule |
| --- | --- | --- | --- | --- | --- |
| Research Agent | research sources, approved channel/project evidence | Research Signals, clusters, opportunity candidates | save research artifacts when authorized | no by default | external acquisition/tools follow connector permissions |
| Analyst Agent | analytics-canon and verified report contracts | analyses, anomaly explanations, comparisons | save Insight/evidence artifacts | no | never invent unavailable metrics |
| Strategy Agent | evidence, Channel Knowledge, Project context | briefs, hypotheses, next actions | project drafts/proposals | no | creator chooses strategic direction |
| Script Agent | brief, style, evidence, ContentBuild | scripts/hooks/story variants | versioned draft assets through governed generation path | provider generation only through approved tool gateway | generated assets retain receipts/provenance |
| Packaging Agent | content/asset variants + performance evidence | title/thumbnail variants and experiment plans | package drafts/selections when user chooses | no direct platform mutation | platform testing/write capability is separately gated |
| Production Agent | Project/ContentBuild/assets | shot plans, generation requests, production tasks | project/assets through canonical services | provider generation via adapters | cost/permission policy applies |
| Publisher Agent | approved package + publication state | readiness checks, execution plan | publishing records/transaction state | yes, only supported provider writes | explicit creator approval + immutable approved snapshot |
| Community Agent | comments/community context | triage/reply drafts | ViewTube queue/drafts | comment/community writes only through domain owner | explicit mutation control |
| Learning Agent | outcomes, evaluations, current evidence | learning candidates | candidate/validated learning state through governance | no | cannot silently promote weak correlation |
| Herald / repository agents | repository code/docs/tests/tasks | code/document changes and work receipts | repository state through Git workflow | repository/deployment actions only per repo permissions | separate from creator BrainRuntime |

### Automation classes

- **READ:** safe retrieval within granted scopes.
- **DRAFT:** create local draft/proposal; no external effect.
- **INTERNAL WRITE:** mutate canonical ViewTube state with audit trail.
- **EXTERNAL WRITE:** publish/comment/upload/modify third-party state; requires capability and approval.
- **FINANCIAL:** spend/commit money; separate explicit approval.
- **DESTRUCTIVE:** delete/revoke/overwrite authoritative state; explicit confirmation + recovery plan where possible.

---

# 27. Decision, Supersession & Change Ledger

Append decisions here when they affect more than one Master Tool. Scoped implementation details remain in their owning masters.

| Date | Decision | Reason | Evidence / supersession | Follow-up |
| --- | --- | --- | --- | --- |
| 2026-09-25 | Consolidate donor research into 12 Master Tools | reduce duplicate shallow tools and preserve one creator lifecycle | PR #442 + this resource | map all existing tools/widgets to owners |
| 2026-09-25 | Widgets are views, not independent data owners | prevent duplicated stores and inconsistent truth | Widget Registry + domain masters | enforce during new widget design |
| 2026-09-25 | analytics-canon is the normalized analytics consumer boundary | keep VT-SYNC raw ownership separate from consumers | Analytics master + analytics-canon README/contracts | retire legacy consumers |
| 2026-09-25 | Project + ContentBuild remain shared workflow identity | keep creator work continuous across Studio/Vault/Editor/Publisher | Projects master + ContentBuildRepository | finish post-publish continuity |
| 2026-09-25 | BrainRuntime remains creator reasoning/orchestration owner | avoid another general Brain/runtime | AI Systems master + canonical Brain contract | route remaining direct providers/tools |
| 2026-09-25 | Existing outcome/evaluation/learning systems must be extended, not replaced | prevent a second generic ledger | BrainOutcomeLedger + Finish Program | add producer-family writers |
| 2026-09-25 | External writes are capability-checked and approval-gated | API availability and user intent differ by provider/surface | AI/hand-off governance + publishing contracts | complete capability ledger per provider |
| 2026-09-25 | Ten code-aware operating sections become part of this living master | make the document actionable, editable and aware of current implementation | current-main audit 52f655a5d3cb5bc2d16fc8a285a8b129bb3b9f1a | update sections whenever ownership/status changes |

### Supersession rule

A newer decision does not delete old evidence. Mark the prior decision superseded, link the new decision/PR, and preserve the reason for the change.

---

# 28. Gaps, Opportunities & Next-Best-Work Board

This board summarizes cross-system work only. The One-Goal ledger remains the detailed execution authority.

| Priority | Gap / opportunity | Current state | Dependencies | Next action | Acceptance signal |
| --- | --- | --- | --- | --- | --- |
| P0 | Persist immutable ApprovedPublishSnapshot | contract/schema landed; runtime persistence open | publishing package | store exact approved inputs/approver/hash | later edits cannot change an in-flight publish |
| P0 | Bind PublishTransaction to approved snapshot | NOT STARTED | approved snapshot persistence | key transaction/retries to snapshot identity | retries observe same approved state and never duplicate upload |
| P0 | Cross-system correlation/idempotency envelope | READY | existing domain events | define shared envelope before producer writers | Brain→build→publish→evaluate can be traced end-to-end |
| P0 | Metric comparability integration | policy VERIFYING | analytics contracts | wire into evaluation + visual/experiment consumers | incompatible comparisons fail with structured reasons |
| P0 | Outcome producer coverage | generic ledger exists; domain writers incomplete | correlation envelope | map/write Publisher, Project, Community, Editor, Experiment outcomes | consequential actions produce lineage-preserving outcomes |
| P1 | Post-publish ContentBuild checkpoint chain | OPEN | publisher snapshot/transaction | persist YouTube binding + used variants + checkpoints | analytics/evaluation refers to exact published variants |
| P1 | Opportunity evidence consolidation | VERIFYING | project context + analytics evidence | expose one reusable evidence feed to Brain/widgets | no widget-local duplicate opportunity truth |
| P1 | Brain channel/project scoping cleanup | PARTIAL | project context adapter | remove remaining implicit control/context reads | all relevant runtime calls carry explicit scope |
| P1 | Retire legacy analytics consumers | IN PROGRESS | analytics-canon | migrate selectors/caches and prove parity | no new direct legacy reads; reachability trends to zero |
| P1 | Editor final-render parity + identity | VERIFYING/IN PROGRESS | render contracts + Asset Engine | golden preview/final fixtures + four-layout certification | final render is canonical asset tied to ContentBuild |
| P1 | Persistence/namespace audit | NOT STARTED | domain ownership map | classify cache vs truth and channel/project namespaces | no cross-channel/project leakage or ambiguous truth stores |
| P1 | Structured failure taxonomy | NOT STARTED | correlation/observability | unify auth/API/sync/AI/render/publish failures | UI/agents receive machine-readable failure states |
| P2 | Data Visual/controller cleanup | IN PROGRESS | analytics migration | retire controllerSpec/legacy preview and finish mark-scale | one registry-native control/layout path |
| P2 | Remaining bespoke UI controls/shell duplication | IN PROGRESS | Toolbox/UI authorities | continue production surface audit | canonical primitives + no nested duplicate shells |
| P2 | Provider capability registry | PLANNED | adapter contracts | version capability/scope/cost matrix | UI can disable/route unsupported actions explicitly |
| P2 | Auto-generated code ownership/test crosswalk | PLANNED | registries/tests | derive portions of sections 19/23/25 from code | stale manual inventories decrease over time |

## 28.1 How to choose the next slice

Prefer work that:

1. closes an end-to-end creator loop rather than adding another isolated tool;
2. removes ambiguity about identity, authority or data truth;
3. enables multiple Master Tools through one shared contract;
4. has a measurable acceptance test;
5. reduces unsupported API assumptions or manual synchronization;
6. improves failure recovery, provenance or creator control.

---

## 29. Living-document maintenance protocol

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

## 30. Source and evidence foundation

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

## 31. Update log

### 2026-09-25 — Populated code-aware operating sections

**Integration refresh:** rebased/transplanted onto current main `72150e2957d67159ca5c223b839bff8307805485` without overwriting newer repository work. The detailed code-awareness evidence sweep remains pinned to `52f655a5d3cb5bc2d16fc8a285a8b129bb3b9f1a` until the next full re-audit.

- converted all ten recommended additions into populated living sections grounded in current main `52f655a5d3cb5bc2d16fc8a285a8b129bb3b9f1a`;
- added code ownership, data-flow, implementation-reality, integration/API, UI surface, contract/handoff, test/observability, agent responsibility, decision and next-best-work maps;
- explicitly linked open work to the One-Goal status ledger instead of duplicating implementation state silently;
- preserved scoped-domain authority: this resource coordinates across systems and does not replace their internal contracts.

### 2026-09-25 — Initial repository version

- converted the research-derived architecture into a living Markdown resource;
- established authority boundaries;
- defined 12 Master Tools;
- anchored the plan to current code/system owners;
- added 10 recommended code-aware living-document sections;
- added a maintenance protocol to keep future edits grounded in current `main`.
