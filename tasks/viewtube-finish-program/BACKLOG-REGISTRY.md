# ViewTube Finish Backlog Registry — 2026-09-24

Status: CURRENT PLANNING AUTHORITY for unfinished cross-system work discovered after the #322/#360 merge and subsequent current-main re-audit.

This registry complements, rather than replaces, the active Settings redesign under `tasks/plan.md` and `tasks/todo.md`. Cross-system completion work lives in `tasks/viewtube-finish-program/`.

## Program A — Unified Project / Asset / Publish Workflow

| ID | Capability | Status | Primary dependency | Definition of done |
|---|---|---|---|---|
| A01 | Full Asset Engine Studio workspace | missing | ContentBuild + Asset Engine + Studio primitives | Overview / Assets / Generation / Variants / Lineage / Publishing Package / Launch Package / Experiments / Evaluation / History are assembled as one production workspace. |
| A02 | Launch Package | plan-only | Publishing Package + community/promo actions | First-class derived launch/promote package exists for posts, Shorts/promos, pinned comment, launch assets, routing and promotion configuration. |
| A03 | Canonical Asset Slot Registry | missing | Asset Engine contracts | Registry defines slot cardinality, asset types, finalization/readiness rules and preferred tools across idea→research→script→media→package→publish→launch. |
| A04 | Complete Project Workspace facade | partial | Project Builder + ContentBuild | Overview → Plan → Create → Package → Publish → Performance is assembled, with readiness, next action and Continue routing. |
| A05 | Destination-specific Context Resolver recipes | partial | GenerationRequest + ContextManifest + ToolReceipt | Script, Storyboard, Thumbnail, Video Director, Editor, Publisher and Community/Launch use explicit resolver recipes. |
| A06 | Immutable ApprovedPublishSnapshot | missing / priority | Publishing Package + PublishTransaction | Exact approved revisions/assets/metadata/routing/schedule/approver are frozen behind stable hash before transaction start. |
| A07 | Publish retry/recovery certification | incomplete | PublishTransaction + snapshot | Durable step receipts, reload recovery, independent optional-step retry, manual recovery, and duplicate-upload prevention are proven. |
| A08 | Post-publish ContentBuild loop | incomplete | publish binding + analytics-canon + outcome loop | Published YouTube binding, exact used variants, checkpoints, outcomes, evaluation and governed learning share one identity chain. |
| A15 | Editor → Asset Engine → outcome closure | incomplete | editor render + Vault/Asset Engine | Canonical derived render/version is always created, selected by Publishing Package and outcome-attributed. |
| A27 | Server-authoritative durable persistence | deferred | stabilized contracts | Critical publication/execution state migrates from browser/local foundations to durable server authority without parallel ownership. |

## Program B — Publishing → Analytics → Evaluation → Learning

| ID | Capability | Status | Primary dependency | Definition of done |
|---|---|---|---|---|
| B09 | Unified outcome coverage | incomplete | BrainOutcomeLedger / domain outcome owners | Publisher, Projects, Editor, Community, experiments, packaging and Brain actions all have production outcome writers. |
| B10 | Evaluation targets for consequential actions | incomplete | Algorithm/evaluation contracts | Metrics, checkpoint, scope, expected direction and insufficient/not-measurable states are systematic. |
| B11 | Canonical metric-comparability guard | missing / priority | analytics-canon | Reusable guard rejects invalid unit/scope/format/window/rate/coverage comparisons with structured reasons. |
| B14 | Comment / Audience learning loop | incomplete | comment actions + Audience/Channel Intelligence | Draft/refine/post/suggested-video outcomes aggregate before governed promotion. |
| B18 | Analytics/Data Visual final certification | incomplete | comparability guard + visual controllers | Exact canvas/aspect rules and responsive/state regression certification are complete. |
| B22 | AI generation observability/evals | incomplete | BrainTrace + ToolReceipt + Generation Store | Model/provider/prompt/context/evidence/latency/cost/decision/assets/performance become inspectable and evaluable. |

## Program C — Brain / Context / Intelligence / Prompt Convergence

