# ViewTubeX versus branch-check — refreshed comparison

**Compared:** 2026-08-29

**Current remote main:** `75fcc69a655c9edbd373f58f10c6936d36e03972`

**Bottom line:** use current `main` as the architectural and deployment base; treat branch-check as the current feature-development donor; treat ViewTubeX as a historical behavior oracle plus a small visualization donor. Neither local worktree is safe to merge or push as-is because both are dirty, and branch-check has also diverged from its remote branch.

## What changed since the 2026-08-27 comparison

Main advanced from `f968bdb7` to `75fcc69a` and merged or directly landed:

- Simple server-owned Google Auth V1 and flat Vercel auth endpoints;
- YouTube auth/API stabilization and typecheck restoration;
- the Remotion-style editor from PR #58;
- VT_E1 renderer stabilization and temporal-envelope fix;
- User Guide V2 foundations and PR #74 updates;
- auth event-ownership fixes and the known-good ViewTubeX Google read fallback.

This means several items classified as undeployed on 2026-08-27 are now in main. The earlier artifact remains useful as a point-in-time audit, not as a current execution checklist.

## 1. Current state at a glance

| Dimension | branch-check | ViewTubeX |
|---|---|---|
| Local path | `/Users/cwb/ViewTube-branch-check` | `/Users/cwb/Downloads/viewtube/viewtubeX` |
| Branch | `codex/chore/branch-check-version-2026-08-27` | `codex/chore/viewtubex-version-2026-08-27` |
| HEAD | `788814a2` | `edf47536` |
| Against current main | 13 behind / 19 ahead | 219 behind / 1 ahead |
| Dirty paths | 81 | 12 |
| Tracked working delta | 62 files, +2,203 / -769 | 11 files, +255 / -1,761 |
| Untracked files | 19 | 1 |
| Remote relationship | local is 6 commits ahead and 1 commit behind its same-named remote | local HEAD matches its archival remote; worktree is dirty |
| Best role | active feature donor and integration laboratory | historical runtime oracle and visualization donor |
| Safe whole-branch merge | **No** | **No** |

The direct committed-tree difference between branch-check HEAD and ViewTubeX HEAD spans 436 files, roughly 54,766 additions and 9,582 deletions. This is not a normal two-branch merge candidate.

## 2. Feature and function comparison

### branch-check — committed work not on main

The 19 local-only commits concentrate in two product areas:

1. **VT-SYNC unified console**
   - consolidated sync control and progress console;
   - isolated switch/header states;
   - separate unit status metrics;
   - scoped direct-sync status;
   - compact expanded dataset rows;
   - shared spectrum badge styling.

2. **User Guide and visual-language documentation**
   - exact chart encodings and dataset provenance;
   - visual language primer and chart-reading task;
   - compact product map, colored toolbox navigation, and encyclopedia navigation;
   - canonical 12-color toolbox pair usage.

The committed tree also retains seven nested `api/auth/**` routes that current main deleted during the flat-route migration. These are inherited divergence, not part of the VT-SYNC/Guide feature set; a rebase should preserve main's deletions unless a separate compatibility PR proves they are still required.

Committed delta from the main merge base is 23 files, about 1,597 additions and 972 deletions. The largest risk is the 427-line simplification of `VtSyncLocalAnalyticsPage.tsx` combined with a 412-line controller rewrite and a 595-line retro-chrome stylesheet change. Review this as a cohesive VT-SYNC console feature, not isolated CSS cherry-picks.

### branch-check — uncommitted work

The 81-path worktree adds a much broader, not-yet-reviewable layer:

- advisory feature gating, feature access provider, AI credit/reference UI;
- packed VT-SYNC dataset encoding/decoding and IndexedDB changes;
- unified YouTube comment transport and Comment Responder controller changes;
- account/store/billing and Google transport changes;
- dashboard control, Central Intelligence, Creator Command Center, and Script Studio widgets;
- Video Manager restructuring, widget registry/certification changes, and toolbox CSS;
- guide registries, Settings help/access UI, Gemini/key-vault changes.

Promising modules include `featureGating.ts`, `packedDataset.ts`, and `unifiedYouTubeCommentTransport.ts`, but the worktree mixes storage, auth, billing, navigation, dashboard, guides, and styling. It should be checkpointed into separate topic branches before review. The nested auth routes are not part of this dirty delta; they are retained in the committed branch tree and require separate rebase handling described below.

