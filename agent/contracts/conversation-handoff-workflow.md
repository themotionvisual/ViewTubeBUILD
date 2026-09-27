# ViewTube Conversation Handoff & Work Reconciliation Workflow

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27  
**Status:** ACTIVE

Canonical specification: `docs/governance/CONVERSATION_HANDOFFS.md`.

## Handoff flow

```text
DETECT CONTEXT PRESSURE / HANDOFF NEED
→ CAPTURE CURRENT REPO + GOAL
→ INVENTORY CONVERSATION WORK
→ WRITE handoff.md
→ WRITE worklog.json
→ VERIFY PATHS / BRANCH / PR / EVIDENCE
→ GIVE EXACT NEXT ACTION
→ CONTINUE IN NEW CONVERSATION
```

## Reconciliation flow

```text
OPEN INTAKE PACKAGE
→ AUDIT CURRENT MAIN
→ SEARCH TASK INDEX / PROGRAM / CAPABILITIES / DOMAIN DOCS
→ SEARCH RELATED PLANS / HANDOFFS / PRs
→ VALUE + CATEGORIZE EACH ITEM
→ DEDUPE / GROUP SIMILAR WORK
→ PROMOTE / MERGE / ROUTE
→ RECORD TARGETS
→ VERIFY NO ITEM IS UNACCOUNTED
→ MARK RECONCILED
```

## Required storage

```text
tasks/conversation-intake/<conversation-id>/
  handoff.md
  worklog.json
  review.md
```

## Safety boundary

The intake package may faithfully say what a conversation planned or believed was completed.

It may **not**:
- mark a Task Index item DONE;
- replace current-main verification;
- create a second backlog;
- override Product Architecture or Domain Authorities;
- make a prototype production;
- treat a plan as implementation evidence.

## Review requirement

Every work item must eventually have:
- current-main relationship;
- value assessment;
- primary disposition;
- canonical target or explicit no-action/reject/archive result.

A conversation package with unresolved items remains open.
