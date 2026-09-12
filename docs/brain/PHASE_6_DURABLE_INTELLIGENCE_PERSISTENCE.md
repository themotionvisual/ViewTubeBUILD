# Phase 6 Durable Intelligence Persistence

## Goal

Make Algorithm Intelligence events and lifecycle observations durable across devices/sessions without changing canonical analytics ownership.

## Authority

```text
VT-SYNC -> analytics-canon -> canonical analytics evidence
                               |
                               v
                    Phase 6 evaluation/learning
                               |
                               v
Browser cache <-> authenticated Brain persistence API <-> ViewTube PostgreSQL
```

VT-SYNC and analytics-canon remain the analytics authorities. The Brain persistence layer stores intelligence lineage, evaluation history, monitoring checkpoints, learning events, and genuine lifecycle observations used by Phase 6.

## Production tables

- `viewtube_brain_intelligence_events`
  - scoped by ViewTube user + connected channel + stable event ID
  - JSONB event payload keeps the existing typed event contract intact
- `viewtube_brain_lifecycle_observations`
  - scoped by ViewTube user + connected channel + stable observation key
  - stores the actual observation timestamp and lifecycle age

Both reference `viewtube_users` and cascade on account deletion.

## Security boundary

`/api/brain-intelligence` derives the user exclusively from the existing `vt_session` cookie. A client never supplies `viewtube_user_id`. Before either GET or PUT, the requested channel must match `getAccountSnapshotData(userId).channelId`; otherwise the request is rejected.

The store additionally rejects event/observation rows whose embedded `channelId` does not match the authorized storage scope.

## Cache and sync behavior

Browser local storage remains a bounded fast/offline cache, not the durable production authority.

On Brain Evaluation Inbox activation:

1. hydrate Algorithm Intelligence events from durable storage;
2. hydrate lifecycle observations;
3. merge them into the local caches by stable IDs/keys;
4. capture the current VT-SYNC lifecycle evidence;
5. resolve eligible monitoring checkpoints;
6. finalize only evidence-sufficient final evaluations;
7. subscribe to future VT-SYNC snapshot changes.

New events and lifecycle observations are written locally immediately, then asynchronously written through to the server. A temporary persistence failure leaves local workflow state intact and can be retried on a later hydration/write.

## Environment behavior

Production requires the existing `DATABASE_URL` and uses the same PostgreSQL database/configuration family as ViewTube account persistence. The Brain store owns its own tables; it does not create a parallel analytics database.

Development without `DATABASE_URL` uses an in-memory server fallback. Browser local storage continues to preserve front-end development continuity.

## Safety invariants

- Persistence does not create or infer analytics evidence.
- Workflow completion still cannot satisfy analytics metrics.
- Intermediate monitoring observations remain non-learnable.
- Missing final evidence remains retryable rather than becoming synthetic success/failure.
- One source action still owns one idempotent measured outcome.
- Durable learning promotion still requires governance and explicit creator approval.
- Persistence never grants access to a channel that is not connected to the authenticated ViewTube account.

## Migration note

Existing pre-persistence browser history remains available locally. A later migration/backfill control should explicitly upload those local records after channel/account ownership is confirmed rather than silently bulk-promoting every historical browser record.
