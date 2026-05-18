---
name: vt-e1-architecture-governance
description: Governance protocol for VT_E1 architecture decisions, invariants, and backlog-to-build execution.
---

# VT_E1 Architecture Governance

Use this skill when:
- A change affects editor architecture, timeline model, AI policy, Remotion parity, or cross-module contracts.
- You need to decide whether a feature belongs in core timeline, FX overlays, or AI patch workflows.
- You need to align implementation with VT_E1 canonical docs before coding.

Primary references:
- `/Users/cwb/Downloads/viewtube/REMOTION_EDITOR_MASTER_SPEC.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VIEWTUBE_VIDEO_EDITOR_UNIFIED_INTENT.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VT_E1_MASTERPLAN_100_PLUS.md`

## Required Inputs
- Target scope (feature/bug/refactor)
- Active phase and sprint target
- Current timeline + rendering behavior
- Any AI mutation behavior in scope

## Invariants (Must Hold)
1. Deterministic frame output for identical inputs.
2. No hidden AI timeline mutation without explicit apply gate.
3. Preview and render parity must be testable and diagnosable.
4. Clip-first editing remains primary interaction model.
5. Feature work maps back to the masterplan registry IDs.

## Workflow
1. **Classify request** by domain tags (`timeline`, `fx`, `ai-orchestration`, `remotion-bridge`, `performance`, `ux`, `integrations`).
2. **Locate registry items** in the masterplan; if missing, append as 101+ with score + dependencies.
3. **Check contract impact** on:
   - timeline data model,
   - effect model,
   - AI patch/apply flow,
   - parity diagnostics.
4. **Write acceptance-first implementation note** before coding.
5. **Define deterministic validation path** (unit/integration/manual parity checks).

## Decision Checklist
- Is this a merge into existing ID (1-100) or a new 101+ item?
- Does this change preserve deterministic preview/render behavior?
- Does this introduce side effects during render?
- Is creator control preserved (manual confirmation and reversibility)?
- Are performance budgets stated (frame time, interaction latency, export constraints)?

## Anti-Rationalization Rules
- Do not bypass contracts for short-term speed.
- Do not implement UI affordances without explicit state and data model definitions.
- Do not ship AI automation paths that skip draft/apply policy.

## Success Checks
- All touched features mapped to registry IDs.
- Spec/intent vocabulary remains aligned.
- Explicit acceptance criteria + dependency notes are documented.
- Verification plan includes parity diagnostics where applicable.
