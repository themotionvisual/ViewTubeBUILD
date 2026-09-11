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
