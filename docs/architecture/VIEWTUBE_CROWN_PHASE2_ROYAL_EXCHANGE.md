# ViewTube Crown Phase 2 — Royal Exchange

## Objective
Turn the Crown from a role taxonomy into an inspectable coordination system without introducing a second runtime authority.

## Design
The Exchange is file-backed, human-readable and intentionally outside `src/`, `server/` and `api/`. It does not execute code, mutate Task Index state, call external services, debit credits, publish, deploy or become Brain memory. It stores coordination records that point to the real owners of those capabilities.

## Record lifecycle
1. KING creates `VT_MISSION` from creator intent and existing evidence.
2. Grand Artifact Compiler attaches plans, prototypes and provenance.
3. EMPEROR converts an approved mission into `VT_WORK_ORDER` tied to a real checkout/base SHA.
4. Specialist skills and Marshals return `VT_RECEIPT` records.
5. Verification Chancellor checks acceptance against receipts.
6. Task Authority may recommend a Task Index status change only from supported receipts.
7. Docs Archivist registers resulting artifacts and decisions.
8. KING closes the loop by comparing outcome against creator intent and recording revisable learning.

## Read-only integration boundary
Phase 2 must remain read-only with respect to the canonical Task Index and artifact portal. Crown records may contain `taskIds` and artifact paths, but no Phase 2 tool may automatically change task status or delete/move an artifact.

## Current repo alignment
- Dashboard work routes through `.claude/skills/viewtube-widget-dashboard`.
- YouTube API work routes through `.claude/skills/youtube-api-expert`.
- Analytics raw data remains VT-SYNC-owned; consumer parity remains analytics-canon-owned.
- Brain evidence and user-control surfaces remain current Brain owners.
- Account/auth/billing stay server-authoritative.
- Main is production; execution uses feature branch → PR → preview → deliberate merge.

## Validation
Run `node scripts/validate-crown-exchange.mjs` from the repo root. Validation checks mission existence, acceptance criteria, authorization objects, work-order checkout/base/head identity, conflicting exact-path writers, receipt status vocabulary and cross-record mission references.

## Promotion criteria for Phase 3
Phase 2 is ready to promote only when:
- at least one mission in each core domain can be represented without schema changes;
- every work order identifies real owners and rollback;
- verification receipts distinguish unit/build/preview/production evidence;
- no Crown record is required by application runtime;
- Task Index and Master Index integrations can be implemented as readers first.
