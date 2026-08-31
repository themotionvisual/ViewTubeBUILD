# ViewTube Feature Access and AI Credits Reference

**Status:** implemented locally as an advisory foundation. The interface explains the future policy; protected operations are not yet uniformly server-enforced.

## Canonical authority

The server-owned `GET /api/account/snapshot` response is the only authoritative input for feature access. Clients must use `fetchVerifiedUnifiedAccountSnapshot()` for decisions that represent verified access. Cached browser snapshots may support display continuity, but never grant access.

The snapshot supplies authentication state, subscription status and plan, Google connection state, granted ViewTube capabilities, and available AI credits. Browser email, local storage, and client-only owner or beta flags must never grant a paid, privileged, or write capability.

## Advisory decision order

`src/services/featureGating.ts` currently resolves a feature in this order:

1. Allow explicitly anonymous Basic features.
2. Require an authenticated, server-verified account.
3. Check billing availability and the minimum plan matrix.
4. Check rollout flags and required Google/ViewTube capabilities.
5. Check required canonical data when a gate declares it.
6. Check estimated AI credit availability for AI features.
7. Keep external writes in preview until explicit approval exists.

The resulting user-facing states are `enabled`, `preview`, `upgrade`, `connect`, `reconnect`, `insufficient_credits`, `unsupported`, and `disabled`. These explain why an action cannot proceed; they must not mutate sync state, canonical rows, or source provenance.

## Plans, data, and capabilities

The current plan matrix lives in `src/services/subscriptionPlans.ts`: `basic`, `beta`, `creator`, `creator_plus`, `creator_pro`, and `executive`. The feature registry owns the specific minimum plan and any table/capability requirement. `beta` does not itself grant paid or privileged access; it requires an explicit, server-provided allowlist assertion. Owner overrides also belong on the server.

| ViewTube capability | Google scope | Typical access outcome when absent |
| --- | --- | --- |
| `youtube_read` | `youtube.readonly` | Connect or reconnect channel |
| `youtube_analytics_read` | `yt-analytics.readonly` | Connect or reconnect before analytics sync |
| `youtube_monetary_read` | `yt-analytics-monetary.readonly` | Reconnect before private revenue analytics |
| `youtube_upload` | `youtube.upload` | Reconnect before upload/publish work |
| `youtube_comments` | `youtube.force-ssl` | Reconnect before comment mutation |
| `youtube_video_manage` | `youtube.force-ssl` | Reconnect before video metadata mutations |
| `search_console_read` | `webmasters.readonly` | Connect/reconnect before external signals |

Connection is distinct from plan access. A paid plan cannot supply an absent Google permission, and a valid Google connection cannot grant a plan-restricted feature. Server fallback to legacy browser OAuth remains limited to a missing account route or genuine account-server/network unavailability; scope, origin, quota, and Google policy failures stay server-mode failures.

## AI credits and settings meters

AI credits are server ledger units. The account snapshot exposes the remaining balance and, when available, a UTC-month `AiUsageSummary` sourced from authoritative metered debit entries. Settings groups current-period debits into `analysis`, `assets`, and `other`:

- **Analysis:** AI Brain and analytic/diagnostic work.
- **Asset generation:** AI writing and asset-generation work.
- **Other:** recorded debits without a recognized category.

The bars are usage views over one shared credit balance, not independent category quotas. They currently include only recorded metered server debits. BYOK calls, streaming calls, and legacy uncategorized activity are excluded or counted as `other`; documentation and UI must not imply complete provider-wide usage coverage.

## Enforcement path

Keep `FEATURE_GATING_MODE` as `advisory` until every protected operation performs the equivalent server-side check immediately before its side effect. Prioritize publishing/upload, comment/community writes, scheduled exports, custom connectors, and team-workspace mutations. Client notices remain user experience only; the server must enforce plan, capability, feature flag, credit debit, and explicit approval at the mutation boundary.

## Source and provenance rules

Feature access is separate from data provenance. The official YouTube Data API, Analytics API, Reporting API, Studio CSV imports, and canonical cache retain their existing source contracts. A gate may explain an unavailable capability or dataset, but it must never substitute a source, erase cached rows, or turn unavailable data into zero.

Fetcher is a future optional public-data connector only. If adopted, it requires a distinct connector gate, server-held credential/payment handling, and explicit source provenance. It cannot replace authenticated Google APIs for account identity, owner analytics, private revenue, writes, publishing, comments, or channel authorization.
