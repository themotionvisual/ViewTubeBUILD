# Top 10 Dashboard Widget Consolidation Plan — 2026-09-24

Status: active implementation plan  
Authority: current dashboard registry and canonical widget implementations on the active branch  
Rule: do not create duplicate widgets when a planned concept already has an existing canonical identity.

## Consolidation rule

For every planned Top-10 widget:

1. Search current registry, renderer, instrument catalog, tests, donor branches, historical prototypes, uploaded artifacts, and related super-tools.
2. If a canonical widget already exists, keep its public ID and persisted-layout identity.
3. Merge useful missing features, controls, evidence, handoffs, states, and distinctive central-component ideas into that widget.
4. Do not create a parallel renderer or alternate dashboard card for the same creator job.
5. If multiple older widgets overlap, consolidate their useful behavior into the strongest current owner and retire the duplicate concept at the planning level.
6. Reuse canonical primitives, data sources, Brain/Vault/Projects/Asset Engine ownership, and action/handoff contracts.
7. Add tests before new behavior, then certify responsive sizes, state coverage, accessibility, and production handoffs.

## Canonical mapping

| Planned concept | Canonical owner / direction | Consolidation action |
| --- | --- | --- |
| Opportunity Radar | `opportunity-radar` | New identity only because no canonical widget existed. Wave 1 implementation ranks evidence-backed follow-up/refresh candidates from connected catalog evidence; later enrich with canonical demand/audience/search opportunity signals. |
| Anomaly Monitor | `anomaly-radar` | Keep ID. Merge stronger monitor concepts, severity/watch windows, richer signals, provenance, compare/investigate handoffs, and state coverage into the existing widget. |
| Channel Intelligence Hub | `brain-hub` | Keep ID. Merge channel health/intelligence summaries, anomaly/opportunity/project context, evidence provenance, governed Brain actions, and compact Dashboard controls into the existing Brain Hub. |
| Next Best Action | `next-best-action` | Keep ID. Expand from one simple branch decision into ranked candidate actions with evidence, impact/readiness, direct handoffs, dismiss/complete semantics where canonical ownership supports them. |
| Video Asset Engine | `video-asset-engine` | Keep ID. Merge missing package completeness, thumbnail-first package presentation, finalization/readiness, lineage, asset-slot visibility, and Studio/Editor/Vault handoffs. |
| Content Lifecycle | `content-pipeline` + canonical ContentBuild lifecycle | Do not create a second lifecycle widget. Upgrade Content Pipeline to project/content lifecycle stages using canonical ContentBuild state and lifecycle evidence. |
| Series & Franchise Tracker | existing Series/Theme + Projects/Creator Canvas systems; dashboard owner to be selected by reuse audit | Do not duplicate series architecture. Add the compact dashboard manifestation only by reusing canonical series/project data and existing Series Generator concepts. |
| Audience Loop | `audience-requests` plus Audience Loop Studio | Keep dashboard request identity and merge loop-level clustering, repeated-request evidence, themes, promotion-to-project, and Studio handoff rather than creating a second overlapping audience widget. |
| Publishing Command | existing `flight-check`, `upload-scheduler`, content pipeline, Video Publisher / Publishing Schedule systems | Consolidate launch-readiness and publishing-command features into the strongest current dashboard owner(s); no duplicate publisher card. |
| Creator Operations / Daily Creator Command | `daily-oracle` as the daily command surface, with `task-stack`/calendar as supporting owners | Do not register `DailyCreatorCommandWidget` separately. Merge its task queue, first-open-task focus target, local focus session, calendar handoff, and execution controls into Daily Oracle while preserving Daily Oracle's evidence-ranked strategy, goal lens, streak, and Brain integration. |

## Donor feature rule

Historical HTML atlases, uploaded TSX files, prior branches/PRs, old dashboard widgets, and super-tool prototypes are donors, not automatic production owners. For each donor feature:

- preserve the useful creator job;
- map it to the current canonical owner;
- replace duplicate data/storage paths with current canonical services;
- replace private controls with current widget primitives;
- preserve unique interaction concepts when they improve the canonical widget;
- record intentionally deferred features when their canonical backend data is not yet connected.

## Current implementation waves

### Wave 1 — Opportunity Radar
- registration contract
- canonical registry identity
- Opportunity Field central component
- evidence-only ranking
- responsive/coarse-pointer behavior
- help/instrument metadata
- no authored black in the shared new-widget CSS layer

### Wave 2 — Creator Command consolidation
Canonical owner: `daily-oracle`.

Merge from the uploaded Daily Creator Command work:
- today's task count and completion count;
- first open calendar task as the immediate execution target;
- 25-minute local focus session with start/pause/reset;
- compact current-task list;
- direct calendar/projects handoff;
- timer stops when the widget collapses;
- retain the explicit boundary that the timer is local-only.

