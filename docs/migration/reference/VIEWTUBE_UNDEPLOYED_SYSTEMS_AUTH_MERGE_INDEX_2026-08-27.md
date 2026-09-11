# ViewTube undeployed systems, auth, and merge index

> Historical snapshot: current comparison findings moved materially after 2026-08-27. Read the [2026-08-29 refresh](VIEWTUBEX_VS_BRANCH_CHECK_REFRESH_2026-08-29.md) before executing this plan.

**Audit date:** 2026-08-27

**Repository:** `themotionvisual/ViewTubeBUILD`

**Main anchor:** `f968bdb79e9d59a67ccc27e1c93add6c4396709b` — `Reconcile UI when account server falls back`

**Decision:** keep current main as the integration trunk; harvest donor work by module and behavior, never by replacing a worktree or merging an archival snapshot wholesale.

## 1. Executive result

ViewTube does not have two equivalent application versions waiting to be merged. It has one evolved main line, several historical snapshots, four open PRs, three active Brain stacks, and multiple dirty local experiments.

- **Branch-check:** `/Users/cwb/ViewTube-branch-check` is clean at `571fdd4c`, 15 commits behind the audited main, and fully contained in main. Its Settings Control Deck and earlier auth/sync fixes are already deployed through later main commits.
- **ViewTubeX:** `/Users/cwb/Downloads/viewtube/viewtubeX` is clean at archival commit `edf47536`, one unique commit and 178 commits behind main. Its unique value is the creator-engagement controller/store work and a preserved older runtime that demonstrates successful API-to-tool hydration. It is a donor and regression oracle, not a merge base.
- **Main:** contains the strongest current account contracts, Settings redesign, auth-canon/analytics-canon foundations, server transport adapters, and newer VT-SYNC modules. It still has split-brain consumers and a failing release gate.
- **Highest-priority undeployed fix:** PR #62 corrects server-session ownership, deduplicates auth intents, and separates VT-SYNC dataset units. It should be rebased onto current main and repaired before merge.
- **Largest undeployed products:** the editor PR and the three stacked Brain branches. They need independent product/security reviews and must not ride along with auth consolidation.
- **Deployment drift:** GitHub records three Vercel projects (`project-2tjr5`, `viewtube`, `viewtubebuild`). The audited main has a successful production record only for `project-2tjr5`; the custom-domain owner could not be proven without authenticated Vercel access.

### Rating scale

| Grade | Meaning |
|---|---|
| A | Adopt after normal review and green gates |
| B | Valuable; harvest/rebase with focused remediation |
| C | Partial, stale, duplicative, or documentation-only |
| D | Quarantine; evidence only |

## 2. Impact, risk, verification

1. **Impact — consolidation and UI alignment.** Make the server-owned account snapshot the identity/session authority, `auth-canon` the React connection interface, canonical transports the only Google request seam, and `analytics-canon` over VT-SYNC the data interface. Every Settings, navigation, dashboard, tool, sync, and table status must use the same projected state.
2. **Risk — behavior loss during consolidation.** Removing legacy token/cache paths too early can break the exact ViewTubeX behavior that currently hydrates Comment Responder, Video Publisher, Realtime, Channel Overview, and AI Brain. Preserve fallback as adapters behind the canonical seam; do not let fallback become a second authority.
3. **Verification — prove each interface.** Gate with pure reconciliation tests, account/server integration tests, Google read/write transport tests, dataset-isolation tests, seeded browser journeys at desktop and 390px, one authenticated real-data preview, and an explicit production-project/domain check.

## 3. Current deployment and CI truth

### Production anchor

GitHub deployment records attach main `f968bdb7` to a successful **Production – project-2tjr5** deployment:

- `https://project-2tjr5-5qh9bx9uz-arttreasurechestnyc-7455s-projects.vercel.app`
- deployment ID `6123927250`
- completed 2026-08-27 13:46 UTC

`viewtube.live` and `www.viewtube.live` both returned HTTP 200 and identical HTML during the audit, but the exact Vercel project owning those domains is **unverified**. Raw preview URLs are access-protected. Local `npx vercel whoami` reported no authenticated Vercel session.

