# Convergence Governance Registry

This directory contains machine-readable projections governed by `docs/governance/CONVERGENCE.md`.

## Files

- `convergence.schema.json` — record definitions.
- `capability-homes.json` — capability home-page routing metadata.
- `plan-families.json` — related-plan family survivors.
- `plan-merges.json` — no-loss plan merge records.
- `code-ownership.json` — capability → source/test ownership map.
- `open-questions.json` — unresolved questions that are not yet tasks.
- `workflows.json` — reusable development workflows.
- `skill-workflow-map.json` — workflow → skill routing.
- `improvements.json` — proactive recommendation log.
- `capability-coverage.json` — diagnostic capability coverage projection.
- `control-room.json` — generated development control-room snapshot.

## Authority boundary

These are routing/audit registries.

They do not replace:
- Product Architecture;
- Domain Authorities;
- Task Index;
- Crown/Royal Exchange;
- current code/tests/runtime.

## Commands

```bash
npm run test:convergence-governance
npm run audit:convergence
npm run generate:ideas-master
npm run generate:convergence-control-room
```
