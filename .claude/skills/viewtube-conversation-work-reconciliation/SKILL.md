---
name: viewtube-conversation-work-reconciliation
description: Review a ViewTube conversation intake package and reconcile every planned, completed, partial, blocked, abandoned or discovered work item against current code, Task Index, Integrated Application Program, Product Architecture, Domain Authorities, existing plans/handoffs and active PRs; value, dedupe, combine and route the work into canonical destinations.
---

# ViewTube Conversation Work Reconciliation

Authority:
- `docs/governance/CONVERSATION_HANDOFFS.md`
- `docs/governance/TASK_AUTHORITY.md`
- `docs/programs/INTEGRATED_APPLICATION.md`
- `docs/governance/DOCUMENTATION.md`

Input:
- `tasks/conversation-intake/<conversation-id>/handoff.md`
- `tasks/conversation-intake/<conversation-id>/worklog.json`

Output:
- updated `worklog.json`
- `review.md`
- governed target updates/proposals where warranted

## Procedure

For every work item:

1. PROVE CURRENT STATE
   Inspect current main when implementation/completion is claimed.

2. SEARCH PRIOR ART
   - Capability home + `governance/convergence/plan-families.json`;
   - `ideas/registry.json`;
   - code ownership / open questions / improvement recommendations when relevant;
   - Task Index / Task Authority;
   - Integrated Application Program;
   - Product Architecture / Capability Registry;
   - Domain Authority / Specification;
   - plans, audits, handoffs and other conversation-intake packages;
   - active missions/branches/PRs;
   - Master Sources / donor artifacts when relevant.

3. CLASSIFY RELATIONSHIP
   NEW | CONTINUATION | ALREADY_TRACKED | DUPLICATE | OVERLAPS | EXPANDS | SUPERSEDES | BUG_IN_EXISTING | VERIFICATION_ONLY | COMPLETED_ALREADY | DONOR_ONLY

4. VALUE
   Record creator impact, system leverage, urgency, reuse potential, confidence, estimated effort and implementation risk.

5. FIND SIMILAR WORK
   Group items by capability/system/page/widget/tool/process and semantic similarity.
   Prefer merging into an existing survivor.

6. ROUTE
   Select one primary disposition:
   - already tracked;
   - merge existing task;
   - Task Candidate;
   - Integrated Application Program update;
   - Product Architecture update;
   - Domain Authority / Specification update;
   - existing plan update;
   - plan-family consolidation;
   - new plan only if justified;
   - Decision;
   - Opportunity;
   - Risk;
   - Receipt/Evidence;
   - Donor archive;
   - no action;
   - reject.

7. HARVEST UNIQUE MATERIAL
   Preserve requirements, code references, acceptance criteria, UI ideas, verification notes and decisions before superseding/merging sources.

8. RECORD TARGETS
   Every reconciled item gets target refs or an explicit no-action/reject/archive rationale.

9. REVIEW COMPLETED WORK
   Completed conversation work may prove implementation/evidence or reveal missing integration/documentation. Route it; do not ignore it.

10. CLOSE
   Mark the package RECONCILED only when every item has a disposition.

## Plan-family rule

If multiple plans/conversations cover the same feature/process/tool/widget/page/system:
- select one surviving current plan/authority;
- merge unique useful material;
- link shared Task IDs;
- demote superseded plans to donor/history after no-loss checks;
- update Integrated Application Program if cross-system.

## Do not

- create one task per sentence;
- trust conversation completion claims without evidence;
- preserve duplicate plans just because their titles differ;
- promote low-confidence brainstorms directly into committed work;
- delete source material before unique-content accounting.


## Convergence action

When conversation work overlaps an existing feature/tool/system/process, select:
`EXTEND → COMBINE → MERGE → GENERALIZE → ADAPT → CREATE_REVIEW`.

Record plan-family survivor and Plan Merge record for nontrivial consolidation.