Retain from Daily Oracle:
- evidence-ranked primary move;
- quick wins;
- goal lens;
- Brain context/evidence coverage;
- add-to-today flow;
- completion calendar and streak;
- direct Brain handoff.

Avoid:
- a new `daily-creator-command` registry ID;
- a second calendar store;
- automatic AI ranking of arbitrary task text;
- replacing Daily Oracle's decision engine with timer logic.

### Wave 3 — Anomaly + Intelligence + Next Action
Status: active implementation.
- `anomaly-radar`: connected to channel-scoped Brain/VT-SYNC anomaly intelligence with the former local baseline retained as fallback; significance, impact, confidence, evidence count, OPEN SIGNALS and COMPARE added.
- `brain-hub`: active project context now feeds Algorithm Intelligence when Projects access is allowed; ranked recommendations and project priming are surfaced in the existing Intel page.
- `next-best-action`: governed Algorithm Intelligence recommendations now outrank the prior local branch tree when available; local dashboard evidence remains an explicit fallback.
- shared dashboard Algorithm Intelligence context owns active-project mapping and recommendation-to-route presentation so the three widgets do not create parallel intelligence logic.
- remaining Wave 3 work: connect canonical Opportunity Evidence when its builder is available, finish runtime state certification, and visually verify narrow/mobile layouts.

### Wave 4 — Asset + Lifecycle
Status: active implementation.
- `video-asset-engine`: package readiness is now scoped to the active ContentBuild's explicit asset membership instead of matching arbitrary assets across the whole Vault; ContentBuild stage, revision, assets, selections, finals, and variants are surfaced.
- `content-pipeline`: canonical ContentBuild stages now populate IDEA / BUILD / PACKAGE / LIVE / LEARN buckets; the former task/upload heuristic is retained only when no ContentBuild snapshots exist.
- shared `contentBuildWidgetModel` owns ContentBuild stage bucketing, scoped Vault membership, and readiness summaries.
- Vault remains durable asset owner; ContentBuild remains lifecycle/membership owner; Projects remains project intent/workflow owner.
- remaining Wave 4 work: improve slot resolution from explicit ContentBuild selections/versions before heuristic text matching, add active-build selection when multiple packages are present, and complete state/mobile certification.

### Wave 5 — Audience + Series
Status: active implementation.
- `audience-requests`: now clusters request-like comments into explicit normalized themes, exposes repeat count/viewer evidence, preserves a source request, and hands work to Projects, Audience Loop Studio, or Series Fit.
- Audience Loop Studio remains the deeper mining/reply/community workflow owner; the dashboard widget is the compact evidence funnel, not a second Studio.
- Series/Franchise ownership audit: `series-and-theme-generator` already owns Theme Clusters, Sequel Tree, Cadence Fit and Franchise Map and is intentionally designed to fold into Creator Canvas + Projects.
- Do **not** register a separate Series & Franchise Tracker yet. The current Series Generator prototype does not expose a durable persisted series/franchise record set suitable for a truthful dashboard tracker. A dashboard manifestation should be added only after persisted series identity/status/episode relationships exist, or should be embedded into an existing Projects/Creator Canvas dashboard owner if that becomes canonical first.
- remaining Wave 5 work: replace simple normalized request grouping with canonical comment/request intelligence when that service is connected, persist promoted request packets, and connect persisted series records when available.

### Wave 6 — Publishing command consolidation
Status: active implementation.
- `flight-check` is the compact Publishing Command dashboard owner because it already represents launch preflight/readiness.
- `upload-scheduler` remains upload-time/schedule queue owner; it is not duplicated inside Publishing Command.
- Video Publisher remains execution owner for package generation, upload and publish transactions.
- Publishing Schedule Architect remains deeper schedule/planning owner.
- Flight Check now reads canonical Publishing Package + PublishTransaction state when available and renders PACKAGE / CHECK / SCHEDULE / READY / LIVE stages, blockers, readiness, transaction status, Publisher handoff and Schedule Architect handoff.
- the previous manual checklist remains only as fallback when no canonical Publishing Package is available.
- remaining Wave 6 work: reconcile Upload Scheduler's local queue/file state with canonical Projects/ContentBuild scheduling and remove authored black/inline legacy styling from that separate widget without conflating ownership.

### Wave 7 — certification
For every resulting canonical widget:
- loading / ready / empty / blocked / stale / partial / error where applicable;
- all declared dimensions;
- mobile portrait and landscape;
- keyboard/focus/coarse pointer/reduced motion;
- provenance and data-honesty copy;
- direct action/handoff tests;
- no duplicate registry IDs, renderers, stores, or ownership paths.
