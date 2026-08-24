# auth-canon — the single source of truth for account status

Every consumer that asks "is this user signed in? / can I call YouTube APIs? / should I show the reconnect prompt?" reads through this namespace. Under the hood it reconciles the three fragmented signals that exist today into one consistent answer.

## Why this exists

Historically the codebase has three independent auth signals:

1. **`unifiedAuth.isAuthenticated()`** — the live OAuth token check in localStorage. Reflects real API-call viability.
2. **`useUnifiedAccount()` → `snapshot.authentication.status`** — the VT account state, derived from a cached snapshot that persists across sessions.
3. **`useBrain().authState.isAuthenticated`** — GlobalDataContext-side auth flag, updated by several event listeners.

The three drift constantly. The mobile "signed in but nothing works" state came from exactly this drift: the nav shell OR-chained all three signals (any one true = show account chip), the sync-in-progress widget looked at yet another combination, and API calls happily fired against an expired token. When the API 401'd, the invalidation handler reset local state but never cleared the token, so the next render restored the "signed in" state. Loop.

**Direction:** one hook, one answer. When the token goes away, every consumer of `useAccountStatus()` flips together. No more per-consumer decision about which OR-chain to use.

## The `AccountStatus` states

```
ready            → account authenticated + Google connected + token present.
                   Widgets can call APIs. UI shows signed-in state.

connecting       → an auth flow is in flight (popup open, refresh underway).
                   Widgets show a spinner / disabled state.

needs_reconnect  → the user was authenticated but the Google token is
                   missing/expired. Show a "reconnect" prompt, not
                   "sign up".

anonymous        → no VT account. Show sign-up.
```

## Migration cheat sheet

| Legacy pattern | Canonical replacement |
| --- | --- |
| `useBrain().authState.isAuthenticated` | `useAccountStatus().accountAuthenticated` (or `useAccountStatusKind() === "ready"`) |
| `useUnifiedAccount().snapshot.authentication.status === "authenticated"` | `useAccountStatus().accountAuthenticated` |
| `unifiedAuth.isAuthenticated()` in React code | `useAccountStatus().tokenPresent` |
| `account.snapshot.google.status === "connected"` | `useAccountStatus().googleConnected` |
| Big OR-chains across all three | `useAccountStatus().canUseYouTubeApis` |

`unifiedAuth.isAuthenticated()` is still fine to call from non-React service code — it's the underlying token check. Only React consumers should switch.

## What's in each file

| File | Purpose |
| --- | --- |
| `contracts.ts` | Types: `AccountStatus`, `AccountStatusPayload`, re-exports of `UnifiedAccountSnapshot`. |
| `reconcile.ts` | Pure `reconcileAccountStatus({ snapshot, tokenPresent })` — the single rule set. |
| `useAccountStatus.ts` | React hook — combines `useUnifiedAccount()` + a live token check + `vt_auth_changed` subscription, calls the reconciler. Plus `useCanUseYouTubeApis` and `useAccountStatusKind` convenience variants. |
| `reconcile.test.ts` | 10 tests pinning the reconciliation rules — including the exact "cached snapshot lies about token" scenario. |
| `index.ts` | Public barrel — the ONLY entry point. |

## Rules

1. **Consumers import from `services/auth-canon` only.**
2. **The reconciler stays pure.** No React, no side effects.
3. **`useAccountStatus` re-subscribes on `vt_auth_changed`** so it always reflects the current token, even after a background invalidation.
4. **Additive changes only until Phase 5.** We don't delete the legacy sites yet — we add auth-canon alongside and migrate consumers one PR at a time.

## Migration phases

- **Phase 0** — Foundation (this module lands, zero consumer changes). ← *you are here after this PR merges*
- **Phase 1** — Nav shell + Dashboard header: `AppShell`, `AdaptiveNavigationShell`, `DashboardHeader`, `AccountActionButton`.
- **Phase 2** — Verification widget + gate widgets currently reading `authState.isAuthenticated`: `VerificationExplainerWidget`, `DailyAdviceWidget`, `AIBrainCommandInterface`, `VideoPublisher`.
- **Phase 3** — Tool views: `Channelytics`, `MediaAnalyzer`, `HookGenerator`, `ThumbnailStudio`, `SEOGenerator`, `Subscribe`, `Settings`.
- **Phase 4** — GlobalDataContext internals: replace ~8 `unifiedAuth.isAuthenticated()` direct calls with the reconciled status; remove `authState.isAuthenticated` field.
- **Phase 5** — Retire the direct OR-chain sites and inline auth checks; `authState.isAuthenticated` deleted from the context value.

See `docs/migration/README.md` for the parallel analytics-canon plan and the combined status snapshot.

## When you migrate a consumer

1. Delete `useBrain()` destructuring that pulls `authState` (if only used for auth).
2. Delete `useUnifiedAccount()` destructuring that pulls `snapshot.authentication` / `snapshot.google` (if only used for auth).
3. Delete inline `unifiedAuth.isAuthenticated()` calls.
4. Add `import { useAccountStatus } from "services/auth-canon"`.
5. Replace the old logic with the appropriate hook return.
6. If the consumer branched on "signed in but Google disconnected", use `status === "needs_reconnect"` — the previous code probably had a bug where it treated this state as "signed in and OK".
