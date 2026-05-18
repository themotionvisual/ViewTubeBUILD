# PerformanceHub + IntelligenceHub Full-Stack Ops Workflow

## Purpose
This is the authoritative operational runbook for analytics flow in `viewtubeX`.

Use it to:
- diagnose `0/0`, `-`, or blocked report states quickly,
- route fixes to the correct layer,
- preserve source-of-truth contracts,
- verify correctness across all four PerformanceHub toolboxes.

This document defines workflow only. It does not change runtime interfaces.

## Runtime Surfaces (Source of Truth)
- Fetch layer: `src/services/youtube/youtubeAnalyticsFetcher.ts`
- Sync/coordinator layer: `src/services/SyncCoordinator.ts`
- Canonical cache store: `src/services/canonicalAnalyticsStore.ts`
- Contract + selectors layer: `src/services/analyticsContract.ts`, `src/services/analyticsSelectors.ts`, `src/services/analyticsCapabilityMatrix.ts`
- PerformanceHub surface: `src/views/PerformanceHub.tsx`
- IntelligenceHub generation surface: `src/components/IntelligenceHub/IntelligenceHub.tsx`, `src/components/IntelligenceHub/ultimateReport.ts`

## Deterministic Pipeline

### Stage 1: Source + Fetch Shape (`youtubeAnalyticsFetcher`)
Objective: get API-compatible payloads with explicit request-shape diagnostics.

Required behavior:
- classify requests by request class (`video_filter_chunk`, `video_top_videos_channel_filter`, `channel_creator_content_type`),
- keep metric-group isolation (`core_performance`, `engagement`, `impressions_ctr`, `monetization`, `audience_mix`, `end_screen`),
- for thumbnail metrics (`videoThumbnailImpressions`, `videoThumbnailImpressionsClickRate`), treat API `400` shape failures as request-class quarantine and switch to channel-scoped top-videos shape with local filtering,
- never infer metric support from payload column order; use `columnHeaders` mapping.

Operator checks:
- verify attempted metric groups include `impressions_ctr` when expected,
- verify failed group diagnostics include request class and shape outcome,
- verify split retries stay deterministic and bounded within a run.

### Stage 2: Sync + Diagnostics Persistence (`SyncCoordinator`)
Objective: persist a reliable analytics snapshot and sync diagnostics without losing root cause.

Required behavior:
- maintain `yt_analytics_cache` schema/version safety,
- persist diagnostics for each active window,
- preserve request-class-level failure metadata and invalid-combo suppression behavior,
- keep user-driven/manual sync semantics unless explicitly changed.

Operator checks:
- active window has `syncDiagnostics`,
- `knownInvalidCombos` does not grow unbounded for the same class in one run,
- `failureReasons` remains actionable and references the failing request class/group,
- quota/reset fallback does not erase explainability.

### Stage 3: Canonical Mapping + Master Table Readiness (contracts/selectors)
Objective: transform raw analytics into canonical rows and stable master-table semantics.

Required behavior:
- canonical identity drives dedupe (not raw display label text),
- `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` remain first-class fields,
- annotation/card metrics remain semantically isolated (no cross-alias contamination),
- master row selectors propagate numeric values when present and explicit unavailable state when absent.

Operator checks:
- exactly one semantic impressions column,
- exactly one semantic thumbnail CTR column,
- values are numeric when source exists,
- unavailable states show `-` with diagnostics context, not silent zeroing.

### Stage 4: PerformanceHub Presentation + Toolbox Behavior (`PerformanceHub`)
Objective: render trustworthy analytics with localized, toolbox-specific state handling.

Toolboxes in scope:
- `intelligence-hub`
- `channel-data`
- `master-tables`
- `shorts-retention`

Required behavior:
- diagnostic states stay visible to operators,
- chart/table rendering does not mutate contract semantics,
- source mode (`api`/`csv`/`hybrid`) stays aligned with user intent,
- one toolbox failure does not silently corrupt another toolbox's health signal.

### Stage 5: IntelligenceHub Preflight + Section Generation + Context Pack
Objective: generate reports with explicit preflight gates and traceable section outcomes.

Required behavior:
- preflight blocks must remain explicit via `REPORT_PREFLIGHT_BLOCKED::<json>`,
- section status timeline must match actual generation outcomes,
- degraded mode remains explicitly labeled (no silent success),
- generated context pack persistence must remain consistent with report metadata.

Operator checks:
- preflight object explains remediation,
- session meta counts (`completed`, `failed`, `degraded`) reconcile with section states,
- event timeline aligns with rendered section statuses,
- ultimate report/context storage keys are written only with valid payloads.

