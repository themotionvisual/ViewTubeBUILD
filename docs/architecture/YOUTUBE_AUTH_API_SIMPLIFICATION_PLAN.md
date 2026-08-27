# ViewTube Google / YouTube Auth + API Simplification Plan

## Goal

Replace the current multi-path auth system with one boring, server-owned flow:

**Continue with Google -> server OAuth callback -> HttpOnly ViewTube session -> typed ViewTube API endpoints -> Google APIs**

The browser never owns Google tokens. Widgets never decide whether auth is valid. There is no legacy fallback mode.

## North-star rules

1. One login button and one Google OAuth flow.
2. One server-side credential owner.
3. One HttpOnly session cookie.
4. One session endpoint is the only frontend auth truth.
5. One Google client factory handles access-token refresh.
6. Every YouTube request goes through typed internal endpoints.
7. No direct `googleapis.com` requests from React/browser code.
8. No access/refresh tokens in localStorage.
9. No generic Google proxy accepting arbitrary URLs.
10. No auth state derived from analytics cache.
11. No widget-specific auth code.
12. No auth event bus or OR-chain reconciliation.

## Recommended Google flow

Use Google's supported Node.js client (`googleapis` / `google-auth-library`) with the server-side Authorization Code flow.

Core scopes for ViewTube:
- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/youtube.readonly`
- `https://www.googleapis.com/auth/youtube.force-ssl`
- `https://www.googleapis.com/auth/yt-analytics.readonly`
- `https://www.googleapis.com/auth/yt-analytics-monetary.readonly`

Add `youtube.upload` only when upload/publishing is intentionally enabled.

Request offline access so the backend owns a refresh token. The Google client automatically refreshes short-lived access tokens.

## Minimal auth API

Only four public auth routes should remain:

- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `GET /api/auth/session`
- `POST /api/auth/logout`

Optional fifth route only if truly needed:
- `POST /api/auth/reconnect` (can simply redirect to start with consent)

### Session shape

```ts
type ViewTubeSession = {
  status: "ready" | "signed_out" | "reconnect_required"
  user: { id: string; email: string; name: string | null; avatar: string | null } | null
  channel: { id: string; title: string; handle: string | null; thumbnail: string | null } | null
  capabilities: {
    youtubeRead: boolean
    youtubeWrite: boolean
    analyticsRead: boolean
    monetaryRead: boolean
    upload: boolean
  }
}
```

Frontend code reads this object. Nothing else is allowed to declare the user connected or disconnected.

## Minimal server layout

```
server/
  auth/
    googleOAuth.ts
    sessionStore.ts
    routes.ts
  youtube/
    client.ts
    errors.ts
    dataApi.ts
    analyticsApi.ts
    reportingApi.ts
    routes/
      comments.ts
      videos.ts
      playlists.ts
      analytics.ts
      reporting.ts
```

### `client.ts`

This is the only module that knows how to:
- load the user's refresh token
- create the Google OAuth2 client
- refresh access tokens
- map revoked/invalid credentials to `reconnect_required`

No React component or API-specific service handles token refresh.

## Frontend layout

```
src/
  auth/
    AuthProvider.tsx
    useSession.ts
  services/
    viewtubeApi.ts
```

`AuthProvider` calls `/api/auth/session` once at boot and after explicit login/logout. Widgets consume `useSession()`.

No `vt_auth_changed`.
No `vt_account_snapshot_changed`.
No browser token polling.
No browser OAuth fallback.

## Typed YouTube gateway

Do not keep `/api/account/google-proxy`.

Replace it with typed routes so the backend knows exactly which Google method is being called.

Examples:

### Comment Responder
- `GET /api/youtube/comments/threads`
- `POST /api/youtube/comments/reply`

### Video Manager
- `GET /api/youtube/videos`
- `GET /api/youtube/videos/:id`
- `PATCH /api/youtube/videos/:id`
- `POST /api/youtube/videos/:id/thumbnail`

### Analytics
- `POST /api/youtube/analytics/query`

