# Authority and Freshness

## Authority hierarchy

1. Current code/tests/runtime for what actually exists.
2. Canonical bounded authority for intended ownership/contracts.
3. Living AI Systems master for cross-system status/orientation.
4. Active plans/tasks for unfinished work.
5. Historical/donor documents for provenance only.

## Required metadata

Current authority records should expose:
- canonical owner;
- bounded concern;
- lifecycle;
- created/updated time;
- lastAuditedAt;
- lastAuditedMainSha;
- supersedes/supersededBy;
- related authorities.

## Freshness rule

A document can be structurally correct but stale. Never present branch/PR/status assertions as current unless checked against an exact main SHA.

## Supersession rule

Do not delete a historical document before:
- inbound reference scan;
- unique information extraction;
- successor identified;
- links updated;
- archive/retention decision recorded.

## Generated documentation

Generated summaries are materialized views. They may not silently become canonical authority.

If generated state disagrees with current code or a bounded authority, mark the conflict and re-audit.
