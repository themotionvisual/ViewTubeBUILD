# ViewTube Conversation Intake

**Production Date:** 2026-09-27  
**Last Edited:** 2026-09-27

This directory is the governed staging/provenance workspace for long-conversation handoffs and work reconciliation.

It is **not** Task Index and does not own canonical work status.

## Per-conversation structure

```text
tasks/conversation-intake/<conversation-id>/
├── handoff.md
├── worklog.json
└── review.md
```

### handoff.md
Compact continuation package for the next conversation/agent.

### worklog.json
Comprehensive inventory of planned, started, partial, completed, blocked, abandoned and discovered work from the conversation.

### review.md
Human/agent reconciliation report showing how each work item was valued, deduplicated and routed.

## Lifecycle

```text
OPEN CONVERSATION
→ HANDOFF CREATED
→ WORK LOG CAPTURED
→ REVIEWING
→ PARTIALLY RECONCILED
→ RECONCILED
→ RETAIN / ARCHIVE
```

## Closure

A package is reconciled only when every work item has a disposition and canonical target or explicit no-action/reject/archive result.

Use:
- `.claude/skills/viewtube-conversation-handoff/SKILL.md`
- `.claude/skills/viewtube-conversation-work-reconciliation/SKILL.md`
- `docs/governance/CONVERSATION_HANDOFFS.md`
