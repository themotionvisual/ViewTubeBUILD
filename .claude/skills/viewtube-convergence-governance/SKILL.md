---
name: viewtube-convergence-governance
description: Route new ViewTube ideas, plans, features, functions, tools, code changes, debugging work and workflows into existing capabilities/plan families; detect overlap; enforce prior-art checks; consolidate plans; maintain capability homes, ownership, questions, coverage, workflows and improvement registries.
---

# ViewTube Convergence Governance

Authority:
- `docs/governance/CONVERGENCE.md`

Required context:
- `docs/architecture/capabilities.json`
- `governance/convergence/capability-homes.json`
- `governance/convergence/plan-families.json`
- `ideas/registry.json`
- `governance/convergence/code-ownership.json`
- Task Authority / Integrated Application / owning Domain Authority

## Core rule

Before creating a new system/plan/tool/service/page/store/workflow:

`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`

## Procedure

1. RESOLVE one or more capability IDs.
2. OPEN the capability home(s).
3. CHECK the owning authority and plan family.
4. COMPLETE Existing Work Checked.
5. SEARCH Task Index, active PRs/branches/missions, conversation intake and Ideas Registry.
6. RUN similarity review for likely plan/idea matches.
7. CLASSIFY NEW / CONTINUATION / ALREADY_TRACKED / DUPLICATE / OVERLAPS / EXPANDS / SUPERSEDES / BUG / VERIFICATION.
8. CHOOSE convergence action.
9. If merging plans, write/update a PLAN-MERGE record and preserve unique material.
10. If accepted implementation is needed, route to Task Authority.
11. Update capability home/coverage/ownership/workflow relationships when durable.
12. Verify and record.

## Automatic similarity

Use `scripts/governance/convergence.mjs` or `find-similar-records.mjs`.

Similarity is a recommendation signal, not automatic deletion/merge permission.

## Plan creation gate

A new plan must contain:
- capability IDs;
- plan-family decision;
- Existing Work Checked;
- prior-art verdict;
- convergence decision;
- authority boundary;
- objective acceptance criteria.

Use the template in `templates/plan-template.md`.

## Open questions

Questions requiring research or creator/architecture judgment belong in `governance/convergence/open-questions.json`, not Task Index, until accepted resolution work exists.

## Improvements

Proactive recommendations go to `governance/convergence/improvements.json` and are deduped against Ideas Registry / plan families before task promotion.

## Control room

Generate:
- `npm run generate:convergence-control-room`

The projection never becomes a second database.
