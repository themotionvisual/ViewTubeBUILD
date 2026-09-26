# ViewTube Royal Exchange

The Royal Exchange is the file-backed handoff bus between the Kingdom product/mission system and the Republic engineering/execution system.

It is intentionally outside runtime-critical application paths. It records intent, execution plans, receipts, decisions and artifact provenance without becoming a second Task Index, analytics store, Brain memory store or deployment authority.

## Folders

- `missions/` — KING-authored `VT_MISSION` records.
- `work-orders/` — EMPEROR-authored executable work orders tied to a real checkout/base SHA.
- `receipts/` — specialist, Marshal and verification evidence.
- `decisions/` — unresolved or consequential decision records.
- `artifacts/` — provenance records for plans, demos, reports, code or screenshots.
- `handoffs/` — explicit cross-domain handoff records.
- `conflicts/` — ownership or desired-vs-executable-state conflicts.

## Core rule

Every record must reference a `missionId`. No record may silently expand authorization, file ownership, scope, billing authority, OAuth scope or deployment permission.

## Completion model

A mission may only move to `complete` when its acceptance criteria have corresponding receipts. A plan, commit or passing unit test by itself is not sufficient evidence of production behavior.


## Conversation OS and Task Authority

Conversation OS may create or link Mission, Work Order, Decision, Receipt, Artifact, Handoff and Conflict records here when a substantial mission exists.

Task Authority remains separate and is the only canonical task-state mutation interface.

Opportunities and risks discovered in conversation are candidate/improvement records, not Task Index state. They may reference a mission, decision or artifact, and are promoted to committed work only through Task Authority reconciliation.

Writer leases are coordination metadata on work orders; they are soft/expiring and do not redefine canonical code ownership.
