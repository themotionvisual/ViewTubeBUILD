# ViewTube Post-Current Widget Consolidation Plan — Publisher / Manager / Daily Oracle

**Status:** planned follow-on program  
**Scheduled after:** the currently active widget redesign, signature-component, responsive, state, and visual-certification phases  
**Date:** 2026-09-24  
**Primary authority:** current `main` code + `.claude/skills/viewtube-widget-dashboard-system/` + `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_OPTIMIZATION_PLAN.md`

## Intent

After the current widget program is complete and certified, perform three consolidation changes without losing features:

1. Rename and upgrade the Dashboard **Video Uploader** into **Video Publisher**.
2. Bring Dashboard and Studio Hub **Video Publisher** and **Video Manager** surfaces to functional parity while preserving their different container systems.
3. Make **Daily Oracle** the single daily creator-decision owner by absorbing the useful backend intelligence and action-ranking capabilities of **Next Best Action**, then retire the separate `next-best-action` widget through a persisted-layout migration.

This is a consolidation program, not permission to create duplicate tools.

---

# Entry gate

Do not begin this follow-on implementation until the current widget phases have reached their current certification gate:

- signature functional components exist for the active planned widgets;
- widget-specific CSS ownership is established;
- canonical primitives replace generic/private control styling;
- declared size × height states are intentional;
- desktop 1440×1000 and phone 390×844 built-app captures exist for visible changes;
- focused dashboard tests and production build are green.

If unfinished current-wave work remains, this program stays queued.

---

# Architectural rules

## 1. Functional parity without top-level component duplication

Dashboard widget and Studio Hub toolbox surfaces may share:

- domain services;
- typed view-model builders;
- publishing/management workflow state;
- data selectors;
- validation;
- action/handoff packets;
- reusable canonical primitives;
- deliberately reusable compound controls.

They must retain independent top-level owners because Dashboard widget geometry and Studio Toolbox geometry have different runtime contracts.

Target relationship:

```
CANONICAL PUBLISHING / VIDEO-MANAGEMENT SERVICES
        ↓
SHARED VIEW MODELS + DOMAIN COMPOUND CONTROLS
       ↙                                    ↘
Dashboard top-level widget              Studio Hub top-level toolbox
WidgetShell + widget primitives         Toolbox/SubToolbox system
```

Do not implement the Dashboard widget merely as `<VideoPublisher mode="dashboard" />`, and do not mount a Dashboard `WidgetShell` inside Studio Hub.

## 2. Feature parity means capability parity

“Same functions and features” means each equivalent Dashboard/Studio surface can perform the same creator jobs against the same canonical backend ownership.

Layout density may differ.

A capability available in one surface must not silently disappear in the other merely because the presentation is compact.

When a function is too large for the default Dashboard allocation:

- preserve it behind a page/header toggle;
- expose it at larger widget dimensions;
- use an explicit bounded scroll region;
- or provide an in-context expansion/handoff that preserves the current draft/selection.

Do not replace functional parity with a link-only card.

## 3. One backend owner per operation

Publishing state should converge on the current Video Package / ContentBuild / Publishing Package / PublishTransaction ownership.

Published-video editing should converge on one metadata/edit workflow rather than Dashboard-private and Studio-private persistence.

---

# Program A — Video Uploader → Video Publisher

## Current verified starting point

Current `main` has:

- Dashboard registry ID `video-uploader` titled **Video Uploader**.
- Dashboard owner `src/views/dashboard/widgets/VideoUploaderWidget.tsx`.
- Studio Hub owner `src/views/VideoPublisher.tsx`.
- Studio Hub mounts Video Publisher directly.
- Dashboard and Studio currently overlap in publishing responsibility but are separate implementations.

## Desired end state

User-facing Dashboard title: **Video Publisher**.

Canonical Dashboard owner:

`src/views/dashboard/widgets/VideoPublisherWidget.tsx`

Studio owner remains:

