# PR #78 → Main Safe Merge Resource

**Document date:** 2026-09-03  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**PR:** #78 — **Anomaly intelligence foundation**  
**Source branch:** `feature/anomaly-intelligence-foundation`  
**Target branch:** `main`

## Executive decision

PR #78 is a small, additive foundation and is a good candidate to merge into `main` **after a focused correction-and-verification pass**.

Current branch comparison:

- **10 commits ahead of main**
- **0 commits behind main**
- **10 files changed**
- **332 additions**
- **0 deletions**
- no application UI route is mounted by this PR
- no direct YouTube API/auth runtime is added
- VT-SYNC remains the raw-data owner
- `analytics-canon` remains the public analytics boundary

Because the PR is additive and currently ahead-only, the safest strategy is **not** to broaden it. Fix the known dataset-key assumptions, run focused and baseline regression gates, then **squash merge** the foundation as one atomic change.

## What PR #78 adds

### analytics-canon

Modified:

- `src/services/analytics-canon/contracts.ts`
- `src/services/analytics-canon/index.ts`
- `src/services/analytics-canon/intelligenceEvidence.ts`

New capability:

`getCanonicalIntelligenceDatasetRows(snapshot, datasetId)`

This exposes full normalized rows for one canonical VT-SYNC intelligence dataset while preserving:

- dataset status
- snapshot ID
- channel ID
- source provenance
- freshness
- missing metrics
- privacy filtering

### anomaly-intelligence service

Added:

- `contracts.ts`
- `detector.ts`
- `service.ts`
- `brainContext.ts`
- `index.ts`
- detector tests

Foundation behavior:

- robust median baseline
- median absolute deviation
- spike/drop detection
- relative delta
- surprise score
- impact score
- confidence
- evidence refs
- Brain-context formatting
- optional capture into the existing Brain learning evidence system

### Brain

PR #78 adds one Brain capability registration:

`signal-anomaly-intelligence`

for:

- analytics
- strategy
- revenue
- audience

It requires channel data and does not itself add a new model/API path.

---

# 1. Merge invariants

Do not merge PR #78 if any of these are violated.

## Ownership

**VT-SYNC must remain raw analytics authority.**

Anomaly Intelligence may derive events from canonical rows but must not introduce:

- a second analytics database
- direct ad-hoc YouTube Analytics fetches
- auth/token ownership
- a competing channel-profile store

## Analytics access

Anomaly code must access analytics through:

`VT-SYNC → analytics-canon → anomaly-intelligence`

not directly through legacy DataStore/Selectors/API helpers.

## Brain

An anomaly is an **observation**, not automatically a channel fact.

The intended future chain is:

`anomaly → Brain hypothesis/recommendation → action/outcome → Learning Ledger → validated Profile learning`

The PR may capture anomaly evidence into the current Brain learning evidence store, but the merge must not add automatic promotion of individual anomalies into durable Channel Profile memory.

## UI

Do not add Anomaly Radar UI, routes or auto-action behavior to this PR.

Keep #78 a foundation merge. Mounting UI and action execution should be follow-up PRs.

---

# 2. Known issue to fix before merge

## A. `traffic_day` currently groups on the wrong normalized field

PR #78 currently declares:

```ts
{
  datasetId: "traffic_day",
  dateKey: "date",
  metricKey: "views",
  entityKey: "source"
}
```

But canonical VT-SYNC normalization maps `traffic_day` through:

`normalizeTrafficRows(rows, "term")`

Therefore the anomaly scanner should group traffic sources by **`term`**, not `source`.

### Required edit

Change:

```ts
entityKey: "source"
```

to:

```ts
entityKey: "term"
```

### Add regression test

Fixture:

- day 1 Browse = 100
- day 1 Search = 20
- ...
- latest Browse = 900

Assert:

- Browse and Search become separate series
- no series is named `Unknown`
- the Browse spike is detected

This should be considered a **pre-merge correction**, not deferred cleanup.

---

# 3. Dataset assumption to remove or explicitly defer

## `formats_subscribers` is not currently a daily anomaly series

PR #78 scans:

```ts
{
  datasetId: "formats_subscribers",
  family: "audience",
  dateKey: "date",
  metricKey: "views",
  entityKey: "status"
}
```

The current VT-SYNC registry describes this as **Formats × Subscriber Status** and canonical normalization produces:

- content/format
- subscribed status
- performance measures

It is not established by the current PR as a day-grained dataset.

A magnitude detector that expects multiple dated observations should not silently treat an aggregate table as a time series.

## Safe merge options

### Preferred for PR #78

Remove `formats_subscribers` from `DATASET_SCANS` for now.

Keep audience mix/share anomaly detection for the follow-up detector PR, where it should be implemented as a **distribution/share-shift detector**, not a fake daily magnitude series.

### Alternative

