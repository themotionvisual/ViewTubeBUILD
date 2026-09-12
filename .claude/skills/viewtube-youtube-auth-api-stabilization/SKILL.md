# ViewTube YouTube Auth + API Stabilization Skill

## Purpose
Use this skill whenever an agent changes, debugs, merges, removes, or reviews ViewTube code involving Google OAuth, YouTube authorization, YouTube Data API, YouTube Analytics API, YouTube Reporting API, account/channel connection state, API proxies, token/session handling, or deployment routes.

The governing objective is **one boring, observable connection system**. Prefer fewer routes, fewer state owners, fewer token paths, fewer fallbacks, and fewer compatibility layers.

## Non-negotiable architecture

### 1. Separate authentication from authorization
- **ViewTube session** answers: is this browser signed into ViewTube?
- **Google/YouTube authorization** answers: has Google granted the scopes needed for this operation?
- **Channel connection** answers: can ViewTube identify and access the user's YouTube channel?
- **Feature readiness** answers: does this particular tool have its required scope/data/API available?

Never collapse all four into one boolean such as `connected`.

### 2. One OAuth flow
For the current Vercel deployment use one server-side OAuth authorization-code flow:
1. browser -> `GET /api/auth-start?returnTo=...`
2. server -> Google consent
3. Google -> `GET /api/auth-callback`
4. server exchanges code and creates/updates the canonical session/token record
5. browser -> application
6. browser reads `GET /api/auth-session`
7. logout -> `POST /api/auth-logout`

Do not create a second OAuth implementation for a widget, API family, mobile, desktop, analytics, comments, video manager, or local cache.

### 3. One canonical client auth owner
React/UI code must consume one canonical account/session context. Widgets do not independently infer authentication from localStorage, cached analytics, stale channel IDs, access tokens, Google SDK state, or whether an API request happened to succeed.

### 4. Server owns credentials
Client secrets and refresh tokens are server-side only. Browser code should receive the minimum session/account/readiness information required. Do not put access or refresh tokens in query strings.

### 5. One API gateway pattern
Prefer a small number of server gateways grouped by concern rather than one Vercel function per YouTube operation. A gateway may route internally by an allowlisted path/action. Keep public route count intentionally small.

## Current production auth contract
Canonical flat endpoints:
- `/api/auth-start`
- `/api/auth-callback`
- `/api/auth-session`
- `/api/auth-logout`

The old nested `/api/auth/google/*` and `/api/auth/*` compatibility routes are legacy and must not be recreated unless a migration plan explicitly requires them.

## Scope strategy
Request only scopes needed by actual ViewTube features. Build a scope registry mapping:
`feature -> API -> operation -> required scope -> read/write sensitivity`.

Use incremental authorization when practical. A missing optional scope must disable only the dependent capability; it must not sign the user out or mark the entire channel disconnected.

Examples:
- read-only channel/video discovery: prefer YouTube read-only permission where sufficient.
- comment mutation/moderation or other write operations: use the specific write-capable scope required by the API.
- Analytics/Reporting: document their required scopes separately from Data API operations.
- upload/publishing: do not grant upload/write permission merely because analytics is connected.

## Refresh-token rules
- Treat access-token expiry as normal, not logout.
- Refresh server-side.
- Preserve a valid existing refresh token if Google omits a new one during a later authorization response.
- Treat revoked/expired refresh credentials as a reconnect condition, not a reason to destroy unrelated ViewTube state.
- Never continuously force consent merely to obtain new refresh tokens.
- Never create multiple competing refresh loops.

## State model
Expose explicit states such as:
- `signedOut`
- `signedInNoYouTubeGrant`
- `youtubeAuthorized`
- `channelResolved`
- `missingScope`
- `refreshRequired`
- `apiUnavailable`
- `quotaLimited`
- `ready`

A 403 must be classified before changing state. It can mean insufficient scope, quota/policy, API-disabled, wrong channel/resource, or authorization failure. Do not translate every 401/403 into "sign out".

## Startup rules
Startup must be cheap and deterministic:
1. mount application
2. read canonical session once
3. resolve channel/account snapshot once if needed
4. hydrate caches only after canonical state is known
5. tools subscribe to canonical state

Never allow multiple providers to race to "repair" auth. Never launch dozens of YouTube requests before session/channel readiness is established.

## API request rules
- Centralize authenticated fetch.
- Centralize refresh/retry behavior.
- Maximum one refresh retry for an authorization failure.
- Deduplicate identical in-flight requests.
- Cache stable catalog/channel metadata.
- Batch/paginate intentionally.
- Add concurrency limits for playlist/video enumeration.
- Never use request storms as a connection test.
- Classify errors by API + endpoint + status + Google reason.

## Diagnostics contract
Diagnostics are part of the stabilization architecture, not temporary decoration.

