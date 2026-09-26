---
name: viewtube-document-consolidation
description: Losslessly consolidate families of ViewTube documents, plans, audits, standalone HTML files, prototypes or skill versions while preserving every source and accounting for unique text, code, behavior, references, decisions and tasks.
---

# ViewTube Document Consolidation

Parent skill: .claude/skills/viewtube-document-system/SKILL.md

## Mandatory reads
- docs/governance/DOCUMENTATION.md
- docs/governance/consolidation-manifest.schema.json
- archive/removed/README.md
- parent reference: .claude/skills/viewtube-document-system/references/consolidation-and-archive.md

## Procedure
1. DISCOVER the whole version family across repo/Library/known donors.
2. HASH and inventory each source and provenance.
3. EXTRACT unique text, code, CSS, JS, JSON/data, comments, hidden instructions, references, tasks, decisions, media pointers, persistence and interaction behavior.
4. COMPARE semantics; newest is not automatically best.
5. CLASSIFY every unique contribution as CURRENT, DURABLE, TASK, DECISION, REFERENCE, DONOR, HISTORICAL, SUPERSEDED, or CONFLICT.
6. BUILD the surviving authority/reference/artifact from the best compatible contributions.
7. ROUTE unfinished work to Task Index and durable choices to decisions/authorities.
8. WRITE a consolidation manifest accounting for every unique contribution.
9. PRESERVE source originals under archive/removed without rewriting them.
10. UPDATE registry, supersession and archive index.
11. VERIFY inbound references, no-loss accounting, current-main compatibility and—when HTML/UI code is consolidated—runtime/interaction/screenshot behavior.
12. RECORD the resulting receipt and remaining conflicts.

## Rule
A consolidation cannot be complete while any unique source contribution is unaccounted for.
