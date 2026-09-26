# ViewTube Task Authority

**Production Date:** 2026-09-26  
**Last Edited:** 2026-09-26  
**Class:** CONSTITUTION  
**Status:** ACTIVE  
**Concern:** canonical task identity, work-state mutation, evidence-gated completion and task reconciliation  
**Owner:** Task Authority  
**Registry ID:** DOC-GOV-TASK-AUTHORITY  
**Last Audited Main SHA:** e657cefe83f3f66d5a8316543814d9d18197b338  
**Supersedes:** informal task-mutation rules distributed through Herald/Crown after migration certification  
**Related Authorities:** docs/governance/CROWN.md; docs/governance/CONVERSATION_OS.md; docs/governance/VERIFICATION.md; docs/governance/WORK_OBJECTS.md

## Purpose

Task Authority is the only governed interface allowed to commit canonical Task Index identity and lifecycle state.

Agents, conversations, Crown missions, CI and reviewers may propose mutations and append evidence/receipts where authorized. They do not create competing task ledgers.

## Identity rules

- permanent canonical IDs use the VT task identity namespace;
- imported historical IDs and program IDs become aliases rather than replacements;
- once referenced, a task ID is never reused;
- duplicate or superseded tasks retain history and explicit relationships;
- Task deletion is exceptional; prefer REJECTED, SUPERSEDED, DUPLICATE or archived historical projection.

## Task vs Capability

Capability = durable ability ViewTube possesses.
Task = exact governed work that changes, verifies, migrates, fixes or documents a capability/system.

A task may affect many domains/surfaces but has one canonical work identity.

## Task type

Controlled kinds:
- FEATURE
- INTEGRATION
- BUG
- OPTIMIZATION
- MIGRATION
- REFACTOR
- CERTIFICATION
- DOCUMENTATION
- RESEARCH
- IDEA
- DONOR
- CLEANUP
- RELEASE

Decisions, receipts, conversations and evidence are separate object classes.

## Lifecycle

IDEA → CANDIDATE → ACCEPTED → PLANNED → READY → IN_PROGRESS → VERIFYING → DONE

Side/terminal states:
- DEFERRED
- REJECTED
- SUPERSEDED

BLOCKED, URGENT and NEEDS_DEBUGGING are not lifecycle states.

## Health flags

Zero or more:
- BLOCKED
- NEEDS_DEBUGGING
- NEEDS_CLARIFICATION
- AT_RISK
- STALE

No health flags means clear; health does not replace lifecycle.

## Priority

P0 · P1 · P2 · P3 · P4

Quick Win is a separate boolean/tag, not a lifecycle state.

## Maturity axes

Use:
- architecture
- backend
- frontend
- integration
- tests
- runtime
- responsive
- documentation
- release

Each:
NONE · PLANNED · PARTIAL · IMPLEMENTED · VERIFIED · NOT_APPLICABLE

Do not convert these into an authoritative single completion percentage.

## Acceptance gate

Meaningful implementation work cannot enter READY without objective acceptance criteria.

Acceptance criteria must describe observable success, not implementation activity.

## Evidence

Evidence proves only the claim it actually observes.

Common evidence types:
- CURRENT_MAIN_CODE
- TEST
- BUILD
- RUNTIME
- AUTHENTICATED_RUNTIME
- SCREENSHOT_ANALYSIS
- PR
- DEPLOYMENT
- USER_DECISION
- ARTIFACT
- CANONICAL_DOCUMENT
- GIT_HISTORY

Assessment:
- PROVEN
- SUPPORTED
- CLAIMED
- UNKNOWN
- CONTRADICTED

A commit proves code existence/merge history. A build proves buildability. A screenshot proves only what is actually visible in that capture. Authenticated external behavior requires appropriate external/runtime evidence.

## DONE

DONE means:
1. required acceptance criteria are satisfied;
2. required task-specific verification gates passed;
3. evidence supports those claims;
4. no mandatory unresolved blocker remains;
5. canonical owner and identity relationships are intact.

Code existing is insufficient.
A passing build is insufficient for a user-visible workflow.
Merged is not the same as DONE.
IMPLEMENTED may remain VERIFYING until runtime/visual/integration evidence is complete.

## Candidate allocation

Before allocating a new permanent task identity:
1. search existing Task Index;
2. reconcile Product Architecture capabilities;
3. inspect current main;
4. inspect Domain Authority;
5. inspect active Mission/PR;
6. inspect donor/prototype/reference sources;
7. classify as NEW, CONTINUATION, DUPLICATE, SUPERSEDES, EXPANDS, BUG_IN_EXISTING or VERIFICATION_ONLY;
8. define owner and acceptance;
9. only then allocate a permanent ID.

Ideas discovered during implementation become candidates first, not automatic tasks.

## Mutation protocol

Agents submit a mutation proposal containing:
- proposalId;
- taskId or candidate identity;
- requested field changes;
- reason;
- evidence/receipt refs;
- source conversation/mission/PR;
- confidence;
- whether creator review is required.

Task Authority validates:
- identity;
- duplicate/supersession relationships;
- owner;
- lifecycle transition;
- acceptance/evidence;
- consequential decision boundary;
- history append.

Canonical mutations receive a history entry.

## Automatic transitions

Task Authority may perform deterministic bookkeeping when configured evidence clearly satisfies a safe rule, for example:
- merged PR adds MERGED evidence;
- successful required CI adds test/build evidence;
- deterministic verification profile completion may move IN_PROGRESS → VERIFYING or VERIFYING → DONE when no human/product decision remains.

It must escalate:
- ambiguous evidence;
- conflicting owner;
- destructive merge/supersession;
- consequential product acceptance;
- external permission/billing/publishing decisions;
- architectural conflict.

## Relationships

Supported typed relationships include:
- parent / child
- requires
- blocks
- relatedTo
- duplicateOf
- mergedInto
- supersedes / supersededBy
- splitFrom
- implementsCapability
- verifies
- discoveredBy
- derivedFrom

## Current Task Index migration

Until Task Index VNext structured storage is fully established:
- resolve the actual current canonical Task Index path before any mutation;
- never guess a task status from memory or conversation;
- the Crown task/artifact bridge remains read-only;
- the old HTML/legacy task corpus is donor/import source and identity history;
- historic status imported into VNext requires reconciliation against current code/evidence.

## History

Canonical task identity/history must survive UI rewrites, task merges, renames and archive compaction.

One task record; many projections.