Log at minimum:
- build/commit identifier
- route
- session-state transitions
- channel-state transitions
- OAuth start/callback success/failure (never secrets/codes/tokens)
- API gateway request family
- HTTP status
- Google error reason
- refresh attempt/result
- fetch counts and duplicate-request warnings
- render storms
- boot phases/timing
- deployment/runtime version

Keep the on-screen DIAG component available during stabilization, especially on mobile. Include a copy-all action. Redact tokens, authorization codes, cookies, client secrets, and sensitive headers.

## Debugging order
When login/API tools fail, debug in this order:

1. **Deployment truth**
   - What exact Git SHA is production serving?
   - Is the deployment READY?
   - Was it a fresh Git build or a redeploy of an old deployment?
2. **Route existence**
   - Hit session/start endpoints directly.
   - A Vercel 404 is routing/deployment, not Google OAuth.
3. **OAuth redirect contract**
   - Verify the callback URI emitted by the app exactly matches Google Cloud configuration.
4. **Session**
   - Confirm callback creates session and session endpoint can read it.
5. **Token refresh**
   - Confirm refresh happens server-side and does not cause logout loops.
6. **Scopes**
   - Compare granted scopes with the failing feature's required scope.
7. **API request**
   - Inspect exact endpoint/status/reason.
8. **UI state**
   - Only after server behavior is proven should the widget's rendering/labels be debugged.

Do not start by editing UI copy such as "Connect your channel".

## Deployment truth rules
Never say "fixed on live" because code was merged.

A live fix is verified only when:
1. production deployment SHA equals the intended Git SHA or descendant,
2. deployment is READY,
3. canonical endpoints are directly tested,
4. OAuth completes,
5. session survives reload,
6. at least one representative authenticated YouTube request succeeds,
7. mobile is tested when the reported failure is mobile-specific.

A Vercel **Redeploy** of an existing deployment can rebuild the same old source. Always inspect the deployment's source SHA.

## Vercel function-budget rule
Before adding any `api/**` file, count deployable serverless functions. Do not solve routing problems by accumulating duplicate files.

ViewTube previously hit the Hobby deployment function limit after flat auth endpoints were added while old nested auth endpoints remained. The build itself completed, but Vercel rejected the deployment afterward. Therefore:
- remove superseded routes in the same migration,
- consolidate related API handlers,
- keep an explicit function inventory,
- treat deployment-plan limits as architecture constraints.

## Legacy-code removal procedure
Never delete auth/API code solely because its name looks old.

For every candidate:
1. find imports and callers,
2. search literal URLs,
3. search dynamic route construction,
4. inspect server rewrites/config,
5. inspect tests/docs,
6. compare behavior against canonical owner,
7. classify: canonical / adapter / duplicate / dead / migration-only,
8. port any unique behavior,
9. remove callers first,
10. delete implementation,
11. run search again to prove no runtime references remain.

Compatibility aliases need an owner and removal date. Permanent compatibility layers become duplicate architecture.

## Merge procedure
For auth/API PRs, merge behavior, not files.

Build a matrix:
- session owner
- OAuth start
- OAuth callback
- token storage
- refresh
- logout
- channel resolution
- scopes
- API gateway
- error mapping
- diagnostics
- tests
- deployment routes

Choose one winner for each responsibility. Port missing capabilities into the winner. Do not merge two competing providers or token managers and promise to clean them up later.

## Tool-specific readiness
Comment Responder, Video Manager, Analytics, Publisher, Reporting imports, and other tools must ask the canonical connection layer for feature readiness.

A tool may say:
- connected but missing permission,
- connected but API request failed,
- connected but no results,
- reconnect required.

It must not say "Connect your YouTube channel" merely because its own query returned no rows.

## Mobile
Mobile and desktop use the same auth/session architecture. Do not create mobile-only token persistence or OAuth logic. Mobile-specific work should be limited to navigation, browser-cookie constraints, responsive UI, and diagnostics visibility.

## Agent stop conditions
Stop and investigate instead of adding code when:
- two modules both claim to own auth state,
- two refresh loops exist,
- a new endpoint duplicates an existing route,
- a 403 is being treated as logout without inspecting its reason,
- production SHA does not match the code being debugged,
- a deployment failed after build,
- adding an API file would exceed platform limits,
- the proposed fix requires another localStorage auth truth source.

## Definition of done
An auth/API stabilization change is complete only when:
- one canonical flow remains,
- legacy callers are removed,
- route/function inventory is within deployment limits,
- typecheck/tests/build pass,
- production SHA is verified,
- direct endpoint smoke tests pass,
- OAuth survives reload,
- reconnect behavior is correct,
- representative Data API and Analytics/Reporting operations work as applicable,
- diagnostics show no login loop/request storm,
- mobile and desktop use the same connection truth.
