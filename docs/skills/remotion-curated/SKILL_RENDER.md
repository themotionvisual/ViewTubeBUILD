---
name: vt-e1-remotion-render-performance
description: Deterministic Remotion rendering, preview/export parity, and performance envelope enforcement for VT_E1.
---

# VT_E1 Remotion Render & Performance

Use this skill when:
- Implementing composition metadata, export paths, preview/render bridges, or diagnostics.
- Optimizing frame time, memory, and effect pipeline overhead.
- Debugging parity mismatches between editor preview and render output.

Primary references:
- `/Users/cwb/Downloads/viewtube/REMOTION_EDITOR_MASTER_SPEC.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VT_E1_MASTERPLAN_100_PLUS.md`

## Determinism Invariants
1. Composition metadata is explicit and stable (`fps`, `durationInFrames`, dimensions).
2. Seeded randomness only; no frame-external nondeterminism.
3. Render path has no side effects or async data races.
4. Equal inputs produce equal frame outputs.

## Performance Envelope
- Keep interaction responsive under active preview load.
- Degrade gracefully for heavy effects.
- Prefer on-demand overlay processing over always-on global filters.
- Separate realtime preview quality from final render quality where needed.

## Workflow
1. **Confirm metadata contract** at composition boundary.
2. **Profile hot paths** (effect stack, overlays, transitions, text layout).
3. **Apply deterministic optimizations** (memoization, bounded params, conditional filter paths).
4. **Run parity smoke** (`start`, `mid`, `end`) and hash snapshots.
5. **Log diagnostics** via `RenderParityContract` mismatch policy.

## Validation Checklist
- Preview and render outputs match within defined tolerance.
- Parity diagnostic surfaces source clip/effect mismatch location.
- Export failures return actionable reason codes.
- Regression checks include max-effect scenarios.