## Do-Not-Break Invariants

### Cache + Diagnostics Invariants
- `yt_analytics_cache` is the canonical persisted analytics snapshot.
- `syncDiagnostics`, `knownInvalidCombos`, and `failureReasons` must remain present and interpretable.
- Diagnostics cannot be replaced by generic failure text.

### Metric Invariants
- `videoThumbnailImpressions` and `videoThumbnailImpressionsClickRate` must remain first-class analytics metrics.
- No alias bleed between annotation and card semantics.
- Canonical identity, not label text, determines dedupe and mapping.

### Report Invariants
- Preflight gating remains explicit (`REPORT_PREFLIGHT_BLOCKED::<json>`).
- Degraded report state remains explicit and user-visible.
- Section-level failure must never be re-labeled as clean success.

### Display Cap Invariants
- Any cap must be classified as fetch cap, storage cap, or display cap.
- Display caps must never be presented as source data loss.
- If a display cap is active, UI must expose total rows, rendered rows, and an action to show all.

## Strict Per-Toolbox Operational Gates

### 1) Intelligence Hub Toolbox Gate
Pass conditions:
- blocked generation exposes actionable preflight reason and remediation,
- section timeline state equals actual generation status,
- degraded/failure session metadata is surfaced accurately.

Fail conditions:
- block reason missing or opaque,
- section states and timeline diverge,
- degraded sections presented as full success.

### 2) Channel Data Toolbox Gate
Pass conditions:
- sync diagnostics expose request-class-level outcomes,
- source mode (`api`/`csv`/`hybrid`) matches user-selected intent,
- retries/invalid-combo suppression are visible and bounded.
- uploaded source strip updates immediately after successful parse.

Fail conditions:
- request failures visible only as generic errors,
- source mode drift from user intent,
- repeated hidden retries with no operator signal.

### 3) Master Tables Toolbox Gate
Pass conditions:
- headers deduped by canonical identity,
- one semantic impressions column and one semantic thumbnail CTR column,
- numeric values when available; otherwise `-` with diagnostics context.

Fail conditions:
- duplicate semantic columns,
- placeholder zeros presented as real data,
- unavailable metrics hidden without explanation.

### 4) Shorts Retention Toolbox Gate
Pass conditions:
- retention-specific failures remain isolated from channel-wide health,
- unavailable retention metrics degrade explicitly,
- retention paths do not mutate shared metric health semantics.

Fail conditions:
- retention failures changing channel-level availability status,
- silent zero/default rendering for unavailable retention inputs.

## Change-Routing Matrix (Where Fixes Must Land)
- Request-shape/API `400` issues -> `youtubeAnalyticsFetcher` (Stage 1)
- Retry/suppression/invalid-combo behavior -> `SyncCoordinator` (Stage 2)
- Field naming/alias/canonical-identity issues -> contract + selector layer (Stage 3)
- Rendering/header/column display behavior -> `PerformanceHub` (Stage 4)
- Preflight/session/section generation flow -> `IntelligenceHub` + `ultimateReport` (Stage 5)
- chart mount/sizing warning bursts -> chart mount guard in presentation layer (`PerformanceHub`/chart wrappers)

Routing rule:
- If symptom appears in UI but diagnostics are wrong, fix diagnostics layer first.
- If diagnostics are correct but UI interpretation is wrong, fix presentation layer.

## Safe-Edit Playbook

### A) Pre-Edit Triage Checklist
- identify active window and source mode,
- capture `syncDiagnostics` snapshot before edit,
- classify failure by request class, group, and scope (fetch/sync/contract/ui/report),
- confirm whether failure is isolated or cross-toolbox.
- reconcile counts: fetched inventory vs classified vs canonical rows vs filtered rows vs rendered rows.
- if rendered count is much lower than canonical count, inspect display cap and filter chain before fetch logic.

### B) Minimal-Change Strategy by Failure Class
- request-shape failure: patch fetch path only, preserve downstream contracts,
- diagnostics drift: patch coordinator persistence/shape only,
- alias/column drift: patch contract/selector mapping only,
- rendering drift: patch PerformanceHub interpretation only,
- report gating drift: patch preflight/session flow only.
- upload visibility drift: patch source-strip/state-store reconciliation only.

