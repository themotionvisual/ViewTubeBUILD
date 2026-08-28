# Simple Auth V1

This branch starts the replacement auth island. It does not depend on browser Google tokens, localStorage auth, `vt_auth_changed`, `auth-canon`, or the generic Google proxy.

## Public auth surface

- `GET /api/auth-start?returnTo=/...`
- `GET /api/auth-callback`
- `GET /api/auth-session`
- `POST /api/auth-logout`

## First typed YouTube surface

- `GET /api/youtube/comments/threads`
- `POST /api/youtube/comments/reply`

## Browser auth truth

The browser receives only an HttpOnly `vt_session` cookie and the JSON returned by `/api/auth-session`.

## Required production environment

Existing:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `ACCOUNT_TOKEN_ENCRYPTION_KEY`
- `DATABASE_URL`
- `ACCOUNT_PUBLIC_ORIGIN=https://viewtube.live`

New redirect URI:
- `GOOGLE_SIMPLE_OAUTH_REDIRECT_URI=https://viewtube.live/api/auth-callback`

The same URI must be added to the OAuth client's Authorized redirect URIs in Google Cloud before this flow can be promoted to production.

## Deliberately not included

The old auth system is not deleted in this branch. Deletion happens after the new path proves mobile login persistence and Comment Responder parity.