Only retain it if a real dated source is demonstrated by a focused fixture and canonical table contract.

Do not fabricate dates or reuse sync timestamps as observation dates.

---

# 4. Full-row accessor safety checks

`getCanonicalIntelligenceDatasetRows()` is the most architecturally important change in #78 because it expands what intelligence services can access.

Before merge, add/confirm tests for:

1. unknown dataset ID returns `null`;
2. privacy filters are applied through the existing canonical `tableRows()` path;
3. failed/stale/partial/unavailable status propagates correctly;
4. missing metrics are preserved;
5. source provenance is preserved;
6. returned rows are normalized canonical rows;
7. calling the accessor does not mutate the snapshot;
8. the existing 34-dataset registry assertion still passes.

## Performance rule

Full rows are allowed for internal derived analysis, but Brain context must remain bounded.

Do **not** replace `buildCanonicalIntelligenceEvidence()` with unbounded raw-row prompt injection.

The anomaly engine should compute locally and send only:

- anomaly record
- affected entities/video IDs
- evidence refs
- compact supporting metrics

into Brain.

---

# 5. Brain capability safety checks

Adding `signal-anomaly-intelligence` changes the capability registry for analytics/strategy/revenue/audience requests.

Before merge:

- run registry unique-ID governance tests;
- test that channel-less snapshots do not select it;
- test a normal analytics query can select it without displacing required core capability behavior unexpectedly;
- verify the six-capability default ceiling still produces sensible capability order;
- confirm no code assumes a hard-coded capability count.

Because the capability currently has no separate tool executor, the merge must not imply that anomaly detection is live simply because its capability is selectable.

Document it as **foundation / derived capability available for integration**.

---

# 6. Brain learning boundary

PR #78 contains:

`captureAnomalyAsBrainLearning()`

This currently writes a reflected learning-evidence entry using `captureAIBrainLearningEvent()`.

The existing self-improvement layer does **not** automatically promote every captured event; promotion is a separate step. That makes the current function acceptable as an evidence bridge.

However, before any later auto-scan wiring:

- do not call it automatically for every low-value anomaly;
- deduplicate by anomaly/pattern identity;
- require impact/confidence thresholds;
- connect recommendations to Outcome/Evaluation;
- promote durable lessons only after repeated evidence / contradiction review.

For the #78 merge itself, safest state is for this function to remain **available but not automatically invoked by sync completion**.

---

# 7. Required test gate

Run these gates on the corrected PR branch.

## Focused

```bash
npm test -- src/services/anomaly-intelligence/__tests__/detector.test.ts
```

Also run tests covering:

- analytics-canon intelligence evidence
- VT-SYNC table normalization
- traffic_day normalization
- Brain capability registry / route registry governance

## Type/build

```bash
npm run typecheck
npm run build
```

Use the repository's exact package-script names if they differ.

## Full suite

Run the repository full test suite.

If `main` already has known unrelated red tests, do not require #78 to repair unrelated failures. Instead compare:

```text
main baseline failures
vs
PR #78 failures
```

**Merge condition:** #78 introduces **zero new failures**.

## Static quality

Run lint/static-quality checks for changed files at minimum.

No new lint/type errors should be accepted in:

- analytics-canon
- anomaly-intelligence
- BrainCapabilityRegistry

---

# 8. Manual code-review checklist

## analytics-canon

- [ ] full-row accessor uses canonical privacy-filtered `tableRows`
- [ ] no legacy runtime imports added
- [ ] no source ownership moved out of VT-SYNC
- [ ] dataset status/freshness/provenance preserved
- [ ] barrel export is intentional and documented

## anomaly-intelligence

- [ ] traffic_day uses `term`, not `source`
- [ ] formats_subscribers removed from dated magnitude scans unless proven dated
- [ ] robust median/MAD math handles zero-baseline safely
- [ ] ordinary movement test remains non-anomalous
- [ ] series sorting is deterministic
- [ ] anomaly IDs are deterministic enough for future persistence
- [ ] evidence refs contain snapshot/dataset/entity/metric
- [ ] no raw data sent directly to model prompts

## Brain

- [ ] capability ID unique
- [ ] requiresChannelData works
- [ ] no hard-coded capability counts fail
- [ ] anomaly capability doesn't silently grant tool writes
- [ ] no Profile mutation is added

---

# 9. Merge strategy

## Recommended: squash merge

PR #78 consists of a sequence of small foundation commits and is conceptually one unit.

Recommended final commit:

```text
feat(intelligence): add canonical anomaly detection foundation
```

Suggested body:

```text
- expose canonical privacy-filtered dataset rows
- add robust anomaly contracts/detector
- preserve VT-SYNC provenance in anomaly evidence
- add bounded Brain anomaly context helper
- register signal anomaly intelligence capability
- add detector regression tests

No UI mount, automatic sync trigger, or durable profile promotion.
```

