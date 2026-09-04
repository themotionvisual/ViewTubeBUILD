# Branch-check application relocated into ViewTubeX

Recorded: 2026-08-30. This is a point-in-time migration and recovery reference, not a second task/status authority or a production release claim.

## Outcome and ownership

- Active application/build/agent home: `/Users/cwb/Downloads/viewtube/viewtubeX`.
- Active local branch: `codex/branch-check-in-viewtubex-20260830`.
- Integration commit: `2d55a17d`; final local HEAD `440a2a07` adds the matching monthly-source regression assertion.
- Original source remains at `/Users/cwb/ViewTube-branch-check`, on its original branch and HEAD `788814a2`. Its working files were not edited by this migration.
- Local frontend: `http://localhost:5173`; local account/API service: `http://localhost:3000`.
- Shared documentation remains `/Users/cwb/Downloads/viewtube/docs`.
- Only task/status authority remains `/Users/cwb/Downloads/viewtube/ViewTube-Task-Index.html`.
- This reference is maintained on `codex/docs/viewtube-system-reference-2026-08-27`, separate from application changes.
- No GitHub application branch, main, Vercel deployment, or production configuration was changed.

## Impact, risk, verification

1. **Impact:** adopt the current local branch-check application at the user's established ViewTubeX path, retain its working server-owned auth, and integrate distinct ViewTubeX feature edits.
2. **Risk:** both checkouts were dirty; another process continued editing branch-check during capture; ignored ViewTubeX references and agent configuration must not be overwritten or treated as application source.
3. **Verification:** preserve both complete folders, compare captured files, retain Git lineage and worktrees, compare typecheck failures to the source baseline, build/test the destination, and verify local listener paths and OAuth startup.

## Recovery inventory

Protected local backup directory (mode 700):

`/Users/cwb/Downloads/viewtube-preservation-20260830-rce7Xq`

| Recovery item | Location / ref | Meaning |
|---|---|---|
| Complete original ViewTubeX folder | `viewtubex-before/` | APFS-cloned files, ignored resources, original dependencies, local data, agents, and Git metadata |
| Complete captured branch-check folder | `branch-check-source/` | Preserved source files and ignored resources; snapshot commits were created only inside this backup |
| ViewTubeX preservation branch | `codex/preserve/viewtubex-local-20260830` at `2d0b1b9a` | Tracked and nonignored untracked ViewTubeX work, including its deliberate script deletions |
| Branch-check preservation branch | `codex/preserve/branch-check-local-20260830` at `0b3e60a8` | Captured branch-check source, including uncommitted/new feature files |
| Original ViewTubeX branch | `codex/chore/viewtubex-version-2026-08-27` at `edf47536` | Original branch tip unchanged |
| Additional WIP recovery | Git stash titled `preserve ViewTubeX before branch-check relocation 2026-08-30` | Original target uncommitted edits retained; do not blindly pop onto the new app |
| Original uncommitted diff | `viewtubex-uncommitted.patch` | Includes the three original script deletions |
| Adapted feature patch | `viewtubex-preserved-feature-delta.patch` | Forecasting and parent-resource references retained |
| Navigation patch | `viewtubex-navigation-morph.patch` | ViewTubeX's two-stage contraction animation retained |
| Final integration diff | `relocation-integration.patch` | Tracked changes over captured branch-check, before commit; added test is in commit `2d55a17d` |
| Source blob inventory | `source-tree.txt` | Git paths, modes, and object hashes of the captured source |
| Parent documentation changes | `PARENT_DOCUMENTATION_UPDATES_2026-08-30.patch` beside this document | Zero-context Git diff of the four parent documentation edits; reverse-check verified with `git apply --unidiff-zero --reverse --check`; already applied locally, not an instruction to reapply |
| Cutover account/billing stores | `branch-check-account-at-cutover/`, `branch-check-billing-at-cutover/` | Latest local data copied after stopping source servers |

