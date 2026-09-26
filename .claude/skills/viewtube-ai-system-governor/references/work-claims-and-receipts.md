> **MIGRATION NOTE — 2026-09-26:** This file is historical donor guidance. New repository work claims/status use Task Authority; mission/work-order/receipt coordination uses Crown/Royal Exchange; conversation continuity uses Conversation OS.

# Work Claims and Receipts

## Claim format

```yaml
taskId: VT-AI-###
status: claimed
agent: <agent/session>
intent: <bounded goal>
canonicalOwner: <owner>
observedMainSha: <sha>
branch: <branch-or-null>
filesExpected: []
dependencies: []
risk: low|medium|high
startedAt: <ISO>
nextCheckpoint: <verification milestone>
```

## Claim rules

- One active owner for a high-conflict architecture seam unless coordination is explicit.
- A claim is coordination metadata, not proof.
- Release claims on completion, cancellation, supersession or handoff.
- A blocked claim must name the blocker and next action.
- Herald is superseded donor/compatibility material; do not create new Herald work-state authority.

## Finished-work receipt

```yaml
taskId: VT-AI-###
status: completed
agent: <agent/session>
observedMainSha: <sha>
branch: <branch>
headSha: <sha>
prs: []
filesChanged: []
systemsChanged: []
tests: []
runtimeEvidence: []
decisions: []
newDebt: []
followUps: []
mainIntegrationState: absent|partial|present|equivalent|unknown
completedAt: <ISO>
```

## Proof hierarchy

Self-report is CLAIMED.
Git diff/commit/PR proves branch implementation.
Ancestry/current-code verification proves main integration.
Tests/CI prove tested state.
Runtime/visual evidence proves observed behavior.

Never collapse these levels into “done.”
