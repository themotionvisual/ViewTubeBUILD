---
name: viewtube-ideas-curator
description: Ingest ViewTube brainstorm/idea lists, preserve the original source list, normalize unique ideas, detect duplicates, route ideas to capabilities/tools/systems/features/functions, update the Master Ideas projection, and promote only reviewed ideas into plans/opportunities/tasks.
---

# ViewTube Ideas Curator

Authority:
- `docs/governance/CONVERGENCE.md`

Stores:
- source lists: `ideas/lists/**`
- normalized registry: `ideas/registry.json`
- consolidated projection: `ideas/MASTER_IDEAS.md`

## Intake

1. Preserve the original list under the closest `ideas/lists/<category>/`.
2. Give the source list a stable `IDEA-LIST-*` ID.
3. Extract individual ideas without rewriting away source meaning.
4. Assign category/subcategory.
5. Route to capability IDs.
6. Route target type + target ID: capability / Master Tool / system / feature / function / page / workflow / governance.
7. Search existing ideas for semantic similarity.
8. Merge duplicates in the normalized registry while preserving **all** source refs.
9. Keep speculative ideas separate from Task Index.
10. Regenerate `MASTER_IDEAS.md`.

## Promotion

An idea may become:
- ACCEPTED idea;
- plan-family input;
- improvement recommendation;
- opportunity/risk;
- decision candidate;
- Task Candidate through Task Authority.

Promotion never deletes its source-list provenance.

## Similarity

Use `scripts/governance/convergence.mjs`.

When two ideas overlap but each contains unique useful material, create one consolidated idea record and preserve both source IDs/refs.

## Master list

Run:
`npm run generate:ideas-master`

The generated master is grouped by category/subcategory and points to the target owner.
