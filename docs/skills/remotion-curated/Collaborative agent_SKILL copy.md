---
name: vt-e1-collaborative-agent-workflow
description: Multi-agent execution protocol for VT_E1: scoped ownership, contract-first parallelism, and deterministic integration.
---

# VT_E1 Collaborative Agent Workflow

Use this skill when:
- Splitting VT_E1 work across multiple agents.
- Running parallel architecture/UI/effects/testing tracks.
- Integrating outputs while preserving spec and intent contracts.

Primary references:
- `/Users/cwb/Downloads/viewtube/REMOTION_EDITOR_MASTER_SPEC.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VIEWTUBE_VIDEO_EDITOR_UNIFIED_INTENT.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VT_E1_MASTERPLAN_100_PLUS.md`

## Agent Skill Contract
Each agent task must define:
- `triggers`
- `requiredInputs`
- `invariants`
- `successChecks`

## Parallel Execution Pattern
1. **Architecture lane**: contracts + model changes.
2. **UX lane**: panel flow + interaction clarity.
3. **FX lane**: effect definitions + live preview.
4. **Diagnostics lane**: parity/perf verification.

Assign disjoint file ownership. Do not overlap write scopes unless explicitly coordinated.

## Integration Rules
- Merge only after contract checks pass.
- Resolve semantic conflicts via spec invariants, not preference.
- Preserve feature registry IDs and acceptance criteria traceability.
- Record which masterplan items moved `done/partial/next/later`.

## Anti-Drift Checklist
- No orphan UI without data contract.
- No data contract without validation path.
- No AI behavior outside apply-gate policy.
- No performance-sensitive feature without envelope notes.

## Success Checks
- All merged outputs map to specific feature IDs.
- Single vocabulary across spec/intent/masterplan remains intact.
- Verification evidence exists for deterministic behavior and UX clarity.
