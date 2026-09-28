---
name: viewtube-ideas-curator
description: Ingest ViewTube brainstorm/idea lists, preserve atomic source provenance, discover semantic overlaps, review merge/split/keep decisions, maintain lossless master ideas, and promote only reviewed ideas into plans/opportunities/tasks.
---

# ViewTube Ideas Curator

Authority:
- `docs/governance/CONVERGENCE.md`

Stores:
- source lists: `ideas/lists/**`
- normalized registry + source-item mappings: `ideas/registry.json`
- semantic review manifests: `ideas/reviews/**`
- consolidated projection: `ideas/MASTER_IDEAS.md`
- latest consolidation receipt/report: `ideas/CONSOLIDATION_REPORT.md`

## Intake

1. Preserve the original list under the closest `ideas/lists/<category>/`.
2. Give the source list a stable `IDEA-LIST-*` ID.
3. Give every atomic source item a stable `IDEA-SRC-*` ID and exact source reference.
4. Extract creator/development goal, proposed behavior, constraints and useful requirements without rewriting away source meaning.
5. Route to capability IDs and target owner/type.
6. Search active master ideas for likely semantic matches.
7. Use deterministic similarity only to surface candidates.
8. Explicitly classify candidate relationships as `SAME_OBJECTIVE`, `COMPLEMENTARY`, `DEPENDENCY`, `CONFLICT`, or `DISTINCT`.
9. Merge only reviewed SAME_OBJECTIVE or compatible COMPLEMENTARY candidates.
10. Preserve donor idea IDs as `lifecycle: MERGED` aliases with `mergedInto`; never delete lineage.
11. Map every retained requirement to one or more source-item IDs.
12. Keep speculative ideas separate from Task Index.
13. Regenerate `MASTER_IDEAS.md` and run the convergence audit.

## Merge review

Before a semantic merge:
- state the shared objective;
- compare owner, lifecycle stage, audience and output;
- enumerate distinct requirements from every source;
- preserve alternatives/conflicts instead of flattening them;
- verify the capability/plan-family owner;
- record rationale, reviewer, date and reversible lineage.

A tool and a workflow using that tool are usually `COMPLEMENTARY` or `DEPENDENCY`, not automatic duplicates. Provider-specific integration and canonical platform owner are likewise normally linked rather than merged.

## Promotion

A reviewed master idea may become:
- ACCEPTED idea;
- plan-family input;
- improvement recommendation;
- opportunity/risk;
- decision candidate;
- Task Candidate through Task Authority.

Promotion never deletes source-list provenance and never treats a consolidated idea as implementation proof.

## Commands

- Generate master: `npm run generate:ideas-master`
- Structural/lossless audit: `npm run audit:convergence`
- Candidate grouping helper: `npm run consolidate:ideas -- --input ideas/registry.json`

The grouping helper is advisory only. Review manifests are authoritative for semantic merge decisions.
