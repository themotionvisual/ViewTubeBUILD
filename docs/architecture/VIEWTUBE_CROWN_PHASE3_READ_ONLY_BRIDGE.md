# ViewTube Crown Phase 3 — Read-Only Task + Artifact Bridge

## Goal
Make Crown records useful beside the Task Index and artifact/document system without allowing Crown to become a second task database or to silently mutate canonical status.

## Source-of-truth split
- Task Index answers: what work exists and what lifecycle state is canonical.
- Royal Exchange answers: what mission, work order, decision, handoff, conflict and verification evidence belongs to that work.
- Artifact records answer: which plans, demos, reports, screenshots or code references are relevant, where they came from and whether they are canonical, recovery, prototype or reference material.
- Repository and runtime receipts answer: what is actually implemented and verified.

## Phase 3 reader contract
The first bridge is read-only. It may:
1. scan `.viewtube/exchange/**/*.json`;
2. group records by `missionId` and `taskIds`;
3. inspect an explicitly supplied Task Index path when available;
4. report missing task references and orphan records;
5. emit a JSON/console dossier for humans and future UI readers.

It must not:
- rewrite Task Index status;
- move, rename or delete artifacts;
- edit Brain memory;
- invoke deployment or external services;
- infer completion from a commit or artifact alone.

## Task dossier shape
For each task or mission, expose:
- objective and non-goals;
- canonical owners;
- decisions and conflicts;
- work orders and writer scopes;
- artifact records;
- receipts and limitations;
- release/deployment evidence when present;
- unresolved blockers and next verification action.

## Integration strategy
1. Keep the reader in `scripts/` first.
2. Treat Task Index path as optional/configurable because repository and workspace copies may differ.
3. Do not couple application runtime to `.viewtube/exchange`.
4. After the read-only contract stabilizes, expose the same dossier through a builder-facing Crown Control Room.
5. Only after explicit tests and user approval should Task Authority gain a separate, narrowly-scoped write path.

## Promotion gate
Phase 3 is complete when a real `vt-####` task can be resolved to its related Crown mission, artifact and verification evidence without mutating either source.
