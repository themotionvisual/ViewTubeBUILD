# ViewTube Task Index VNext

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Role:** Canonical Work & Evidence Ledger  
**Authority:** `tasks/index/index.json` + `tasks/index/shards/*.json` + `docs/governance/TASK_AUTHORITY.md`

## Canonical storage

- `index.json` — manifest, next ID, shard map, migration state and source identity.
- `shards/*.json` — permanent task identity and current canonical task state, partitioned by module for low-conflict multi-agent edits.
- `aliases.json` — legacy aliases resolving to canonical VT IDs.
- `evidence.jsonl` — append-only task evidence.
- `history.jsonl` — append-only canonical mutation/import history.
- `imports/legacy-import.json` — donor provenance and comparison.
- `generated/AGENT_CONTEXT.md` — low-token read-only agent projection.

Generated files are projections and must never be edited as task authority.

## Legacy migration

`ViewTube-Task-Index(5).html` is the migration donor because it is a strict identity superset of the August 28 canonical donor: 1,542 tasks versus 1,297, with 245 newer identities, zero older identities lost, and nine common task records changed. Those differences are recorded in the import manifest.

All imported historical statuses remain `CLAIMED`. Imported tasks have `lifecycle: null`, `reconciliationRequired: true`, and a `RECONCILE` next action until Task Authority verifies current evidence.

## Mutation boundary

Conversation OS, Crown, CI, agents and humans may submit task-mutation proposals. Only Task Authority commits canonical identity/lifecycle changes. DONE requires acceptance criteria plus PROVEN task-specific verification evidence.
