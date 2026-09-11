# ViewTube PR #77 -> Main
## Safe Merge, Feature Combination & Optimization Guide

**Date:** 2026-09-03  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**PR #77 branch:** `refactor/viewtubex-clean-consolidation`  
**Target:** `main`  
**Current relationship:** branches are diverged; #77 is 25 commits ahead and 15 commits behind current main.

---

## 1. Purpose

This document is only about safely combining PR #77 with current `main`.

It does not serve as the canonical VT-SYNC or analytics architecture reference. The separate document `VIEWTUBE_VT_SYNC_ANALYTICS_ARCHITECTURE_MASTER_REFERENCE_2026-09-03` covers that system in depth.

PR #77 is not a normal feature PR. It is a broad consolidation branch containing cleanup, stabilization, references, quarantine moves, VT-SYNC work, analytics work, Brain/Intelligence work, dashboard/widget systems, User Guide work, account/auth changes, YouTube transport changes, Comment Responder changes, Shorts Generator work, editor bridge work, and repository/tooling changes.

Because the branch is broad and currently behind main, the safest goal is not "merge every file from #77." The goal is:

> Preserve newer verified main behavior, recover and combine the best #77 features, converge duplicates onto canonical owners, and land one stable post-#77 main that can become the base for PR #78.

## 2. Current Merge Risk Profile

### High-risk reasons

- #77 is 15 commits behind current main.
- #77 touches authentication/session code.
- #77 touches YouTube transports and server routes.
- #77 touches the VT-SYNC acquisition/storage layer.
- #77 touches `analytics-canon`.
- #77 touches Brain/Intelligence services.
- #77 touches large dashboard/widget surfaces.
- #77 moves substantial old analytics and editor code into `_quarantine/`.
- #77 changes package/build configuration.
- #77 changes User Guide registries and navigation.
- #77 contains many independently valuable features that should not all be resolved with one wholesale "ours" or "theirs" choice.

### Positive reasons it is mergeable with care

- Much of the branch is additive or cleanup-oriented.
- Quarantine is explicit rather than silently deleting historical implementations.
- VT-SYNC has tests for analytics bundle, inventory, lifetime sync, manual imports, packed datasets, snapshot subscriptions, controller and table UI.
- YouTube transports have focused tests.
- Dashboard/widget systems have focused tests.
- User Guide registries have focused governance tests.
- The branch already pushes the application toward canonical registries rather than one-off hardcoded surfaces.

## 3. Canonical Ownership Rules During Conflict Resolution

| Concern | Canonical owner after #77 |
|---|---|
| session/login/account | current server-owned account/auth contract |
| Google/YouTube request transport | canonical YouTube transport/service layer |
| raw analytics facts | VT-SYNC |
| analytics public consumer boundary | analytics-canon |
| video identity | canonical video asset/catalog services |
| durable channel intelligence | Channel Profile |
| AI orchestration | Brain |
| tool capability metadata | Super Tool / Tool Capability registry |
| sync unit definitions | VT-SYNC sync-unit registry |
| data table definitions | VT-SYNC table registry |
| traffic-detail dataset definitions | traffic-detail registry |
| local analytics persistence | VT-SYNC IndexedDB repository |
| CSV classification | CSV taxonomy + manual import adapters |
| visual/module definitions | visual and widget registries |
| old Performance Hub implementations | quarantine/reference only |
| User Guide feature truth | User Guide registries, not prose-only duplicated lists |

### Non-negotiable rule

Do not restore an older whole file merely to recover one feature. Identify the feature, identify its canonical current owner, port the behavior into that owner, preserve/add tests, and leave obsolete authority quarantined or retired.

## 4. Required Safety Anchors Before Integration

Before touching `main`:

1. Create a branch/tag for current main.
2. Create a branch/tag for current #77 head.
3. Record current production deployment SHA.
4. Record current auth/session known-good behavior.
5. Record current VT-SYNC known-good behavior.
6. Run the current main test suite and save its failure baseline.
7. Run #77 tests and save its failure baseline.
8. Record environment-dependent failures separately from code failures.

Recommended anchors:

```text
recovery/main-before-pr77
recovery/pr77-head-before-integration
integration/pr77-to-main-2026-09-03
```

## 5. Recommended Integration Branch Strategy

Because #77 is behind main and broad, create a dedicated integration branch from the latest `main`. Do not make conflict decisions directly on `main`.

Conflict philosophy:

- Current verified main wins when it contains newer behavior.
- #77 additions are re-applied onto that newer base.
- Canonical registries and owner services win over duplicated local implementations.
- Compatibility adapters are temporary bridges, not new long-term authorities.
- Quarantine remains non-runtime.

## 6. Merge in Subsystem Order

Resolve in this order so low-level architecture is stable before UI:

1. package/build/tooling
2. auth/account/billing
3. YouTube transport
4. VT-SYNC contracts/persistence
5. VT-SYNC query/sync engine
6. VT-SYNC registries
7. CSV/manual imports
8. analytics-canon
9. Brain/Intelligence
10. data tables and Data Visuals
11. dashboard/tool surfaces
12. User Guide/navigation
13. quarantine/governance

### Auth/account invariants

- cache state never grants authentication;
- one session owner;
- reload preserves a valid session;
- logout removes authority;
- reconnect and missing-scope behavior remain distinct;
- billing/account state is not derived from analytics.

### YouTube transport invariants

- server proxy behavior is intentional;
- client fallback handles true transport unavailability only;
- scope, quota and auth failures remain distinct.

### VT-SYNC invariants

- one local database contract;
- raw reports and canonical table rows remain separate;
- packed dataset manifests/chunks remain recoverable;
- snapshot hydration survives reload;
- full/incremental inventory pagination remains correct;
- lifetime daily sync remains durable;
- date pagination, row pagination and video batching remain separate mechanisms;
- partial failures preserve usable successful data.

### CSV invariants

- imports are additive;
- Video ID is preferred for video-level enrichment;
- short CSVs never replace a larger API dataset;
- CSV-only fields retain provenance;
- unknown CSVs cannot corrupt canonical data.

### analytics-canon goal

`analytics-canon` becomes the only public analytics boundary for Brain, Anomaly, Data Tables, Data Visuals and other intelligence consumers.

### Brain goal

Preserve bounded evidence, confidence, provenance and creator control. One-off observations do not become durable Channel Profile facts.

### Quarantine rule

`_quarantine/` is evidence, not runtime. Port unique behavior with parity tests before eventual retirement.

## 7. Feature Combination Matrix

| #77 feature/system | Combine into | Keep? | Optimization |
|---|---|---|---|
| YouTube API expert skill | agent/reference layer | yes | keep separate from runtime auth/API ownership |
| VT-SYNC local stack | canonical data layer | yes | make all analytics consumers use canonical adapters |
| packed datasets | VT-SYNC persistence | yes | keep large datasets out of lightweight snapshot projections |
| manual CSV imports | VT-SYNC enrichment | yes | unify recognition, provenance and merge keys |
| analytics-canon evidence | analytics public layer | yes | eliminate ad-hoc feature-level analytics reads |
| Intelligence Hub changes | Brain surfaces | yes | bounded context and evidence only |
| Comment Responder controller | creator engagement | yes | use video catalog + channel context + outcome tracking |
| Shorts Generator bridge | creator workflow | yes | route project assets through shared IDs |
| dashboard widgets | dashboard registry | selectively | remove duplicate data calculations inside widgets |
| User Guide registries | documentation | yes | eventually generate from system/tool registries |
| old Performance Hub | quarantine | no runtime | harvest unique behavior only |
| old graph/toolbox copies | quarantine | no runtime | visual parity/reference only |
| old editor copies | quarantine | no runtime | preserve canonical VT_E1 path |

