# ViewTube Authorization + YouTube API Stabilization Reference

## Why this document exists
This records the concrete failure patterns and architectural lessons discovered while stabilizing ViewTube's Google/YouTube connection system in August 2026. Read it before changing auth, account state, YouTube API gateways, Analytics/Reporting connections, or Vercel API routes.

## Core lesson
Most failures were not caused by one bad OAuth line. They came from **too many overlapping truths**: old and new routes, multiple connection interpretations, cached state, provider startup behavior, deployment/source confusion, and duplicated server functions.

The durable fix is reduction.

## Failure patterns observed

### Old browser route survived after new server design
The browser continued requesting:
`/api/auth/google/start?returnTo=...`
while the intended new contract was:
`/api/auth-start?returnTo=...`

This produced Vercel 404 pages before Google OAuth was even reached.

Lesson: when changing route architecture, search both server files and every client literal/caller. A server fix is irrelevant if a stale client bundle still calls the old route.

### Local and production can fail identically for different deployment reasons
A localhost build can contain an old branch/client. Production can also contain an old bundle because the latest Git commit never became the READY production deployment.

Lesson: identify **runtime SHA/branch first**. Never infer deployed code from repository state.

### Redeploying an old Vercel deployment does not mean deploying current main
Repeated redeploys served commit `710df81` even after newer auth fixes existed on `main`.

Lesson: distinguish "redeploy this deployment" from "fresh Git deployment of current main". Always inspect `githubCommitSha`.

### Successful compile can still be failed deployment
New builds compiled, then Vercel reported:
`exceeded_serverless_functions_per_deployment`.

The cause was additive routing: new flat auth functions were added while old nested auth functions remained.

Lesson: inspect deployment state and platform error after build. "Build completed" does not mean "production READY".

### Duplicate route architecture consumed function budget
At one point the repository contained flat auth endpoints plus nested catchalls, index handlers, route helpers, and individual Google/session/logout handlers.

The obsolete nested auth deployment files were removed so the flat contract could remain without wasting serverless functions.

Lesson: every migration should include deletion/consolidation, not just addition.

### 401/403 is not synonymous with signed out
Earlier UI behavior could turn API authorization failures into "reconnect" or disconnected states.

Lesson: classify the error. A valid ViewTube session can coexist with a missing YouTube permission or a feature-specific API failure.

### Request storms obscure connection failures
Diagnostics showed high request volume during startup, including many YouTube playlist requests.

Lesson: do not use broad catalog hydration as an implicit auth probe. Resolve session/channel readiness first, then perform controlled API work.

### Diagnostics disappeared exactly when they were needed
The on-screen diagnostic component was not consistently visible during production/mobile debugging.

Lesson: diagnostics must be treated as a first-class stabilization feature and must survive auth refactors.

## Canonical direction

### Browser-facing auth
`GET /api/auth-start`
`GET /api/auth-callback`
`GET /api/auth-session`
`POST /api/auth-logout`

### Responsibilities
**OAuth layer:** consent, state/CSRF, code exchange, token persistence, refresh.

**Session layer:** ViewTube browser session and safe account snapshot.

**Channel layer:** resolve authorized YouTube identity/channel.

**API layer:** authenticated server calls to Data/Analytics/Reporting APIs with centralized retry/error mapping.

**Feature layer:** declares required capabilities and renders accurate readiness/error states.

No layer should silently become another layer's source of truth.

## Google OAuth facts agents must preserve
Google's server-side web flow is appropriate when the application can securely store confidential information and persistent authorization. The server exchanges an authorization code for tokens; refresh tokens support access after the access token expires. Redirect URIs must exactly match an authorized redirect URI, including scheme, host, path and trailing-slash semantics. Use `state` to protect the authorization flow. Never commit client secrets or expose refresh tokens to browser code.

YouTube does not support using a service account as a substitute for user-channel OAuth.

