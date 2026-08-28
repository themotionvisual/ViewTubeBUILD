# ViewTube Auth / Authorization Pull Request Consolidation Audit

**Base:** main @ 8fa2c52
**Rule:** no historical auth PR is to be re-merged wholesale. The simple server-owned session introduced by PR #64 and made authoritative by PR #68 is the destination architecture.

## Canonical destination

Keep and finish:
- PR #64: simple server-owned Google OAuth island.
- PR #68: simple session becomes sole auth truth; typed YouTube API gateway.
- PR #63: YouTube API expert skill/reference knowledge.

Target runtime:
- one Google Authorization Code flow
- one HttpOnly ViewTube session
- one server credential store
- one server token refresh client
- one /api/auth/session frontend truth
- typed /api/youtube/* routes
- no browser Google tokens
- no legacy fallback transport
- no auth event-bus reconciliation
- no auth state derived from analytics/cache

## Pull request decisions

| PR | Auth relevance | Decision | Treatment |
|---|---|---|---|
| #8 OAuth scope remediation/privacy | Historical OAuth/scopes + privacy copy | KEEP ONLY policy/scope disclosure ideas | Do not re-merge. Verify current privacy copy reflects final scopes. Ignore old auth implementation. |
| #10 Integration OAuth verification | Old browser auth adjustments inside broad integration PR | DO NOT RE-MERGE | Any still-useful Comment Responder feature should be migrated separately to typed APIs. Old auth code is obsolete. |
| #13 auth abort classifier | Browser login abort/error classification | RETIRE WITH LEGACY AUTH | Keep only generic user-facing error taxonomy if useful. Delete browser-auth-specific classifier after cutover. |
| #15 defer login bootstrap | Mobile post-login performance | KEEP CONCEPT, REMOVE AUTH COUPLING | Preserve deferred heavy sync/first-paint behavior, but trigger from stable session readiness, not legacy auth events. |
| #22 authSession token fix | Browser-token invalidation | RETIRE | Becomes unnecessary once browser Google tokens are deleted. |
| #25 mobile post-login core sync | Login/bootstrap performance | KEEP CONCEPT | Re-express as post-session-ready data bootstrap. Do not let it own login state. |
| #33 login render storm | GlobalDataContext state-loop fix | KEEP PERFORMANCE REGRESSION TEST | The exact legacy auth loop should disappear; retain render-storm protection and tests. |
| #35 clear token on invalidation | Browser token + verification widget | RETIRE TOKEN LOGIC | Keep UI rule “hide verification when connected” only if still applicable to simple session. |
| #36 auth-canon foundation | Reconciles multiple auth truths | DELETE AFTER MIGRATION | This layer exists only because multiple auth sources existed. Simple session makes it structurally unnecessary. |
| #40 account API timeout + legacy fallback | Dual-mode server/browser fallback | DELETE FALLBACK | Generic request timeout/error normalization may remain in API client; legacy fallback must go. |
| #41 legacy snapshot fallback | Dual-mode snapshot reconciliation | DELETE | Directly conflicts with single-session architecture. |
| #42 proxy rejection -> direct token fallback | Browser direct-Google recovery | DELETE | Generic proxy is being retired; never fall back to a browser bearer token. |
| #52 auth-canon Phase 2 / transports | Expanded reconciliation + read/write transports | SPLIT | Keep unrelated Intelligence/VT-SYNC work if still useful. Retire auth-canon and legacy transport pieces after typed gateway parity. |
| #60 one YouTube widget transport | Attempts to unify old read transport | SUPERSEDED BY #64/#68 | Do not re-merge. Typed server endpoints are the actual single transport. |
| #62 account-session ownership + dataset isolation | Good auth-event diagnosis mixed with valuable VT-SYNC report registry | SPLIT AND CLOSE ORIGINAL | Auth changes are superseded by #68. Salvage analytics report registry/docs/data-isolation changes into a new PR rebased on current main. |
| #64 simple server-owned auth | New canonical auth foundation | KEEP | Canonical. |
| #68 YouTube API stabilization | Makes simple session sole auth owner + typed API migration | KEEP / CURRENT BASE | Canonical. |

## PR #62 salvage plan

Do **not** merge PR #62 as-is. It is behind current main and its UnifiedAccountContext/accountCoordinator changes conflict with the now-canonical simple-session adapter.

Salvage into a fresh branch from current main:
1. Keep:
   - docs/analytics/YOUTUBE_ANALYTICS_DATASET_EXPANSION_PLAN.md
   - docs/analytics/youtube-analytics-dataset-expansion-matrix.csv
   - src/features/vt-sync-local/upstream/analyticsReportRegistry.ts
   - analyticsReportRegistry tests
   - syncCategoryRegistry additions that are still absent
   - syncUnitRegistry additions that are still absent
   - non-destructive analytics merge tests/logic if current main does not already supersede them
2. Re-review before copying:
   - VtSyncControllerPanel changes
   - VtSyncLocalAnalyticsPage changes
   - localSyncEngine changes
3. Do not copy:
   - UnifiedAccountContext.tsx changes
   - GlobalDataContext auth-event ownership changes that conflict with simple session
   - accountCoordinator legacy/server fallback changes
   - accountEventOwnership.test.ts in its old form
4. Rewrite auth/event tests against the new invariant:
   - SimpleAuthProvider is the only auth owner.
   - UnifiedAccountContext is a compatibility projection only.
   - GlobalDataContext cannot emit or interpret authentication events.

## Legacy code retirement sequence

### Stage 1 — verify current main simple auth
Before deleting compatibility code:
- mobile login persists through 10 reloads
- logout works
- revoked credential -> reconnect_required
- Comment Responder works
- Video Manager read/write works
- Analytics typed endpoint works

### Stage 2 — migrate remaining consumers
Migrate every remaining import/reference of:
- services/auth/authSession
- services/auth-canon
- googleReadTransport
- youtubeWriteTransport
- beginAccountIntent
- isUnifiedAccountServerEnabled
- vt_auth_changed
- auth state in GlobalDataContext
- direct googleapis.com browser fetches

### Stage 3 — delete
Delete after zero-runtime-reference verification:
- src/services/auth/authSession.ts
- src/services/auth-canon/*
- src/services/youtube/googleReadTransport.ts + tests
- src/services/youtube/youtubeWriteTransport.ts + tests
- generic /api/account/google-proxy route/handling
- legacy fallback helpers in accountCoordinator
- browser-token storage/refresh logic
- obsolete cached-auth hydration paths

### Stage 4 — retain compatibility adapter briefly
Keep UnifiedAccountContext only until all UI surfaces consume useSimpleAuth/useSession directly. Then delete the adapter and old UnifiedAccountSnapshot auth fields if no longer needed.

## Branch cleanup policy

After useful code is salvaged and verified:
- close PR #62 with a note pointing to the replacement analytics salvage PR
- delete obsolete remote auth branches associated with #40, #41, #42, #60, #62 only after confirming no unique non-auth commits remain
- keep merged PR history; do not delete historical PR records
- tag a pre-auth-cleanup main commit before deleting legacy files

## Final invariant

A future grep should return **zero runtime hits** for:
- vt_auth_changed
- legacyLogin
- beginAccountIntent
- isUnifiedAccountServerEnabled
- browser accessToken/refreshToken storage
- google-proxy
- direct googleapis.com fetches under src/

Only server-side Google client modules may know Google access/refresh tokens.
