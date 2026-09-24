# Simple Auth V1

**Status:** CANONICAL LIVING AUTH / YOUTUBE SESSION CONTRACT  
**Last audited main:** `2efe0f56eb52c1029c71543291cf65e2b1a2245f`  
**Canonical owner / concern:** browser authentication state, server-owned Google credentials/session, public auth routes, and the browser boundary used by typed YouTube APIs.  
**Executable authority:** `src/auth/AuthProvider.tsx`, `src/auth/session.ts`, `server/simple-auth.mjs`, `server/simple-auth-route.mjs`, `api/auth.mjs`, `vercel.json`, and auth/account contract tests.  
**Related active migration:** `YOUTUBE_API_STABILIZATION_V1_TRACKER.md` owns remaining typed YouTube API migration/deletion work.  
**Troubleshooting reference:** `VIEWTUBE_AUTH_API_STABILIZATION_REFERENCE.md`.

## Architecture

Simple Auth is the browser-facing auth owner. Google refresh/access credentials stay server-side. The browser receives session state and an HttpOnly `vt_session` cookie; browser Google token persistence is not canonical auth truth.

```text
browser
  -> SimpleAuthProvider / src/auth/session.ts
  -> flat public auth route
  -> one simple-auth router
  -> server-owned OAuth/session/credentials
  -> typed /api/youtube/* services
```

`UnifiedAccountContext` may project Simple Auth state for compatibility, but it must not become another login/session owner.

## Canonical browser-facing routes

| Operation | Canonical public route | Method |
| --- | --- | --- |
| Start login | `/api/auth-start` | GET |
| OAuth callback | `/api/auth-callback` | GET |
| Read session | `/api/auth-session` | GET |
| Logout | `/api/auth-logout` | POST |

Frontend code should use the flat routes above.

## Compatibility aliases

Current server/router and Vercel rewrites intentionally accept these compatibility paths:

- `/api/auth/google/start`
- `/api/auth/google/callback`
- `/api/auth/session`
- `/api/auth/logout`

They resolve to the same simple-auth operations and are tested as aliases. Their existence does **not** make them a second frontend contract. New browser code should continue using the flat routes.

## Browser auth truth

The browser receives:

- an HttpOnly `vt_session` cookie;
- normalized session JSON from `GET /api/auth-session`.

The browser must not treat a Google access token in localStorage, an auth event bus, a widget-local reconnect flag, or an analytics cache as canonical session truth.

## Session responsibility

Simple Auth owns:

- OAuth start/callback;
- session read/logout;
- server-side credential refresh;
- signed-in / signed-out / reconnect-required interpretation.

Feature errors must not globally sign the user out unless the credential/session owner determines credentials are revoked or reconnect is required.

## Typed YouTube boundary

Authenticated product features should call typed ViewTube server routes rather than Google directly from the browser.

Examples already present include comment, video, playlist, thumbnail, Analytics and Reporting operations. Remaining migration/deletion work is tracked in `YOUTUBE_API_STABILIZATION_V1_TRACKER.md`.

## Required production environment

Core environment includes:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `ACCOUNT_TOKEN_ENCRYPTION_KEY`
- `DATABASE_URL`
- `ACCOUNT_PUBLIC_ORIGIN=https://viewtube.live`
- `GOOGLE_SIMPLE_OAUTH_REDIRECT_URI=https://viewtube.live/api/auth-callback`

The callback URI must also be configured in the Google OAuth client.

## Verification contract

Before changing auth or claiming a production auth fix:

1. verify the exact Git SHA served by production;
2. verify `/api/auth-start`, callback, session and logout route behavior;
3. verify compatibility aliases still resolve through the same router if they remain supported;
4. run server/account auth tests;
5. verify signed-in persistence across reload/navigation;
6. verify revoked credentials map to reconnect-required rather than generic API failures;
7. confirm no new browser Google-token owner was introduced.

## Supersession

The following are no longer current auth architecture owners:

- `YOUTUBE_AUTH_API_SIMPLIFICATION_PLAN.md` — historical design direction;
- `AUTH_PR_CONSOLIDATION_AUDIT.md` — historical PR decision record;
- older migration/reference auth reviews — historical evidence.

When those documents disagree with this file or current code/tests, this file plus executable contracts wins.