### Reporting
- `GET /api/youtube/reporting/types`
- `GET /api/youtube/reporting/jobs`
- `POST /api/youtube/reporting/jobs`
- `GET /api/youtube/reporting/jobs/:id/reports`
- server-side report download/ingestion

This makes auth, validation, quota accounting, errors, and tests centralized.

## Code to retire

Delete only after the new path has parity tests.

### Auth/runtime retirement targets
- browser implicit OAuth code in `src/services/auth/authSession.ts`
- `vt_auth` and legacy `vt_session` token storage
- `isUnifiedAccountServerEnabled()` dual-mode switching
- `markUnifiedAccountServerUnavailable()` fallback mode
- browser-side direct Google fallback
- generic `/api/account/google-proxy`
- `vt_auth_changed` auth event ownership
- `vt_account_snapshot_changed` as an auth mechanism
- cached account snapshot as authority
- `GlobalDataContext.authState.isAuthenticated`
- `hydrateAuthStateFromAnalyticsCache()` for authentication
- widget-level `unifiedAuth.isAuthenticated()` checks
- widget-specific reconnect logic
- auth OR-chains / `auth-canon` reconciliation once all consumers use the new session

### Data/API retirement targets
- direct `fetch("https://www.googleapis.com/...")` calls from browser code
- duplicate Data API wrappers
- per-widget retry/token/error logic
- duplicate video catalog fetch paths
- duplicate comment fetch paths
- any Analytics query path that bypasses the canonical query service

## Migration sequence

### Phase 0 — Freeze
- Stop adding auth fixes to old paths.
- Tag current main as a recovery point.
- Add tests that reproduce mobile login persistence and Comment Responder failure.

### Phase 1 — Build the new auth island
- Add the four auth routes and server session store.
- Use Google Authorization Code + refresh token.
- Add `AuthProvider/useSession`.
- Do not delete old auth yet.

Exit condition: on iPhone, login once, reload repeatedly, remain signed in.

### Phase 2 — One read-only tool
Move Comment Responder reads first:
- comments list goes through typed server endpoint
- frontend gate uses only `session.capabilities.youtubeRead`
- no old auth imports

Exit condition: comments load after login on mobile.

### Phase 3 — Comment write
Move reply posting:
- backend checks `youtubeWrite`
- one error mapper
- no reconnect side effects inside widget

Exit condition: reply can be posted and UI remains signed in.

### Phase 4 — Video Manager
Move list/read/update/thumbnail operations to typed endpoints.

Exit condition: catalog + edit operations work through the same session.

### Phase 5 — Analytics API
Move all ad-hoc analytics queries to one server service. Validate metric/dimension combinations using the installed YouTube expert skill/reference matrix.

### Phase 6 — Reporting API
Centralize reporting jobs, report polling, downloads, and canonical ingestion.

### Phase 7 — Delete legacy auth
Remove the retirement targets above in one deliberate cleanup PR. Do not keep compatibility fallbacks.

### Phase 8 — Delete duplicate API paths
Search the repo for direct Google URLs and old wrappers. A governance test should fail if new browser-side Google API calls or legacy token storage are introduced.

## Required tests before legacy deletion

1. Mobile Safari login redirect completes.
2. Session survives reload and route navigation.
3. Session survives app boot with zero localStorage auth keys.
4. Access-token expiry refreshes server-side without UI logout.
5. Revoked refresh token becomes exactly `reconnect_required`.
6. One failed YouTube API call cannot sign the entire app out.
7. Comment list works.
8. Comment reply works.
9. Video list works.
10. Video update works.
11. Analytics query works.
12. Revenue query correctly requires monetary scope.
13. Reporting job/list/download lifecycle works.
14. No browser bundle contains Google refresh/access token persistence code.
15. No widget imports legacy auth services.

## Governance checks

Add static tests that forbid:
- `localStorage.*accessToken`
- browser imports of the old auth session module
- direct `googleapis.com` fetches under `src/`
- `vt_auth_changed`
- new uses of `GlobalDataContext.authState.isAuthenticated`

The end state should be intentionally boring: one login flow, one session, one backend Google client, one API gateway, one frontend session hook.