### C) Post-Edit Verification Sequence
1. Backend-first checks:
- fetch request class outcomes,
- sync diagnostics completeness,
- canonical row/master-table mapping.
2. UI-first checks:
- four toolbox gates,
- chart/table header/value correctness,
- report preflight/timeline/state consistency.
- source strip/store checks:
- `sync` mode: cache-backed list is correct.
- `storage` mode: brain/state-backed list is correct.
- `both` mode: merged list is deduped and consistent.

### D) Rollback Triggers + Stop Conditions
Rollback immediately when:
- diagnostics become less explicit,
- semantic metric identity changes unexpectedly,
- one toolbox fix introduces cross-toolbox status contamination,
- preflight errors become generic or non-actionable.

Stop and re-triage when:
- diagnostics and rendered state contradict each other,
- repeated retries continue without new failure classification,
- a fix requires contract changes outside the targeted stage.
- chart containers report invalid dimensions (`width/height <= 0`) during steady-state render.

## Preflight + Generation Contracts

### Preflight Evidence Contract (Typed)
- Preflight decisions must include typed evidence fields, not only booleans.
- Required evidence domains:
- `master_table` (canonical row presence and KPI coverage),
- `api_cache` (parse success, expected payload shape, timestamp),
- `user_profile` (`isAuthenticated` or cached profile identity).

Canonical blocker codes:
- `missing_master_table_rows`
- `missing_api_cache`
- `missing_user_profile_auth_or_cache`

### Timeout + Partial Render Contract
- Stage timeout budgets must remain explicit and independently diagnosable.
- At most one retry per stage with reduced context.
- Partial render is canonical behavior:
- completed sections render fully,
- degraded sections render with reason/evidence,
- failed sections stay visible as failed.
- Never auto-upgrade degraded/failed sections to complete.

### Legacy Fallback Containment
- `/performance` must have one authoritative render contract.
- Legacy adapters may translate compatibility payloads but may not override staged authoritative metadata.
- System/prompt/backend artifacts must never leak into user-facing section prose.

## Presentation Reliability Contracts

### Chart Mount Safety + Warning Dedupe
- Data-driven chart mount requires non-zero measured container dimensions and non-empty dataset.
- On empty data, render explicit diagnostic panel instead of blank shell.
- Deduplicate repeated warnings per run:
- chart sizing warnings by chart key,
- image 404 warnings by video id,
- remote animation/asset warnings by URL.

### Upload Visibility Contract
- Uploaded source list must update immediately after parse success.
- Clear/remove actions must update all active stores required by the current mode.
- Merged mode must dedupe by deterministic file-merge identity.

## Verification Matrix

### Source/Fetch Validation
- inspect cases where thumbnail metrics fail under one shape and succeed under channel-scoped top-videos shape,
- verify request class and outcome are persisted in diagnostics.

### Canonical/Master-Table Validation
- verify one canonical impressions column and one canonical thumbnail CTR column,
- verify numeric propagation when data exists,
- verify `-` plus actionable context when unavailable.

### PerformanceHub Toolbox Validation
- run strict pass/fail gates for Intelligence Hub, Channel Data, Master Tables, Shorts Retention,
- confirm localized failures do not collapse unrelated toolboxes.
- verify display caps (if any) are declared and visible as display-only constraints.

### IntelligenceHub Validation
- verify blocked, degraded, and success flows,
- verify section timeline and session meta reconciliation,
- verify context pack persistence consistency with generated report state.
- verify stage outcome statuses reconcile with retry counts and timeout diagnostics.

### Regression Guards
- AI queue/entitlement failures must not corrupt analytics diagnostics,
- `creatorContentType` failures must not mislabel impressions/CTR availability.
- BYO key path vs platform-billed path must be distinguishable; entitlement failures must not mask core analytics health.

## Run Health Snapshot (Per Sync/Generate)
Record per run:
- run id and timestamp,
- source mode and analytics window,
- fetched/classified/canonical/filtered/rendered counts,
- preflight outcome and blocker codes,
- stage outcomes (`stageA`, `stageB`, `diagnosis`, `keyword`),
- retries and elapsed timings,
- completed/degraded/failed section counts.

## Release Readiness Gate
Ship only when all are true:
- preflight false-block rate is zero in tested scenarios,
- timeline + generation stream remain mounted in all terminal states,
- partial render behavior is consistent and non-deceptive,
- no hidden row/video display caps are misread as data loss,
- uploaded source strip reflects live state immediately,
- user-facing section content is evidence-linked and free of system/prompt leakage.

## Assumptions + Defaults
- Sync remains user-driven/manual by default.
- Existing runtime contracts remain the source of truth.
- This runbook governs operations and edits; it does not redefine product behavior by itself.
