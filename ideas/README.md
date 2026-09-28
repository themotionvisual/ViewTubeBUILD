# ViewTube Ideas Library

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Registry schema:** `viewtube.ideas-registry.v2`

This folder is the governed home for brainstorm/feature/tool/system/process ideas from conversations, audits, research, documents and agents.

## Structure

```text
ideas/
├── README.md
├── registry.json
├── MASTER_IDEAS.md
├── CONSOLIDATION_REPORT.md
├── reviews/
│   └── <dated semantic review manifests>
└── lists/
    ├── README.md
    ├── governance/
    ├── product/
    ├── ui-ux/
    ├── ai/
    ├── analytics/
    ├── editor-video/
    ├── workflows/
    └── infrastructure/
```

## Three layers

1. **Source lists** — immutable provenance. Original brainstorming may overlap, conflict or contain sub-features.
2. **Atomic source items + reviewed master ideas** — `ideas/registry.json` maps every source item to exactly one active master idea or a named unresolved review state. Merged idea IDs remain reversible aliases.
3. **Master projection** — `ideas/MASTER_IDEAS.md` is generated from active master ideas and shows retained requirements/links without erasing source provenance.

`ideas/CONSOLIDATION_REPORT.md` records the latest full-library consolidation result. Review decisions live under `ideas/reviews/`.

## Intake + consolidation rule

New idea list → preserve source list → create stable source-item IDs → route capability/target → discover likely matches → **semantic review** → classify SAME_OBJECTIVE / COMPLEMENTARY / DEPENDENCY / CONFLICT / DISTINCT → merge only reviewed SAME_OBJECTIVE/compatible COMPLEMENTARY records → retain all requirements/provenance → regenerate Master Ideas → audit coverage.

Deterministic similarity is candidate discovery only. It never authorizes an automatic semantic merge.

Ideas do not become tasks automatically.

## Current full consolidation

Run `IDEA-REVIEW-RUN-2026-09-27-001` completed the first lossless whole-library review:

- 7 governed source lists;
- 254 atomic source items;
- 228 stable idea records;
- 190 active master ideas;
- 38 merged alias IDs retained for lineage;
- 25 reviewed merge groups;
- 27 keep-separate relationship decisions;
- 0 unresolved source items.

The run also imported the 25-item Video Asset Engine widget catalog and two explicit IDEA/CREATE_OPPORTUNITY conversation-intake records that were not previously represented as source items.

See `ideas/CONSOLIDATION_REPORT.md` and `ideas/reviews/2026-09-27-full-consolidation.json`.