The backup contains private credentials and account data. Keep it local; do not upload it or include it in a PR. Runtime filesystem-monitor sockets were not copied because they are transient sockets, not durable files. Backup `.git` metadata was used to create preservation commits; original active repositories' branch tips were not rewritten. Linked worktree pointers in backup copies still refer to original locations: do not launch those backup worktrees or replace live `.git` metadata wholesale.

## Features and integration decisions

| System | Active decision | Preservation / limitation |
|---|---|---|
| OAuth, session restoration, account store, YouTube transports | Branch-check source unchanged | Identical environment values retained; source account/session data copied; no fallback to stale client-only auth |
| Comment Responder and community post tooling | Branch-check shared controllers retained | ViewTubeX community persistence, generator, Studio wiring, and dashboard sister widgets were already present; branch-check adds server-backed reads/writes, owned reply editing, abort handling, and suggested-video validation |
| Settings and feature access | Captured branch-check implementation | Creator control deck, plan/capability notices, AI runtime, data/privacy/help sections preserved |
| Analytics, packed storage, Intelligence Hub, Brain, publishing, dashboard widgets | Captured branch-check implementation | All captured source files retained, including uncommitted/new files; unfinished source defects remain explicitly unverified |
| Trajectory forecasting | ViewTubeX enhancement applied to branch-check | Daily/weekly/monthly choices, 7–28 day horizon, real future date labels, canonical colors, responsive canvas, monthly source support, tests |
| Shared data bridge | Three-way-compatible adaptation | ViewTubeX daily/monthly rollups retained without overwriting branch-check's corrected duration lookup |
| Navigation | Branch-check navigation with ViewTubeX morph animation | Current account menu and destination registry retained; ViewTubeX's contraction animation preserved; old competing CSS shell not restored |
| Brain/document links | ViewTubeX parent-resource references retained | Shared docs remain outside launchable app |
| Standalone references and generated inventories | Existing ViewTubeX local assets retained | Standalone files explicitly excluded from application typecheck; local inventory files restored but ignored by Git |
| Agents and other worktrees | Existing ViewTubeX configuration retained | 739 checked agent/worktree files unchanged; source-only `dead-code` skill copied; no linked worktree moved |
| Original script deletions | Preserved in original backup, stash, and preservation ref | Not blindly applied over branch-check's script inventory; no source feature/tool removed for cleanup |
| Old unused Vault/toast components and ZIP archive | Original recovery copy retained | Branch-check's active replacement architecture wins; recovery archives are not reintroduced as runtime authority |

The source was changing during capture. The stable migration boundary is `0b3e60a8`, built from source HEAD `788814a2` plus working files. The second capture included concurrent dependency cleanup. Subsequent source cleanup is not automatically synchronized. Future work should use ViewTubeX; compare any later branch-check edits explicitly before importing them.

The old ViewTubeX account store has a different local user ID and 13 different session records. It remains intact in the original backup; it was not merged into branch-check's identity/session database. The active app uses the branch-check store, so an old ViewTubeX-only browser session may require sign-in. No browser storage was cleared or copied.

## Verification results