Scopes should be minimized and preferably requested in context. Missing optional consent should disable the dependent functionality rather than collapsing the entire account connection.

## Suggested ViewTube capability registry
Maintain one machine-readable registry with entries resembling:

`comments.read -> YouTube Data API -> read comments -> required scopes`
`comments.reply -> YouTube Data API -> insert reply -> required write scope`
`videos.catalog -> YouTube Data API -> list channel videos -> readonly`
`analytics.read -> YouTube Analytics API -> query reports -> analytics/read authorization`
`reporting.read -> YouTube Reporting API -> jobs/reports -> reporting authorization`
`videos.upload -> YouTube Data API -> upload -> upload scope`

The exact scope list must be checked against current Google documentation before changing production consent.

## Error taxonomy
Normalize errors into categories instead of scattering raw HTTP handling:
- `AUTH_SESSION_MISSING`
- `AUTH_REFRESH_REQUIRED`
- `AUTH_REFRESH_FAILED`
- `SCOPE_MISSING`
- `CHANNEL_NOT_RESOLVED`
- `API_DISABLED`
- `QUOTA_EXCEEDED`
- `RATE_LIMITED`
- `RESOURCE_NOT_FOUND`
- `PERMISSION_DENIED`
- `NETWORK_ERROR`
- `DEPLOYMENT_ROUTE_MISSING`
- `UNKNOWN_API_ERROR`

Preserve the underlying HTTP status and Google error reason for diagnostics.

## What to remove aggressively
After dependency proof, remove:
- duplicate OAuth starters/callbacks,
- duplicate session endpoints,
- duplicate logout endpoints,
- nested compatibility routes with no callers,
- client token managers when server session is canonical,
- localStorage booleans used as auth truth,
- provider-specific reconnect heuristics,
- automatic logout on generic API failure,
- duplicate refresh timers/interceptors,
- stale environment-variable fallbacks that can override the canonical production callback,
- old API proxies that duplicate a newer gateway,
- feature-local "is connected" calculations.

## What not to remove blindly
Preserve until audited:
- unique scope requirements,
- token migration logic still needed by active users,
- channel-selection behavior,
- Brand Account handling,
- API quota/error classification,
- Analytics/Reporting-specific request construction,
- CSRF/state validation,
- refresh-token preservation behavior,
- diagnostics and tests.

## Verification ladder
Use this exact ladder after changes.

**A. Static**
- search old route strings
- search token/localStorage ownership
- count API functions
- typecheck
- unit/integration tests
- production build

**B. Deployment**
- expected SHA
- READY state
- custom domain assigned
- no post-build platform-limit error

**C. Direct HTTP**
- session endpoint
- auth-start redirect
- callback route exists
- logout method/response

**D. OAuth**
- Google consent
- exact redirect
- callback success
- session established
- reload preserves session
- expired access token refreshes without logout

**E. YouTube**
- channel identity
- video catalog
- comments read
- comment reply if authorized
- Analytics query
- Reporting operation if enabled
- quota/permission errors produce accurate UI states

**F. UX**
- desktop
- mobile
- diagnostics visible
- no immediate sign-out
- no request storm
- tools do not incorrectly show "connect channel" for empty data

## Deployment checklist for Vercel Hobby
Platform limits are architecture constraints. Before adding routes:
1. enumerate `api/**` deployable files,
2. identify which become functions,
3. remove superseded handlers,
4. prefer consolidated gateways,
5. inspect the final deployment error/state, not only build logs.

The 2026 incident demonstrated that additive endpoint migrations can make an otherwise valid code change undeployable.

## Agent operating principle
When tempted to add another auth helper, provider, fallback, proxy, route, token cache, or reconnect path, first ask:

**Can an existing canonical component own this responsibility instead?**

If yes, extend the canonical component and delete the duplicate.

The target architecture is not maximum fault-tolerance through fallbacks. It is maximum diagnosability through a small number of explicit, testable paths.