### Vercel topology observed through GitHub

| Project integration | Production evidence | Preview behavior | Assessment |
|---|---|---|---|
| `project-2tjr5` | successful on audited main | succeeds on PRs #58, #61, #62 and ViewTubeX snapshot | likely current deployment path; name is noncanonical |
| `viewtube` | successful production records on earlier main commits | succeeds on ViewTubeX, PR #58 and PR #61 | likely custom-domain candidate; ownership unverified |
| `viewtubebuild` | no reliable current production evidence | repeated failed/rate-limited checks | stale or misconfigured integration; remove only after ownership proof |

### Main release gate

GitHub Actions run `33078489030` is red even though the production deployment succeeded.

| Gate | Result | Evidence |
|---|---|---|
| source-governance | pass | workflow result |
| focused-contracts | pass | workflow result |
| local-smoke | pass | workflow result |
| production-build | pass | workflow result |
| full-suite | **fail** | 6 failed, 818 passed across 135 files |
| static-quality | **fail** | approximately 1,920 lint findings in run log |

The six test failures are three account coordinator fallback cases, two Google read transport cases, and one dashboard V9 registry ordering assertion. Therefore “builds” and “is deployed” do not mean “release-correct.”

## 4. Local checkout index

| Local checkout | Branch / HEAD | Dirty | Relationship / disposition |
|---|---|---:|---|
| `/Users/cwb/ViewTube-branch-check` | `main` / `571fdd4c` | 0 | fully in main; historical baseline |
| `/Users/cwb/ViewTube-branch-check 2` | `integration/final-superset-2026-08-22` / `bca2131f` | 78 | **D** quarantine; broad deletions and mixed WIP |
| `/Users/cwb/ViewTube-branch-check copy` | progress visual branch / `a7d11938` | 4 | untracked archives; compare only |
| `/Users/cwb/ViewTube-branch-check copy 2` | progress visual branch / `14017871` | 0 | stale comparison copy |
| `/Users/cwb/ViewTube-auth-sync-performance` | `codex/auth-sync-performance-fixes` / `2741e98c` | 0 | already contained in main |
| `/Users/cwb/ViewTube-quick-wins` | `codex/quick-wins-integration` / `6c6d6903` | 0 | already contained in main |
| `/Users/cwb/ViewTube-account-dataset-repair` | PR #62 / `6b04b2c0` | 0 | **A-**, rebase and repair gates |
| `/Users/cwb/ViewTube-vt-e1-temporal-envelope` | PR #61 / `237504eb` | 0 | **B+**, focused visual fix |
| `/Users/cwb/Downloads/viewtube/viewtubeX` | archival snapshot / `edf47536` | 0 | **B donor**, 178 behind main |
| `.../viewtubeX-brain-discussion-integration` | `acd1906b` | 0 | already contained in main |
| `.../viewtubeX-brain-owner-consent` | `codex/brain-owner-consent` / `4a4bbaf8` | 26 | **B / critical risk**, unpublished privacy/server work |
| `/Users/cwb/Downloads/viewtube/VT-SYNC` | separate repo main / `0a206e2a` | 1 | separate upstream/tooling repository |
| `.../docs/Video-Edit-Suite` | separate repo / `c0b3a9aa` | 42 | prototype/reference; no origin |

The owner-consent worktree contains roughly 1,055 tracked-line additions plus untracked account-store tests, privacy modules, model availability, owner-access tooling, and a Settings privacy section. It modifies account schema and server storage, so it requires security/privacy review and a clean commit series before any code harvest.

## 5. Remote branch hierarchy

Ahead/behind is `origin/main...branch` as of the audit. “Contained” means the branch head is an ancestor of main; a retained branch name does not imply undeployed code.

### Active, unique branches

