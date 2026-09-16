---
name: viewtube-conflict-arbiter
description: Resolve ViewTube ownership, plan-vs-code, and cross-agent conflicts without allowing scope or permission drift.
---

# CROWN CONFLICT ARBITER

Use when two ViewTube roles recommend incompatible actions or ownership is unclear.

## Evidence priority
1. Explicit current user instruction.
2. Verified runtime/test evidence.
3. Current main canonical owner.
4. Accepted ADR or migration reference.
5. Current Task Index evidence.
6. Active recovery branch or prototype.
7. Historical artifact or conversation.
8. Inference.

## Levels
- L0 Knight to Knight: resolve from canonical owner and acceptance criteria.
- L1 Knight to Marshal: Marshal determines operational constraint while the Knight records product impact.
- L2 Prince to Marshal: KING and EMPEROR reconcile desired state with executable state.
- L3 KING to EMPEROR: unresolved consequential product or permission decisions return to the creator.

## Output
Create a VT_DECISION record with question, competing proposals, evidence, canonical owner, recommendation, alternatives, risk, reversibility and decision state.

Never resolve a conflict by silently widening authorization, replacing unrelated files, or treating a demo as production.