## 8. Optimization Opportunities While Merging

- Move remaining old Performance Hub/legacy selector/raw VT-SYNC consumers toward `analytics-canon`.
- Make every sync control project the same sync-unit registry.
- Make visuals explicitly declare datasets, metrics, dimensions and supported windows.
- Project UI account state from the server-owned account/session contract.
- Use parity tests as migration proof instead of relying on manual inspection.

## 9. Required Test Gates

Focused gates should cover account/auth, YouTube transports, VT-SYNC analytics bundle, local DB, inventory, lifetime sync, manual imports, packed datasets, snapshot subscription, controllers, Data Visuals, data table UI, analytics-canon, Brain integration, dashboard/widget governance and User Guide registries.

Repository gates:

- typecheck;
- production build;
- full suite;
- lint/static-quality checks.

Compare against the current `main` baseline. #77 must introduce zero unexplained new failures.

## 10. Real-Data Smoke Test

Using a real connected test channel:

1. sign in and reload;
2. verify account identity;
3. sync channel metadata;
4. sync full video inventory;
5. sync lifetime daily analytics;
6. sync traffic overview;
7. sync one paginated traffic-detail dataset;
8. sync demographics/geography;
9. sync revenue where available;
10. close/reopen browser;
11. confirm IndexedDB recovery;
12. upload one known YouTube Studio CSV;
13. confirm additive merge;
14. open corresponding Data Table;
15. open related Data Visual;
16. verify both show the same canonical values;
17. verify Brain evidence references the same source;
18. test mobile;
19. test production-like deployment.

## 11. Stop Conditions

Stop if login starts depending on analytics cache; VT-SYNC and Performance Hub both become active sources of truth; conflict resolution restores old whole-file analytics implementations; CSV replaces rather than enriches API data; simulated data appears as real; the failure delta is unexplained; account/transport behavior becomes ambiguous; or quarantine becomes a production import.

## 12. Merge Commit and Rollback

Preserve the PR review history and produce a clearly identifiable integration point. Immediately after successful merge create a post-#77 recovery tag/branch.

Rollback: preserve pre-merge main, revert the integration merge if required, repair on a new branch, and retain #77 as donor evidence until all subsystems are verified.

## 13. Post-#77 Cleanup

After stability:

- update system/reference registry;
- mark quarantine replacements;
- create tasks for remaining duplicate consumers;
- document compatibility adapters;
- verify no hidden sync/account paths remain;
- reduce stale feature flags;
- prepare #78 against the new main.

## 14. Preparing Main for PR #78

PR #78 must not merge from its old branch state after #77 lands. Create a fresh anomaly branch from post-#77 main, port anomaly additions onto the new analytics-canon, review overlaps manually, correct traffic-day grouping, remove/defer aggregate subscriber status from dated magnitude scans, rerun gates, then merge #78 independently.

## 15. Final Acceptance Checklist

- [ ] current main recovery anchor exists
- [ ] #77 recovery anchor exists
- [ ] merge performed on integration branch
- [ ] one account/session owner
- [ ] canonical YouTube transports
- [ ] VT-SYNC raw owner
- [ ] analytics-canon public boundary
- [ ] no Performance Hub runtime authority
- [ ] additive CSV imports
- [ ] canonical table/sync registries
- [ ] Data Visuals use canonical data
- [ ] quarantine non-runtime
- [ ] focused tests pass
- [ ] typecheck/build pass
- [ ] full-suite delta clean
- [ ] real-data/mobile/production smoke passes
- [ ] post-merge main tagged
- [ ] #78 rebuilt against post-#77 main

## Final Recommendation

**Merge PR #77 only through a dedicated integration branch, resolve it subsystem-by-subsystem, preserve current main as the newer base where appropriate, and converge #77 features onto canonical owners rather than preserving parallel systems.**