| Branch | Behind / ahead | Content | Grade | Plan |
|---|---:|---|---|---|
| `themotionvisual/fix/account-session-dataset-isolation` | 2 / 1 | account event ownership, auth-intent dedupe, dataset unit isolation | A- | PR #62 first after rebase and green gates |
| `codex/vt-e1-temporal-envelope` | 2 / 1 | 13-line transition/render-window correction | B+ | PR #61; focused render regression tests |
| `claude/video-editing-engine-tgk6xy` | 17 / 7 | 41 files, ~7,520 additions; editor engine, transitions, kinetic text, mobile gestures/shell | B | PR #58; independent subsystem review |
| `docs/claude-md-and-workflow` | 110 / 1 | CLAUDE workflow/deployment document | C | refresh or supersede with current docs |
| `codex/chore/viewtubex-version-2026-08-27` | 178 / 1 | creator-engagement snapshot plus binary/text archives | B donor | cherry-pick modules only after parity review; exclude archives |
| Brain phase 1 | 19 / 59 | control panel, handoffs, candidate ledger, Studio Hub work | C+ | establish clean base and split PRs |
| Brain phase 2 | 19 / 63 | phase 1 plus persistent handoff inbox/outcome learning | B- | stacked review after phase 1 normalization |
| Brain phase 3 | 19 / 69 | phase 2 plus policy controls, recommendation and workflow execution | B- | product/privacy review; last in stack |
| `launch/main-clean-2026-05-06` | 286 / 1 | old issue workflow | D | archive |
| two `v0/cbrewsterart-1584-*` refs | 323 / 16 | very old divergent app history | D | archive/evidence only |
| `vite-import-analysis` | 298 / 7 | old mobile mockups plus tracked `node_modules` | D | do not merge |

### Historical branches already contained in main

These refs have zero commits ahead and should not be treated as undeployed feature sources: `Analytics-Revive`, `April-25th-App`, `Format_FIXED`, `backup_main_prelocal_20260517-201413`, `brain-integration-apr22`, `chore/full-snapshot-2026-04-30`, all three older Claude mobile/performance branches, `claude/vt-sync-data-process-amovwq`, `codex/backup-ai-brain-2026-07-31`, `codex/brain-owner-consent` at its committed head, `codex/chore/branch-check-version-2026-08-27`, hero animation variants, both connection-recovery refs, `main_temp_for_merge`, `master`, `runtime-errors-in-code`, `the-edge`, `v0/cbrewsterart-1584-5fe866f1`, `v0/cbrewsterart-1584-78ed02d3`, `v0/perf/route-splitting-build-config`, and `youtuber-toolbox-ideas`.

## 6. Pull requests and undeployed feature systems