| ID | Capability | Status | Primary dependency | Definition of done |
|---|---|---|---|---|
| C12 | Brain active-Project context | partial | Project/ContentBuild identity | projectId/contentBuildId/bounded Project context reliably enter the Brain portfolio where allowed. |
| C13 | Opportunity Intelligence production evidence feed | incomplete | canonical analytics evidence | Deterministic provenance/freshness/confidence/scope feed powers Opportunity → Algorithm/Brain. |
| C20 | Daily Creator Command Center / Daily Oracle | partial | Brain + Projects + calendar + evidence | Daily focus, prioritized work, progress/streak, project/calendar handoff and grounded recommendations operate as one tool. |
| C21 | AI system source-of-truth/registry program | incomplete | current registries + reachability audit | Tools/prompts/models/settings/surfaces/capabilities/owners are machine-readable and reachability-governed. |
| C23 | Project-grounded RAG | brainstormed | Context Resolver + Project/Vault corpus | Retrieval uses project scripts/research/style/assets/versions/Channel Profile with scope/provenance and bounded context. |
| C24 | NVIDIA experiments | brainstormed | provider experiment lane | VSS archive/footage search and Nemotron speech are evaluated behind optional adapters, not made canonical without proof. |
| C25 | Google/Veo media-provider integration | missing | media-provider gateway + Asset Engine | text→video/image→video/reference/first-last-frame outputs enter Vault/Asset Engine and canonical timeline via accepted candidate identity. |
| C26 | AI editor sidecar / typed edit patches | conceptual | editor contracts + BrainRuntime | AI proposes typed previewable edits with Explain, recipes and prompt/model/seed/reference provenance. |
| C31 | Prompt System Authority + modernization | newly registered | Prompt Constitution + Context Resolver + eval harness | Every prompt family is inventoried/versioned; unsafe legacy defaults are replaced; prompt quality is regression-evaluated. |

## Program D — UI / Editor / Analytics / Cleanup / Certification

| ID | Capability | Status | Primary dependency | Definition of done |
|---|---|---|---|---|
| D16 | Remotion preview/final-render parity certification | incomplete | editor render path | One interpretation path + deterministic fixture suite proves preview/final parity. |
| D17 | Four-layout editor certification | incomplete | editor UI | portrait, landscape, narrow/tablet and desktop pass full state/visual matrix. |
| D19 | 10-widget production cohort | mostly unfinished | widget authority + backend tools | Daily Command, Packaging, Analytics Diagnosis, Retention, Audience Inbox, Publishing Gate, Script, Traffic, Opportunity and Production are built/certified as one cohort. |
| D28 | Dead-path / duplicate-authority cleanup | incomplete | parity receipts | Direct provider bypasses, duplicate mutations/state/selectors/CSS and stale docs are removed only after parity. |
| D29 | Full responsive/state certification matrix | incomplete | current UI systems | desktop/narrow/mobile portrait/mobile landscape + empty/loading/error/partial/ready/disabled/overflow are systematically certified. |
| D30 | Public Agent Interface / agent readiness | plan-only | public site | llms.txt, optional llms-full, AGENTS.md, sitemap/meta/JSON-LD/static/Markdown discovery and non-JS readability are shipped and rescanned. |

## Cross-cutting execution order

### Immediate leverage
1. A06 ApprovedPublishSnapshot.
2. A07 Publish retry/recovery.
3. A08 post-publish identity chain.
4. B09 outcome coverage.
5. B10/B11 evaluation targets + comparability.
6. C12/C13 Brain Project + Opportunity evidence.
7. C31 Prompt modernization.
8. D certification/cleanup.

### Parallel-safe lanes
- Asset Studio / Project facade can proceed in parallel after snapshot contracts settle.
- Prompt inventory/evals can proceed without blocking publishing.
- Widget cohort may proceed after backend ownership per widget is resolved.
- Agent readiness is isolated from authenticated product state and can be independently delivered.

## Already landed / do not recreate

Do not open new foundational work for:
- Video Package → ContentBuild production synchronization;
- Publishing Package;
- PublishTransaction foundation;
- Dashboard Asset Engine PUBLISH view;
- Studio Publishing Cockpit;
- Video Publisher transaction integration;
- GenerationRequest / ToolReceipt foundation;
- Brain typed evidence projection;
- anomaly scanner production reachability;
- Project → ContentBuild identity foundation;
- mobile editor orientation preservation;
- Settings UX toggles already present;
- recent component-library compact sizing / tooltip / skeleton work;
- Channel Overview donut/area-chart additions.

## Completion rule

A backlog item is not complete because a type/interface exists. It requires:
- canonical owner;
- reachable production caller;
- persistence/identity contract where applicable;
- focused tests;
- end-to-end or visual/runtime certification;
- documentation update;
- no parallel superseded path left active without an explicit compatibility reason.