`src/views/VideoPublisher.tsx`

Both use the same canonical publishing capability model.

## Feature parity matrix to audit before coding

Create a testable inventory across both surfaces for:

- source video selection;
- source ContentBuild / Video Package selection;
- thumbnail selection;
- title;
- description;
- tags;
- audience / made-for-kids settings;
- visibility;
- schedule / premiere settings where supported;
- ad suitability / monetization settings;
- captions/subtitles where current backend supports them;
- cards / end-screen or routing assets where supported;
- package validation;
- approval state;
- blockers;
- remote-upload state;
- retry/resume state;
- publish transaction;
- YouTube binding;
- remote verification;
- draft preservation;
- provenance / selected asset IDs;
- direct handoffs from Asset Engine, Projects, Editor and Vault.

Every capability found in either current implementation is classified:

`KEEP SHARED | KEEP SURFACE-SPECIFIC PRESENTATION | MERGE | REMOVE AS DUPLICATE | BLOCKED BY BACKEND`.

No feature is removed just because only one current surface contains it.

## Shared architecture work

Prefer a small domain layer such as:

- `src/services/publisher/PublisherWorkspaceModel.ts`
- `src/services/publisher/PublisherActions.ts`
- `src/services/publisher/PublisherValidation.ts`

Only add these if current services do not already provide the equivalent.

Reuse current canonical owners first:

- Video Package;
- ContentBuild;
- `PublishingPackageProjection`;
- `PublishTransaction`;
- Asset Engine / Vault;
- YouTube transport.

Reusable visual/domain compound controls may be extracted only below the top-level surface, for example:

- publishing package selector;
- readiness/check matrix;
- publishing stage controller;
- metadata bundle editor;
- scheduling/visibility controller;
- transaction status strip.

Dashboard versions must use Widget primitives. Studio versions must use Toolbox/SubToolbox primitives.

## Dashboard signature system

The renamed Video Publisher widget must have a recognizable publishing control system, not a generic form stack.

Preferred signature:

**Publishing Gantry / Package Console**

Core mental model:

`PACKAGE → CHECK → APPROVE → SCHEDULE → PUBLISH → VERIFY`

The gantry remains recognizable through width/height contraction.

## Public-ID migration

The user-facing rename should also move the public widget identity from:

`video-uploader` → `video-publisher`

Because layout IDs are persisted, this is a schema migration, not a string replacement.

Required work:

1. add alias/migration handling in `src/views/dashboard/storage.ts`;
2. bump `DASHBOARD_SCHEMA_VERSION`;
3. preserve the prior layout backup;
4. map `order`, `hidden`, and `instances` from `video-uploader` to `video-publisher`;
5. retain old import compatibility only long enough to normalize stored state;
6. update registry, renderer, descriptions, certification, current-widget inventory, guide references and tests;
7. verify an imported legacy layout containing `video-uploader` becomes exactly one `video-publisher` instance with the same collapsed/size/height state.

Do not leave two visible widget IDs.

---

# Program B — Video Publisher + Video Manager parity across Dashboard and Studio Hub

## Current verified starting point

Dashboard:

- `video-uploader` → VideoUploaderWidget
- `data-edit` → Video Manager / VideoManagerWidget

Studio Hub:

- Video Publisher
- Video Manager

The pair already exists on both sides conceptually, but capability ownership is not guaranteed to be equal.

## Desired end state

Two creator jobs:

### Video Publisher

Creates/finalizes/publishes a new YouTube video package.

### Video Manager

Selects an already published or bound video and safely updates its editable YouTube/package metadata and related assets/settings.

Both jobs are available with equal backend capabilities from:

- Dashboard widgets;
- Studio Hub toolboxes.

## Parity strategy

Build one explicit capability contract per tool.

### Publisher capability contract

Both surfaces must share the same:

- selected ContentBuild/Video Package;
- package readiness;
- final asset selections;
- publishing checks;
- approval;
- schedule;
- publish transaction;
- retry/resume state;
- YouTube binding;
- remote verification result.

### Manager capability contract

Both surfaces must share the same:

- selected published video;
- current remote/canonical metadata snapshot;
- thumbnail;
- title;
- description;
- tags;
- monetization/ad-suitability settings where permitted;
- visibility/scheduling fields where permitted;
- captions/routing/assets when current canonical backend supports them;
- dirty/change state;
- save/update operation;
- remote confirmation;
- rollback/retry/error presentation;
- provenance and last-synced state.

## Shared selection continuity

Moving between Dashboard and Studio Hub must preserve the relevant current identity:

- `channelId`
- `contentBuildId`
- `projectId`
- `videoPackageId`
- `videoId`
- selected asset IDs

Use current ActionPacket/handoff infrastructure where available rather than URL-only guessing.

## Acceptance gate

For Publisher and Manager separately, create a parity test matrix with every capability as a row and these columns:

- Dashboard
- Studio Hub
- shared backend owner
- persisted state
- disconnected behavior
- error/recovery
- mobile behavior
- visual certification

No capability may be marked complete until both surfaces use the same backend truth.

---

# Program C — Daily Oracle becomes the single creator-decision surface

## Goal

Daily Oracle should stop giving primarily generic channel-level advice.

It should give **channel-specific and video-specific advice**, naming and reasoning about real:

- videos;
- current uploads;
- underperformers;
- top performers;
- publishing cadence;
- projects/content builds;
- audience opportunities;
- anomalies;
- packaging opportunities;
- content follow-ups;
- current production tasks.

Examples of the intended specificity:

- “Repackage *[specific video title]* because its packaging signal weakened while watch quality remains healthy.”
- “Build a sequel to *[specific top performer]*; this is the strongest current follow-up candidate.”
- “Your latest upload *[title]* is trailing its recent channel baseline; inspect title/thumbnail before changing topic.”
- “Complete the thumbnail selection for *[project/content build]* before opening another concept.”

Advice must remain evidence-backed and preserve provenance/freshness.

## Inputs to merge

Daily Oracle already owns:

- `DailyOracleDecisionEngine`;
- creator growth context;
- channel evidence;
- goals / focus lens;
- cadence evidence;
- task/calendar integration;
- streak/completion;
- Brain handoff;
- Creator Command focus console.

Add the strongest Next Best Action capabilities before retirement:

### From current `next-best-action`

- latest-video vs catalog-baseline logic;
- production-task readiness;
- top-performer follow-up logic;
- direct route/action destination.

### From PR #413 donor work

Preserve and merge the stronger planned backend architecture:

- channel-scoped Algorithm Intelligence recommendations;
- active-project context;
- recommendation score;
- confidence;
- evidence count;
- recommendation source/origin;
- top ranked alternatives;
- canonical target-tool routing;
- Dashboard fallback when governed recommendations are unavailable;
- Projects permission gating.

PR #413 is a donor, not an independent future widget requirement.

### From current Brain services

Audit and reuse rather than duplicate:

- `AlgorithmIntelligenceAccess`;
- `AlgorithmIntelligenceOrchestrator`;
- `OpportunityIntelligence`;
- anomaly intelligence;
- `ChannelIntelligence`;
- Brain evidence/privacy controls;
- current route/action packet registry.

## New Daily Oracle recommendation model

Preferred backend flow:

```
CHANNEL + VIDEO + PROJECT + TASK + ALGORITHM EVIDENCE
                    ↓
      DAILY ORACLE RECOMMENDATION ENGINE
                    ↓
 ranked creator moves with:
 video/project target
 reason
 evidence/provenance
 impact
 effort
 confidence
 source
 destination
                    ↓
        TODAY / FOCUS / EVIDENCE UI
```

Do not make the React component the ranking engine.

Extend or refactor `DailyOracleDecisionEngine` into the canonical decision owner.