| Gate | Result |
|---|---|
| Captured-source file parity | 1,128 files present, zero missing; 1,117 byte-identical, 11 intentional adaptations including the updated visual-registry assertion |
| Added ViewTubeX forecast test | Preserved as an additional file, committed with integration |
| Agent/worktree file comparison | 739 checked files unchanged; dependency trees and transient Git internals excluded from this comparison |
| Production bundle build | PASS, Vite build completed |
| Account/auth and launcher tests | PASS, 16 tests |
| Targeted forecasting/creator engagement/auth/Settings/feature-access tests | PASS, 32 tests across 8 files |
| Repository focused suite | PASS, 57 tests across 12 files |
| Release metadata tests | PASS, 2 tests |
| Visual registry tests after monthly-source assertion update | PASS, 18 tests |
| Full Vitest suite | 881 passed, 5 failed across 151 files; all 5 failures reproduced in a targeted run against the preserved source |
| Application typecheck | NOT GREEN: 21 errors, exactly the same diagnostics as the preserved branch-check source; zero target-only diagnostics |
| Git whitespace check | PASS |
| API and frontend process working directories | Both verified as `/Users/cwb/Downloads/viewtube/viewtubeX` |
| OAuth start via port 3000 and port 5173 | HTTP 302 to `accounts.google.com` |
| Session and account snapshot routes | HTTP 200 through both ports; unauthenticated probes do not prove a logged-in account |
| Account data continuity | User, Google identity, all 25 stored session records, subscription, and onboarding data matched source cutover data |
| Browser smoke | Dashboard, Settings, and Brain load after restart; navigation works; no captured console errors during Settings check |

Typecheck errors are in `youtubeDataFetcher.ts`, `AudienceStudioWidget.tsx`, `MetadataStudioWidget.tsx`, `SyncControllerWidget.tsx`, and `UIReferenceLibraryWidget.tsx`. Existing widget interface/type errors are not silently fixed in this relocation. Build success does not certify those flows. Logs are in the protected backup directory: `build.log`, `focused-tests.log`, `source-typecheck.log`, and `target-typecheck.log`.

The five baseline test failures concern UnifiedAccountContext ownership, API capability evaluation, the `widget:ai-journal` registry entry, signed-out custom Gemini-key access, and Video Manager governance. They are not new relocation failures, but must be reviewed before release. Full-suite logs: `full-tests-final.log`; baseline reproduction: `source-comparison-tests.log`. A narrow review of the migration delta found no new auth mutation or data-store schema change; this is not a clean-release approval of the inherited application.

Not verified: a fresh Google consent/callback, authenticated session persistence across a browser restart, live reply/publish/sync execution, every editor path, or production login. The browser used for smoke testing was signed out before and after cutover. Existing channel/cache UI inconsistencies remain outside this location-only migration.

## Documentation self-audit

- Navigation: linked this record from the documentation-only reference README and parent VT Brain README.
- Registry: added REC-061 to the parent recommendations/artifact registry.
- Ownership: clarified the user-selected ViewTubeX path as the active local app; branch-check is preserved source, not the active listener location.
- OS: added the runtime-location reference without replacing the shared docs or Task Index owners.
- Ledger / Task Index: old Markdown ledger stays retired. No unrelated feature task marked complete, and no duplicate backlog created. This file is migration evidence; existing launch/typecheck/auth work remains open.
- Skill drift: both installed documentation skills still mention the retired Markdown ledger and app-relative docs; their parent-workspace mirrors already use the Task Index and shared parent root. Reported, not silently overwritten.
- Pre-existing link drift: registry REC-028 and several legacy rows contain malformed `docs/VT Brain//Users/...` Task Index paths. Recorded for focused cleanup; broad registry history was not rewritten.
- Recommended cleanup order: reconcile installed documentation skills with their current mirrors, then repair malformed legacy registry links; keep task status in the Task Index.

## Operating and recovery notes

Run the app from `/Users/cwb/Downloads/viewtube/viewtubeX` with `npm run dev` (or `npm run x`). Both launch the tracked full-stack supervisor. Do not start a second branch-check server on ports 3000/5173 at the same time.

To recover old work, first stop the ViewTubeX local supervisor and preserve any new changes and account data. Inspect or diff the preservation refs and backup folders. Restore selected files or switch to a recovery branch only after confirming the current working tree is safe. Never use a hard reset, delete either checkout, replace live `.git`, or blindly apply the old stash. Do not restore an old account store over newer session/token changes without a new backup and explicit review.

The application integration is local-only and is not proposed for production while the inherited typecheck and authenticated-flow gates remain open. Documentation publication is separate. Keep future agent work rooted in ViewTubeX to prevent the two local trees drifting again.
