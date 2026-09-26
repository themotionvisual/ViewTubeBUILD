# ViewTube Crown

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** CONSTITUTION  
**Status:** ACTIVE  
**Concern:** multi-agent mission coordination, execution routing, handoff and verification orchestration  
**Owner:** Crown  
**Registry ID:** DOC-GOV-CROWN  
**Last Audited Main SHA:** e657cefe83f3f66d5a8316543814d9d18197b338  
**Supersedes:** docs/architecture/VIEWTUBE_CROWN_INTEGRATION_SYSTEM.md after migration certification  
**Related Authorities:** docs/governance/CONVERSATION_OS.md; docs/governance/TASK_AUTHORITY.md; docs/governance/VERIFICATION.md; .viewtube/exchange/README.md

## Purpose

Crown coordinates substantial ViewTube work across product intent, engineering execution, verification and handoff. It is not the Task Index, Product Architecture, Domain Authority, Brain memory, analytics store or implementation truth.

## Stable roles

### KING — Product Architecture Coordinator
Owns desired-state coordination:
- creator intent and mission meaning;
- Product Completion Constitution and Product Architecture alignment;
- capability acceptance;
- UX/design intent;
- acceptance criteria;
- product tradeoffs and consequential product decisions.

KING does not declare implementation complete.

### EMPEROR — Engineering Coordinator
Owns executable-state coordination:
- current repository truth and ownership discovery;
- work-order routing;
- branch/PR execution;
- technical dependencies;
- tests, runtime, deployment and release evidence;
- writer-scope scheduling.

EMPEROR does not redefine product architecture or task status.

### TASK AUTHORITY
Owns canonical task identity, lifecycle mutation, merge/supersession and evidence-gated work state under docs/governance/TASK_AUTHORITY.md.

### ARCHIVIST
Owns documentation lineage, consolidation, registry hygiene, Removed Archive and durable decision/document placement under docs/governance/DOCUMENTATION.md.

### VERIFIER
Independently evaluates acceptance criteria, tests, runtime behavior, screenshots, responsive states, integrations and receipts under docs/governance/VERIFICATION.md.

### DOMAIN SPECIALISTS
Implement or review bounded work using the current Domain Authority and repository owner.

### CREATOR
Final authority for unresolved consequential product decisions, external permissions, billing, publishing, destructive/irreversible actions and materially conflicting goals.

## When a Mission is required

Create a VT_MISSION when work involves one or more of:
- repository implementation across multiple files;
- one or more Task Index records;
- architecture/product decisions;
- a branch or PR;
- more than one canonical owner;
- multi-agent execution;
- substantial audit/recovery/migration;
- implementation plus runtime/visual/integration verification.

Do not create a Mission for casual explanation, tiny factual lookup or unaccepted brainstorming.

## Crown lifecycle

DISCOVER → SYNTHESIZE → DECIDE → PLAN EXECUTION → EXECUTE → VERIFY → LEARN / ARCHIVE

1. DISCOVER — resolve current authorities, tasks, code, prior attempts, Master Sources and active work.
2. SYNTHESIZE — build the smallest mission dossier needed to act without rereading the whole history.
3. DECIDE — resolve product intent, acceptance, owner boundaries and consequential choices.
4. PLAN EXECUTION — EMPEROR creates an executable work order tied to a real base/head and writer scope.
5. EXECUTE — the narrowest current specialist/skill performs the work.
6. VERIFY — apply the task-specific verification profile; implementation alone is not completion.
7. LEARN / ARCHIVE — record decisions, receipts, artifacts and durable documentation; Task Authority evaluates supported status changes.

## Royal Exchange

Royal Exchange remains the coordination/provenance bus for:
- VT_MISSION
- VT_WORK_ORDER
- VT_DECISION
- VT_RECEIPT
- VT_ARTIFACT_RECORD
- handoffs
- conflicts

It does not duplicate Task Index state or Domain Authority content.

Task != Mission != PR != Conversation != Receipt.

## Writer leases

A work order may carry soft writer leases:

```yaml
missionId: VT-MISSION-...
paths:
  - src/features/editor/**
owner: editor-specialist
expiresAt: 2026-09-26T22:00:00Z
```

Rules:
- one active writer per exact path/scope when practical;
- leases expire automatically;
- stale leases may be broken with a recorded reason;
- non-overlapping work continues in parallel;
- leases coordinate writers but never create permanent ownership.

## Branch and PR rules

- main is production;
- substantial implementation uses a short-lived feature branch;
- Mission links its branches and PRs;
- merge proves code reached the target branch, not that runtime acceptance passed;
- merged work normally moves toward VERIFYING, not automatically DONE;
- deployment evidence is separate from merge evidence.

## Conflict routing

- LOCAL — resolve from current owner/contracts.
- ARCHITECTURAL — KING + EMPEROR reconcile product intent and executable constraint.
- PRODUCT — creator decision when unresolved.
- SAFETY / PERMISSION / EXTERNAL SIDE EFFECT — creator or existing authorization owner decides.

Unrelated safe work should continue when separable.

## Completion

A Crown mission may report complete only when its acceptance criteria have corresponding receipts. Canonical task DONE remains a Task Authority decision.

## Visibility rule

Crown ceremony is primarily machine/internal coordination. User-facing conversations should remain natural. Do not force royal role names, twelve-block reports or protocol vocabulary into ordinary responses unless that detail helps the user.