Suggested view-model fields:

```ts
{
  id,
  targetType: "video" | "project" | "channel" | "task",
  targetId,
  targetTitle,
  actionType,
  title,
  detail,
  evidenceSummary,
  evidenceIds,
  source,
  impact,
  effort,
  confidence,
  score,
  route,
  handoff,
  freshness,
}
```

The exact schema must follow existing Brain/ActionPacket contracts where they already provide these fields.

## Daily Oracle UI evolution

Keep the current distinctive Daily Oracle / Creator Command identity.

Do not recreate the separate Decision Junction as another embedded widget.

Instead, use the absorbed recommendation data to strengthen:

- **BEST NEXT MOVE** — specific target/video/project;
- **QUICK WIN RAIL** — ranked lower-effort alternatives;
- **FOCUS PLAN** — goal-specific recommendations tied to real content;
- **Creator Command Focus Console** — current task + focus session;
- **Evidence view/detail** — why this specific advice is being given;
- **action handoff** — open the correct Video Manager, Publisher, Projects, Packaging, Analytics, Brain, etc.

The Daily Oracle signature should remain its strategy compass / command system.

---

# Program D — Retire Next Best Action only after parity

## Retirement rule

Do not delete `next-best-action` until Daily Oracle has passed a feature-parity test proving that every useful capability has a new owner.

Create a contract test listing every retained capability.

Deletion sequence:

1. move/share recommendation backend logic;
2. connect Daily Oracle;
3. verify specific-video/content advice;
4. verify governed recommendation precedence and fallback;
5. verify canonical route/handoff behavior;
6. verify evidence/privacy/project controls;
7. add persisted-layout migration;
8. remove `next-best-action` registry definition;
9. remove renderer mapping/import;
10. remove widget-specific CSS and implementation;
11. update picker, current-widget inventory, source map, guide, descriptions, certification and tests;
12. run full dashboard suite + production build + built-app screenshots.

## Persisted-layout behavior

When normalizing a stored layout containing `next-best-action`:

- if `daily-oracle` already exists, remove the obsolete `next-best-action` instance and preserve the existing Daily Oracle position/state;
- if `daily-oracle` does not exist, replace the `next-best-action` slot with `daily-oracle`, carrying forward the closest supported size/height and collapse state;
- never create two Daily Oracle instances from one migration;
- preserve a backup of the pre-migration layout.

Bump dashboard schema version and test exported/imported legacy layouts.

---

# Ordered implementation phases

## Follow-on Phase 1 — capability inventory and contracts

Paths to audit:

- `src/views/dashboard/widgets/VideoUploaderWidget.tsx`
- `src/views/dashboard/widgets/VideoManagerWidget.tsx`
- `src/views/VideoPublisher.tsx`
- current Studio Video Manager owner
- `src/views/StudioHub.tsx`
- Video Package / ContentBuild / Publisher services
- `src/views/dashboard/widgets/DailyOracleWidget.tsx`
- `src/services/brain/DailyOracleDecisionEngine.ts`
- `src/views/dashboard/widgets/NextBestActionWidget.tsx`
- `src/services/brain/AlgorithmIntelligenceAccess.ts`
- PR #413 donor diff

Deliverables:

- Publisher feature-parity matrix;
- Manager feature-parity matrix;
- Daily Oracle ↔ Next Best Action capability migration matrix;
- tests that fail for currently missing parity.

## Follow-on Phase 2 — shared Publisher capability core

- consolidate publishing view-model/actions onto canonical package + transaction state;
- align Dashboard and Studio Publisher;
- preserve independent top-level surfaces;
- add missing Dashboard pages/controls where Studio has capabilities;
- add missing Studio capabilities where Dashboard has useful behavior.

## Follow-on Phase 3 — rename and migrate Video Publisher widget identity

- `video-uploader` → `video-publisher`;
- `VideoUploaderWidget.tsx` → `VideoPublisherWidget.tsx`;
- registry/renderer/storage migration;
- guide/current inventory/source map updates;
- legacy-layout migration tests.

