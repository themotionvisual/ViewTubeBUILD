---
name: viewtube-task-authority
description: Validate and commit canonical ViewTube task identity/lifecycle mutations from agent, Crown, CI or conversation proposals. Use for task creation, dedupe/merge/supersession, evidence-gated status changes, aliases, completion review and Task Index reconciliation.
---

# ViewTube Task Authority

Authority:
- docs/governance/TASK_AUTHORITY.md
- docs/governance/VERIFICATION.md

## Rule

This is the only skill permitted to perform a canonical task-state mutation once the active Task Index storage/path has been positively resolved.

Until Task Index VNext structured storage lands, default to read/reconcile/propose unless the canonical current Task Index writer path is explicitly known and safe.

## Mutation sequence

1. RESOLVE active canonical Task Index.
2. LOAD current task/candidate and history.
3. DEDUPE against existing tasks/capabilities/current main.
4. VALIDATE canonical owner.
5. VALIDATE requested lifecycle transition.
6. VALIDATE acceptance criteria.
7. VALIDATE evidence/verification gates.
8. CHECK creator-decision boundary.
9. APPLY one canonical mutation.
10. APPEND history.
11. RETURN receipt + next action.

## New task

Allocate a permanent ID only after prior-art reconciliation confirms separate work is warranted. Preserve historical aliases; never recycle IDs.

## DONE review

Require acceptance + task-specific evidence. A merge/build alone is not enough where runtime/visual/authenticated/integration evidence is required.

## Inputs

Prefer `viewtube.task-mutation-proposal.v1` records from `agent/contracts/conversation-os.schema.json`.

## Do not

- infer status from a conversation;
- trust old task status without current reconciliation;
- erase duplicate/superseded identities;
- auto-promote ambiguous product decisions;
- mutate tasks from the Crown read-only bridge.
