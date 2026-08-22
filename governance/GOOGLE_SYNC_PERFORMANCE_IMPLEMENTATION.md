# Google Sync, Analytics Performance, and Diagnostics Implementation

Implemented on `codex/auth-sync-performance-fixes` from `origin/integration/align-2026-08-21`.

## Runtime contract

- `server/account-auth.mjs` remains the single Google OAuth and proxy owner.
- Proxy errors use stable request-ID envelopes and distinguish sign-in, reconnect, scope, quota, rate-limit, upstream, and timeout recovery.
- VT-SYNC retries only explicitly retryable responses, makes at most three attempts, preserves `Retry-After`, and stops queued Google work after reconnect failure.
- Failed syncs preserve the previous canonical snapshot, imported rows, and stored datasets. Runtime mock or estimated replacement rows are forbidden.
- Closed analytics visual toolboxes remain unmounted and unloaded. Progress rendering is capped at ten updates per second while terminal transitions remain immediate.
- Comment metadata requires an authenticated, connected, correctly scoped account and is canceled when authorization changes or the widget unmounts.
- Visual animation choreography, navigation animation, header replay placement, and the three replay variants remain unchanged. Controllers clean up pending animation frames and existing visibility gates pause hidden work.
- Runtime diagnostics are redacted, deduplicated, developer-console only, and enabled only in development or by the explicit diagnostics flag.
- PostgreSQL URLs are normalized to `sslmode=verify-full` unless database TLS is explicitly disabled for a local environment.

## Release gate

Focused server and client contracts, the production build, route smoke tests, and browser profiling must pass on the protected Vercel preview. A real authenticated callback and one real-data VT-SYNC run are required before merge. Production promotion is a separate manual approval and must not be automated.