| PR / source | Preview | CI | Feature value | Merge recommendation |
|---|---|---|---|---|
| [#62](https://github.com/themotionvisual/ViewTubeBUILD/pull/62) account session/dataset isolation | `project-2tjr5` success | full-suite/static fail | fixes HttpOnly-session false logout; prevents duplicate intents; separates dataset selection | **first application PR**, after rebase and all account/transport tests pass |
| [#61](https://github.com/themotionvisual/ViewTubeBUILD/pull/61) VT_E1 envelope | two previews pass; `viewtubebuild` fails | full-suite/static fail | precise render-window/transition fix | merge independently after rebase and render validation |
| [#58](https://github.com/themotionvisual/ViewTubeBUILD/pull/58) editor engine | two previews pass; `viewtubebuild` fails | full-suite/static fail | substantial editing subsystem with responsive gestures | architecture/performance/accessibility review; isolate from auth work |
| [#14](https://github.com/themotionvisual/ViewTubeBUILD/pull/14) workflow docs | preview passes | full-suite passes, static fails | useful intent but stale topology | supersede/update, do not merge stale statements |
| Brain 1/2/3 refs | no current PR | not established on current main | cross-tool handoffs, learning, adaptive orchestration | rebuild as a stacked, reviewable series |
| owner-consent dirty worktree | none | unverified | privacy choices, consent, model access, server schema/storage | checkpoint privately; threat-model and test before publication |
| ViewTubeX snapshot | two previews pass; `viewtubebuild` fails | not a current-main gate | engagement parity plus older proven population behavior | use as donor/regression oracle only |

## 7. ViewTubeX versus branch-check/current main

### Features and construction

| Area | ViewTubeX snapshot | Branch-check snapshot | Current main | Decision |
|---|---|---|---|---|
| Settings | older broad Settings implementation | redesigned Settings Control Deck | Control Deck plus latest fallback reconciliation | keep current main |
| Account | server account + legacy fallback at older stage | later integrated account work | most complete contracts/coordinator/fallback | keep main; land PR #62 corrections |
| Auth canon | absent at ViewTubeX base | foundation present by later history | present, but only ~3 source consumers import it | finish migration |
| Analytics canon | absent/early at ViewTubeX base | foundation and migrations | present; only ~10 source consumers, ~60 legacy import sites remain | finish migration incrementally |
| Tool population | demonstrably strong fast cache/direct Google hydration | newer governance and VT-SYNC behavior | broader capability, but proxy/fallback tests are red | preserve behavior through adapters and regression tests |
| Creator engagement | unique controller/store/parity modules in snapshot | not in older branch-check snapshot | equivalent work was subsequently merged through later main history | no wholesale cherry-pick; compare tests only |
| Navigation | older adaptive shell | Settings-era shell | richer application menu and source fallbacks | keep main; remove independent auth inference |
| Archives | `Archive.zip`, `GraphsPageCharts.txt` in source | none | governed source | exclude from product merge |

The code delta from ViewTubeX snapshot to main is large: 81 auth/navigation/VT-SYNC files alone changed, with about 6,589 additions and 1,497 deletions. That makes a whole-branch merge unsafe.

### Why ViewTubeX appears to connect and populate better

Its runtime preserves a direct, tightly coupled boot path:

1. legacy OAuth token becomes `authState.isAuthenticated`;
2. `syncChannelBootstrap` fetches channel identity immediately;
3. `GlobalDataContext.globalSyncData` hydrates legacy analytics/cache state;
4. tools read the same broad context/cache fields and therefore populate together.

That produces good visible behavior but shallow seams: identity, transport viability, cached metadata, and synchronized data are frequently treated as the same fact. Current main has deeper modules—server account, auth-canon, Google read/write transports, analytics-canon, VT-SYNC—but consumer migration is incomplete. The right combination is **main’s modules plus ViewTubeX’s boot/population behavior pinned as end-to-end contracts**.

## 8. Authentication versions and verdict

| Version / signal | Interface | Good | Bad | Verdict |
|---|---|---|---|---|
| Legacy local OAuth (`authSession`, `vt_auth_state`) | token/session methods and browser events | makes direct Google calls work; resilient when account server unavailable | browser storage becomes identity authority; expiration and event loops drift | retain only as fallback adapter |
| `GlobalDataContext.authState` | broad Brain context fields | distributes identity and fast analytics to many older tools | mixes identity, metadata, cache, and synchronization; many writers | migrate consumers; eventually remove auth boolean |
| `connectionState.ts` | projected channel/sync snapshot | already models disconnected, cached, authorizing, verified, syncing, error | still accepts legacy `authState`; unverified session may be reported inconsistently | deepen around canonical account status + sync runtime |
| Unified account (`UnifiedAccountSnapshot`) | server-owned profile/auth/Google/billing/AI/capabilities | correct authority for HttpOnly session, billing, plan, credits, scopes | fallback mode can disagree with local token; current tests fail | canonical session authority; repair via PR #62 |
| `auth-canon` | `useAccountStatus()` reconciler | pure rule set; explicit ready/connecting/reconnect/anonymous states; server mode does not use browser-token presence as status authority | migration barely started; `tokenPresent` remains exposed with ambiguous legacy-oriented naming | canonical React interface; clarify credentials and finish consumer migration |
| Google read/write transports | authorized request adapters | concentrates proxy, scope, reconnect, and fallback behavior | two read tests fail; unsafe fallback can bypass genuine scope failure | sole request seam after tests are green |
| Account simulation | test/demo state | useful for deterministic UI scenarios | writes legacy storage and can resemble production truth | strictly development-only |

### Specific current contradictions

Current source counts confirm migration is incomplete: 18 files mention `authState.isAuthenticated`, 19 directly inspect unified snapshot auth/Google fields, only 2 consumer modules outside the namespace reference auth-canon, and 49 files contain connection/account labels.

| Surface | Current decision | Contradiction risk |
|---|---|---|
| Settings | server authentication **OR** legacy auth; Google connected **OR** `channelConnection` | can show connected while server account says sign in |
| adaptive navigation | account snapshot **OR** authState **OR** channel session; identity falls through VT-SYNC and Brain | chip/title/status can describe different underlying states |
| Dashboard header | own account/auth OR-chain | can diverge from Settings and widget grid |
| verification widget | unified Google fields only | can disappear while legacy-only tools still fail, or appear beside populated cached widgets |
| system micro-stack widget | `data.authState.isAuthenticated` only | “Not connected” beside a connected account snapshot |
| VT-SYNC page | strict server auth+scope when server enabled; legacy token otherwise | correct direction, but differs from OR-chain surfaces |
| Video catalog | server-connected or legacy-connected based on server availability | useful fallback, but another independent projection |
| AI Brain / engagement | account snapshot, catalog, authState, and Brain profile fallbacks | populated identity can be mistaken for live authorization |

## 9. Required one-source-of-truth hierarchy

```text
Server account/session
  UnifiedAccountSnapshot
    ├─ auth-canon: account + Google capability state
    ├─ canonical channel connection view model: labels + sync phase
    ├─ googleReadTransport / youtubeWriteTransport: request authority
    └─ accountContracts: intent and surface copy

VT-SYNC snapshot
  analytics-canon
    ├─ Dashboard / Realtime / Channel Overview
    ├─ Comment Responder / Video Publisher context
    ├─ AI Brain evidence
    └─ tables / sync controls / visual modules

Legacy token + caches
  fallback adapters only
  never decide account identity, billing, plan, credits, or canonical labels
```

The proposed deep module is a single `CanonicalChannelSession` interface derived from `UnifiedAccountSnapshot`, auth-canon status, canonical run state, and VT-SYNC identity. It should expose separate axes so a failed sync never erases a valid connection:

- `accountStatus`: anonymous, connecting, authenticated, expired;
- `channelStatus`: disconnected, reconnect, connected-unverified, ready;
- `syncStatus`: idle, queued, syncing, complete, failed;
- `dataFreshness`: empty, cached, fresh, stale, partial;
- `accountIntent` and one label set per surface;
- existing auth-canon capability names: `canReadYouTube`, `canPostComments`, `canUploadVideos`, `canManageVideos`; add a deliberate `canReadAnalytics` projection only if it maps the existing `youtube_analytics_read` capability without creating a second authority;
- stable channel identity and provenance;
- one action set: connect, reconnect, sync, sign out.

Consumers must not OR-chain underlying signals. The module earns depth because one interface replaces dozens of local decisions while keeping server and legacy adapters internal.

## 10. Ordered merge plan

### Phase 0 — freeze the evidence and stabilize trunk

1. Keep this documentation branch separate.
2. Repair the six current main test failures or update invalid expectations only with behavioral proof.
3. Reduce static-quality failures enough that new PR regressions are distinguishable from baseline.
4. Authenticate Vercel, identify which project owns `viewtube.live`, designate one production project, and disconnect duplicates only after rollback metadata is saved.

**Exit:** main release gates green; canonical production project/domain recorded.

### Phase 1 — account event ownership (PR #62)

1. Rebase PR #62 onto the then-current main.
2. Keep the server snapshot authoritative in server mode; legacy token events must not clear an HttpOnly session.
3. Keep the single-flight account intent guard.
4. Keep dataset-unit resolution separate from broad category expansion.
5. Run account coordinator, event ownership, Google transport, dataset registry, local sync, full suite, and browser login/reconnect tests.

**Rollback:** revert the one PR; no schema migration is involved.

**Exit:** one login action, one session owner, no false logout, no unintended dataset expansion.

### Phase 2 — unify all visible connection UI

1. Deepen `auth-canon`/`connectionState` into the canonical channel-session interface.
2. Migrate Settings, adaptive navigation, DashboardHeader, verification widget, system micro-stack, VT-SYNC hero/controller, Video Publisher, Comment Responder, Realtime, Channel Overview, and AI Brain.
3. Centralize copy in the canonical projection: never hard-code “connected,” “sign in,” or “connect channel” based on local fields.
4. Add a governance test forbidding direct React checks of `authState.isAuthenticated`, snapshot auth/Google fields, and token methods outside approved adapters.

**Rollback:** one surface per PR; auth-canon remains additive until all are verified.

**Exit:** every visible surface produces the same state for the same fixture.

### Phase 3 — preserve ViewTubeX population behavior

1. Create authenticated browser fixtures for fresh login, cached return, server unavailable with valid fallback, expired scope, and offline cached analytics.
2. Assert identity appears in all named tools and that each capability gate matches the account snapshot.
3. Keep `syncChannelBootstrap` as the fast identity path.
4. Route reads/writes through canonical transports; scope failures must never fall through to a legacy token.
5. Hydrate tool data from analytics-canon/VT-SYNC; caches restore display state but do not grant capabilities.

**Exit:** Comment Responder, Video Publisher, Realtime, Channel Overview, and AI Brain populate at least as reliably as ViewTubeX without competing auth truth.

### Phase 4 — finish analytics migration

1. Migrate remaining legacy `DataStore`/`Selectors`, `SyncCoordinator`, and `coreLifetimeSync` consumers in small PRs.
2. Preserve CSV import/type detection, source provenance, metric availability, table controls, and diagnostic coverage.
3. Retire legacy runtime only after import-count and browser gates reach zero.

**Exit:** consumers import analytics through `analytics-canon`; VT-SYNC is the sole analytics store authority.

### Phase 5 — independent feature tracks

- Rebase and validate PR #61 separately.
- Split PR #58 by engine, editor shell, responsive interaction, and route integration if review remains too broad.
- Normalize Brain phases onto current main, then review phase 1 → 2 → 3 as an explicit stack.
- Move owner-consent work to a clean private branch; review account schema, retention, consent revocation, owner bypass, secrets, and data export/delete semantics before opening a PR.

## 11. Do-not-merge list

- Do not merge the ViewTubeX snapshot wholesale.
- Do not merge `/Users/cwb/ViewTube-branch-check 2` or any dirty worktree.
- Do not cherry-pick `Archive.zip`, `GraphsPageCharts.txt`, tracked `node_modules`, or unrelated prototype archives into application source.
- Do not infer production from branch names, preview success, or a passing Vite build.
- Do not delete legacy auth/cache paths until the authenticated real-data tool-population suite exists.
- Do not combine auth consolidation, editor integration, and Brain orchestration in one PR.

## 12. Verification matrix

| Layer | Required proof |
|---|---|
| contracts | reconciliation, labels, capability, scope, return-to tests |
| server | account snapshot, HttpOnly session, revoke/sign-out, content-owner tests |
| transport | proxy success, origin rejection fallback, genuine scope failure, writes |
| data | selected-unit isolation, snapshot provenance, CSV/manual import, freshness |
| UI | identical state across Settings/nav/dashboard/tools; keyboard + 390px |
| behavior | fresh login, cached return, reconnect, offline cache, logout |
| tool population | Comment Responder, Publisher, Realtime, Overview, Brain |
| CI | focused gates, full suite, static quality, production build |
| deployment | preview smoke, authenticated real data, production project/domain proof |

## 13. Evidence limits and refresh commands

- Git and GitHub state is time-sensitive; refetch before executing this plan.
- Vercel domain ownership is inferred because the CLI is logged out.
- Dirty local work is described but not certified, built, or published.
- A preview may be access-protected even when its deployment status is successful.

Refresh with read-only commands:

```bash
git fetch --all --prune
git rev-parse origin/main
git branch -r --no-merged origin/main
gh pr list --repo themotionvisual/ViewTubeBUILD --state open
gh run list --repo themotionvisual/ViewTubeBUILD --branch main
npx vercel@latest whoami
```

This document is a merge plan, not authorization to merge or delete any branch, deployment, domain, or local file.