### ViewTubeX — committed unique work

ViewTubeX still has one unique archival commit. It preserves:

- creator-engagement controller/store/parity work for comments and community posts;
- older adaptive navigation styling/morph behavior;
- `Archive.zip` and `GraphsPageCharts.txt` reference payloads.

The creator-engagement framework has since landed on main through later work. The archives should remain reference-only. The greatest remaining value of this commit is reproducing the older API-to-tool hydration behavior for regression testing.

### ViewTubeX — uncommitted work

The current 12-path worktree is mostly a visualization experiment:

- Trajectory Forecaster adds daily/weekly/monthly modes, canonical metric colors, future labels, source descriptions, responsive canvas sizing, and a new focused test;
- data bridge adds daily and monthly rollup behavior and daily-stats tests;
- Data Visuals toolbox wiring changes;
- small AI Brain/self-improvement and runtime-plan registry adjustments;
- three deleted generation/fixture scripts account for most of the 1,761 removed lines.

The forecaster/data-bridge work is a useful donor after tests and provenance review. The script deletions are unrelated and must not travel with it.

## 3. Code construction differences

| Concern | branch-check | ViewTubeX | Current recommendation |
|---|---|---|---|
| Base architecture | near-current main plus active VT-SYNC/Guide work | old `d453d2ca` lineage plus snapshot | main |
| Auth runtime | current Simple Auth + compatibility modules, plus dirty account changes | older unified-account/legacy OAuth generation; no Simple Auth module | main Simple Auth authority |
| UI state | newer Settings/navigation/dashboard modules, but dirty feature access changes | older navigation and broad context fallbacks | main plus one canonical projection |
| Analytics | newer VT-SYNC console and packed-dataset experiments | older VT-SYNC plus new forecaster rollups | harvest console and forecaster separately |
| Dashboard | new uncommitted command/intelligence/control/script widgets | older dashboard/runtime | branch-check donors after decomposition |
| Tool population | current transports plus known-good fallback now on main | older coupled boot/cache flow populates tools reliably | encode ViewTubeX behavior as tests; do not restore its authority model |
| Documentation | active Guide V2/visual provenance work | older reference payloads | branch-check guide work after rebase |

## 4. Authentication comparison after Simple Auth landed

### Current main and branch-check base

Main now has a new authoritative chain:

```text
SimpleAuthProvider
  → GET /api/auth-session
  → HttpOnly vt_session cookie
  → server/simple-auth.mjs
  → server/simple-google-client.mjs / simple-youtube.mjs
```

`UnifiedAccountContext` is explicitly a compatibility projection of `SimpleAuthProvider`. That is better than the 2026-08-27 design because the browser no longer needs a Google access token to establish server-mode session truth.

Legacy modules still coexist:

- `accountCoordinator` and `UnifiedAccountSnapshot` contracts;
- `auth-canon` reconciliation;
- `GlobalDataContext.authState`;
- browser-token `authSession` fallback;
- `googleReadTransport` and YouTube request modules.

The new authority is directionally correct, but the compatibility surface is incomplete. The current main test suite catches exactly this transition risk: compatibility projection, capability registry, account surface governance, and three Google transport cases are failing.

### ViewTubeX

ViewTubeX predates Simple Auth. It has no `src/auth/AuthProvider.tsx`, `src/auth/session.ts`, `server/simple-auth.mjs`, flat auth endpoint files, or auth-canon reconciler. Its working behavior relies on the older unified-account/legacy OAuth and direct/cache hydration chain.

That makes ViewTubeX useful for behavioral parity, not code authority. Restoring it wholesale would remove more than 5,500 lines of current auth/server/transport/test code across the compared auth surface.

### branch-check working-tree auth risk

Branch-check is based on Simple Auth but its committed tree still retains seven nested `api/auth/**` files that main deliberately removed after the shared merge base. Its dirty worktree separately modifies account auth/store/billing and Google transport modules. During rebase, preserve main’s nested-route deletions unless compatibility evidence justifies a dedicated restoration PR; do not let the old route files return accidentally with the VT-SYNC or Guide work.

### Correct source-of-truth model

Keep independent axes:

- `accountStatus`: anonymous, connecting, authenticated, expired;
- `channelStatus`: disconnected, reconnect, connected-unverified, ready;
- `syncStatus`: idle, queued, syncing, complete, failed;
- `dataFreshness`: empty, cached, fresh, stale, partial.

Use Simple Auth/server session as identity authority. Keep `UnifiedAccountSnapshot` as a temporary compatibility shape, canonical transports as the Google request seam, and VT-SYNC/analytics-canon as data authority. A failed sync must not turn a valid channel into “disconnected,” and cached data must not grant an API capability.

## 5. Current main, CI, and deployment status

Main `75fcc69a` has a successful production build job but a failed release workflow:

- focused contracts, source governance, local smoke, and production build: pass;
- full suite: **7 failed / 843 passed** across 141 test files;
- static quality: **2,047 findings** (`1,943` errors, `104` warnings).

The seven failures cover:

- Simple Auth compatibility projection;
- account capability registry;
- account-surface governance;
- three Google read transport fallback/scope cases;
- dashboard V9 registry ordering.

All three Vercel production attempts attached to this main commit—`project-2tjr5`, `viewtube`, and `viewtubebuild`—are recorded as failed. The public `viewtube.live` and `www.viewtube.live` domains still return HTTP 200 with identical 3,404-byte HTML, but the exact served commit is not proven by those responses.

Therefore neither branch-check nor ViewTubeX should be promoted until main’s auth/transport contract and production-project topology are stable.

## 6. Updated ratings

| Candidate | Feature value | Integration safety | Rating | Action |
|---|---:|---:|---|---|
| current main architecture | high | medium-low while gates/deployments fail | B | stabilize; keep as base |
| branch-check committed VT-SYNC console | high | medium | B+ | rebase and PR as one console slice |
| branch-check committed Guide additions | medium-high | medium | B | diff against merged PR #74; PR only remaining behavior |
| branch-check dirty feature gating | high | low until isolated | B- | new topic branch with contract tests |
| branch-check dirty packed dataset | high | low-medium | B | storage/performance PR with migration tests |
| branch-check dirty dashboard widgets | medium-high | low | C+ | one widget family per PR |
| branch-check dirty auth route restoration | unclear | very low | D pending proof | quarantine from feature commits |
| ViewTubeX committed snapshot | historical | very low | C | regression oracle only |
| ViewTubeX forecaster/data bridge | medium-high | medium after tests | B | checkpoint without script deletions |
| ViewTubeX script deletions | low/unclear | low | D | exclude |

## 7. Safe merge sequence

1. **Checkpoint, do not merge.** Preserve both dirty worktrees on new local topic branches/commits without mixing unrelated files. Do not push secrets, archives, or generated data.
2. **Stabilize main first.** Resolve the seven auth/capability/transport/dashboard tests and identify why all three Vercel production deployments failed.
3. **Rebase branch-check’s committed VT-SYNC console.** Resolve the branch’s one-remote/ six-local divergence explicitly; do not force-push over either side.
4. **Separate Guide deltas.** Main already merged PR #74. Retain only visual-language/provenance behavior not already present.
5. **Extract dirty branch-check modules.** Suggested order: packed dataset → feature gating → unified comment transport → dashboard widgets. Account/billing/auth changes get their own security-reviewed track.
6. **Extract ViewTubeX forecaster.** Include forecaster, data bridge, toolbox wiring, and tests only. Leave deleted scripts and unrelated Brain registry edits behind.
7. **Run cross-version behavioral parity.** Fresh login, return session, reconnect, proxy failure, scope failure, cached analytics, and tool-population journeys must agree across Settings, navigation, dashboard, VT-SYNC, Comment Responder, Video Publisher, Realtime, Channel Overview, and AI Brain.

## 8. Final contrast

Branch-check is now **newer but riskier**: it has the strongest current feature work, yet it is dirty, locally/remote diverged, and spans too many systems. ViewTubeX is **older but diagnostically valuable**: its architecture is obsolete, yet it remains the clearest baseline for “login once and the tools visibly populate.”

The winning system is not either worktree alone:

```text
current main Simple Auth and server transports
+ branch-check VT-SYNC console / carefully separated feature modules
+ ViewTubeX population parity and forecaster behavior
- duplicate auth routes, competing UI truth, archives, and unrelated deletions
```

No merge, rebase, deletion, deployment, or application-source edit was performed for this comparison.
