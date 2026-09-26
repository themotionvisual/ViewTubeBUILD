---
name: viewtube-crown
description: Coordinate substantial ViewTube missions across product intent, engineering execution, Task Authority, verification and handoff without creating competing product/task/domain truth.
---

# ViewTube Crown

Canonical authority:
- docs/governance/CROWN.md

Required related authorities:
- docs/governance/CONVERSATION_OS.md
- docs/governance/TASK_AUTHORITY.md
- docs/governance/VERIFICATION.md
- docs/governance/DOCUMENTATION.md

## Roles
- KING: desired-state/product architecture coordination.
- EMPEROR: executable-state/repository coordination.
- TASK AUTHORITY: canonical work-state mutation.
- ARCHIVIST: documentation/lineage.
- VERIFIER: independent completion evidence.
- DOMAIN SPECIALISTS: bounded execution/review.
- CREATOR: consequential product/permission/billing/publishing/irreversible decisions.

## Required sequence
1. ORIENT through Conversation OS and current repo state.
2. Reconcile existing capabilities/tasks/missions/prior work.
3. Create VT_MISSION only when the mission threshold in docs/governance/CROWN.md is met.
4. Resolve canonical owners and acceptance.
5. Create an executable VT_WORK_ORDER tied to a real base/head.
6. Assign non-overlapping writer scopes; use expiring writer leases when coordination benefits.
7. Execute through current domain skills/owners.
8. Verify under docs/governance/VERIFICATION.md.
9. Emit VT_RECEIPT / decisions / artifacts / handoffs as appropriate.
10. Submit any task-state change to viewtube-task-authority.

## Do not
- turn Crown into Task Index;
- let a Mission or PR imply DONE;
- invent new product/domain owners;
- require royal terminology in normal user replies;
- maintain a second conversation ledger.