## Follow-on Phase 4 — Video Manager parity

- consolidate selection/edit/save view model;
- unify backend ownership;
- equalize capability matrix;
- preserve Dashboard widget and Studio Toolbox layouts;
- verify remote update/recovery.

## Follow-on Phase 5 — Daily Oracle intelligence merge

- extend canonical Daily Oracle recommendation engine;
- integrate real channel/video/project targets;
- ingest governed Algorithm Intelligence;
- preserve privacy/user-control gates;
- add evidence/confidence/source fields;
- add specific-video/content recommendations;
- retain deterministic fallback.

## Follow-on Phase 6 — Daily Oracle UI integration

- update Best Next Move;
- update Quick Win Rail;
- update Focus Plan;
- add evidence/detail affordance;
- action handoffs to exact target tool;
- retain Creator Command Focus Console and streak/calendar systems.

## Follow-on Phase 7 — retire Next Best Action

- parity contract green;
- persisted-layout migration;
- remove registry/renderer/widget/CSS;
- update documentation;
- remove donor-only helpers after import/reference search proves them unused.

## Follow-on Phase 8 — certification

Required:

- focused unit tests;
- dashboard registry/renderer/layout migration tests;
- Publisher/Manager parity tests;
- Daily Oracle recommendation tests;
- Brain evidence/privacy tests;
- production build;
- Dashboard 1440×1000 capture;
- Dashboard 390×844 capture;
- Studio Hub Publisher desktop/mobile capture;
- Studio Hub Manager desktop/mobile capture;
- legacy-layout migration fixture;
- disconnected/loading/empty/error/partial/stale states where applicable.

---

# Test-driven acceptance criteria

## Video Publisher rename

- no visible `video-uploader` definition remains after migration;
- legacy layout containing `video-uploader` normalizes to one `video-publisher`;
- old instance dimensions/collapse state survive when supported;
- Dashboard Video Publisher and Studio Video Publisher pass the same capability contract.

## Video Manager parity

- Dashboard and Studio edit the same canonical selected video;
- both expose the same supported metadata/settings;
- changes persist through the same backend operation;
- one surface cannot silently show stale state after the other saves.

## Daily Oracle

- recommendations identify a real target when target evidence exists;
- recommendation text does not invent unsupported video/channel facts;
- governed recommendation wins over fallback when permitted and available;
- fallback remains deterministic when Algorithm Intelligence is unavailable;
- project context is used only when allowed;
- evidence/privacy controls remain enforced;
- actions route to the canonical destination.

## Next Best Action retirement

- every retained Next Best Action capability has a passing Daily Oracle test;
- registry has no `next-best-action`;
- renderer has no `next-best-action`;
- persisted layouts normalize safely;
- no orphaned CSS/imports/docs remain;
- Daily Oracle remains one widget instance.

---

# Explicit non-goals

- Do not merge Video Publisher and Video Manager into one mega-tool; they are separate creator jobs.
- Do not use one top-level React component with a Dashboard/Studio mode flag.
- Do not delete Next Best Action before feature parity.
- Do not duplicate Algorithm Intelligence inside Daily Oracle.
- Do not bypass publishing approval, privacy, OAuth, or external-write gates.
- Do not rename persisted widget IDs without schema migration.
- Do not claim Publisher/Manager parity from visual similarity alone.

---

# Decision summary

After the current widget program:

1. **Video Uploader becomes Video Publisher.**
2. **Dashboard and Studio Publisher converge on one capability set.**
3. **Dashboard and Studio Video Manager converge on one capability set.**
4. **Daily Oracle becomes more specific to the actual channel, videos, projects, and current content.**
5. **Next Best Action's useful backend intelligence is absorbed into Daily Oracle.**
6. **Next Best Action is retired only after tested parity and persisted-layout migration.**
