# VT_E1 Skills + Workflow Unification V2

## Purpose
Canonical, operator-ready VT_E1 skill and workflow system for `/editor-v1`.
This V2 stack removes drift between docs/skills and enforces deterministic behavior from ideation to Remotion handoff.

## Authority Model
Primary owner skills (and only these) define VT_E1 policy:
1. `vt-e1-architecture-governance`
2. `vt-e1-visual-fx-studio`
3. `vt-e1-remotion-render-performance`

`skill-creator` is process support only (authoring/validation), not runtime policy authority.

## Layered Document Contract
### Layer A: Product Truth (authoritative state)
- `VT_E1_KNOWN_GAPS_LEDGER.md`
- `VT_E1_PARITY_MATRIX.md`

### Layer B: Runtime/Render Truth (authoritative execution)
- `VT_E1_REMOTION_TOOLS_INTEGRATION_PACK.md`
- `render-optimization-v1.md`
- `visual-motion-v1.md`

### Layer C: Ideation Harvest (non-authoritative)
- AI/Gemini/RTF/TXT concept files
- Used only for candidate proposals and backlog intake

## Unified VT_E1 Workflow Contract
1. Classify request by domain:
   - `timeline`, `fx`, `ai-orchestration`, `remotion-bridge`, `performance`, `ux`, `integrations`
2. Map to backlog/masterplan ID (`existing` or `101+`).
3. Write acceptance-first implementation note.
4. Implement with deterministic constraints and manual-AI apply policy.
5. Verify with parity smoke + preflight + export contract checks.

## Manual-AI Policy (Hard Rule)
- AI/Oracle behavior is `draft/propose` only until explicit human apply action.
- No hidden timeline mutation.
- No auto-apply behavior in generated patches.

## Oracle Module Consolidation
`render-optimization-v1` and `visual-motion-v1` are advisor modules under VT_E1.
They must:
- preserve manual apply gate,
- emit deterministic seed-safe proposals,
- target `VT_E1_EditorProjectV3`/Remotion job compatible payloads.

## Execution Lanes
1. Stability: transition safety and runtime diagnostics verification.
2. Timeline parity: close `tl-05`, `tl-06` mechanics.
3. Render bridge: parity hash snapshots + warning visibility.
4. FX quality: preset fidelity, overlay robustness, reproducibility.

## Internal V2 Contracts
- `SkillContractV2`
- `EditorParityChecklistV2`
- `KnownGapsRegistryV2`
- `OraclePatchProposalV2`

See sibling files in this folder for concrete schemas and usage.
