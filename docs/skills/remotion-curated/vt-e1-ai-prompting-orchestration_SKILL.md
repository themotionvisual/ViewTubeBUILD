---
name: vt-e1-ai-prompting-orchestration
description: Creator-safe AI orchestration for VT_E1: prompt flows, patch drafting, deterministic apply gates, and cost-visible interaction loops.
---

# VT_E1 AI Prompting & Orchestration

Use this skill when:
- Building AI-assisted editing, generation, or suggestion features.
- Designing prompt UIs, action plans, or timeline mutation pathways.
- Enforcing manual-confirmation-first AI behavior.

Primary references:
- `/Users/cwb/Downloads/viewtube/REMOTION_EDITOR_MASTER_SPEC.md` (AI contracts)
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VIEWTUBE_VIDEO_EDITOR_UNIFIED_INTENT.md` (creator control principles)
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VT_E1_MASTERPLAN_100_PLUS.md` (AI roadmap)

## Core Contracts
- `AIGenerationPatch`
- `ApplyPatchGate`
- `RenderParityContract`

AI outputs draft patches, not direct timeline commits.

## Workflow
1. **Capture creator intent** (goal, tone, constraints, duration/style targets).
2. **Generate structured draft patch** with deterministic references and confidence notes.
3. **Present diff + impact summary** (what changes, where, expected effect).
4. **Show token/cost line item** before apply.
5. **Require explicit apply action** for mutation.
6. **Run parity diagnostics** when patch touches render-critical structures.

## Prompting Standards
- Ask for missing constraints early.
- Prefer explicit fields over long free-form prose.
- Keep prompts reversible and re-runnable.
- Store prompt + result lineage for trust/debugging.

## Safety Rules
- No background auto-apply edits.
- No silent selection changes.
- No nondeterministic mutation behavior.
- Every AI mutation is undoable and diff-traceable.

## Success Checks
- Draft-only mode blocks direct writes.
- Diff viewer appears before apply.
- Cost row displayed for each action.
- Re-run with same input/seed yields equivalent result shape.