## Why squash

- keeps `main` history atomic;
- the ten branch commits are implementation steps, not ten independent product changes;
- easy rollback if the foundation causes an unexpected regression;
- PR discussion still preserves detailed history.

Do **not** merge PR #77 or PR #72 together with #78.

PR #78 should land independently.

---

# 10. Exact safe merge procedure

## Step 1 — Freeze scope

No new UI, persistence, API fetching, action execution or Profile-writing features.

## Step 2 — Correct the two dataset assumptions

- `traffic_day.entityKey = "term"`
- remove/defer `formats_subscribers` daily magnitude scan

## Step 3 — Add focused tests

Especially the traffic grouping regression.

## Step 4 — Re-check main relationship

Immediately before merge:

```text
feature/anomaly-intelligence-foundation vs main
```

If still **0 behind**, no rebase is necessary.

If main has advanced:

1. fetch current main;
2. rebase or merge main into #78 according to repository convention;
3. manually review all three modified canonical files and `BrainCapabilityRegistry.ts`;
4. rerun all gates.

Do not force-push over unreviewed conflict resolutions.

## Step 5 — Run gates

Focused → typecheck → build → full suite → static quality.

## Step 6 — Review diff again

Expected final scope should remain approximately:

- three analytics-canon files modified
- anomaly-intelligence service added
- Brain capability registry +1 entry
- tests

Unexpected auth, server, UI, editor, billing, dashboard or deployment changes = **STOP**.

## Step 7 — Squash merge

Only after zero new regression failures.

## Step 8 — Do not immediately delete branch

Keep the source branch temporarily as a recovery/reference point until post-merge verification passes.

## Step 9 — Post-merge verification on main

Confirm:

- production build still passes;
- existing analytics evidence bundles unchanged;
- Intelligence Hub/Brain can still build context;
- no route/UI change occurred;
- no sync is slower simply because anomaly code exists;
- no anomaly learning entries are generated automatically unless explicitly called.

---

# 11. Rollback plan

Because #78 is foundation-only and additive, rollback should be simple.

If a regression appears:

1. revert the single squash merge commit;
2. verify analytics-canon evidence behavior returns to the previous main state;
3. keep #78 branch intact;
4. repair on a new/follow-up branch;
5. do not restore only half of the anomaly service while leaving the canonical accessor/capability in ambiguous state.

The full foundation should rollback as one unit.

---

# 12. Follow-up PRs after #78

Do not overload the foundation merge.

Recommended sequence:

## #78A — anomaly data correctness

- dataset registry for anomaly-compatible shapes
- new-entity detector
- share/distribution-shift detector
- daily/cohort baselines
- traffic/search/external/playback tests

## #78B — persistence + correlation

- AnomalyEvidenceStore
- anomaly lifecycle
- cross-dataset clusters
- correlation IDs
- deduplication / persistence thresholds

## #78C — Brain + Evaluation

- bounded anomaly evidence retrieval
- hypothesis/explanation contract
- recommendation lineage
- Outcome Ledger integration
- Channel Profile baselines read-only

## #78D — Algorithm Momentum

- anomaly → controlled strategy signals
- HOLD / AMPLIFY / INSPECT / RETARGET candidates
- approval-aware actions
- evaluation checkpoints

## #78E — Anomaly Radar UI

- Radar
- anomaly stack
- correlation graph
- explanation/evidence drawer
- action queue
- responsive/mobile certification

## #78F — Adaptive channel learning

Only after outcome data exists:

- repeated anomaly-pattern learning
- contradictions
- channel-specific thresholds
- Learning Ledger
- creator-approved Profile promotion

---

# 13. Final merge criterion

PR #78 is ready for main when all of the following are true:

- [ ] branch is current with main or conflicts are explicitly resolved
- [ ] `traffic_day` grouping key corrected
- [ ] aggregate `formats_subscribers` is not treated as a fake daily series
- [ ] focused detector tests pass
- [ ] analytics-canon regression tests pass
- [ ] Brain registry governance passes
- [ ] typecheck/build pass
- [ ] full suite shows no new failures against main baseline
- [ ] no unexpected files entered the PR
- [ ] no raw-data ownership moved out of VT-SYNC
- [ ] no direct YouTube API/auth path added
- [ ] no automatic durable learning/Profile write added
- [ ] final review approves squash merge

## Recommended decision

**MERGE AFTER CORRECTIONS + GREEN DELTA GATES.**

The architecture is correct: PR #78 builds on `analytics-canon`, preserves VT-SYNC ownership, adds a derived intelligence service, and keeps the initial blast radius small. The two dataset-shape assumptions should be corrected before merge so the foundation lands cleanly enough to support the larger anomaly system without immediately carrying silent data-quality debt.
