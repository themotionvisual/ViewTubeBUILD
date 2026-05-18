## ViewTube Rebuild Plan: Editor Core + Remotion-Native Pipeline

### Summary
Rebuild as a **real desktop editor engine** with **Remotion integration as a first-class core**, not an add-on:
- Canonical timeline state drives both interactive preview and Remotion composition render
- Toolbox-style modular UI with dense, pro timeline UX
- AI drafts become validated timeline patches
- Simple default experience, deep modular power

### Implementation Changes
- **Core architecture**
  - Build `EditorEngine` command reducer (`move/trim/split/delete/group/transition/keyframe/...`).
  - Keep timeline as single source of truth.
  - Add history/undo-redo and deterministic command replay.
- **Remotion-first integration**
  - Add `TimelineToRemotionCompiler` that maps timeline state to Remotion composition tree.
  - Define stable mapping for:
    - clips -> `Sequence`
    - transforms/effects -> component props/frame interpolation
    - transitions/groups/seams -> transition wrappers/timing offsets
    - keyframes/easing -> Remotion frame curves (`interpolate`, spring presets)
  - Shared preview contract:
    - editor preview uses same timing/easing model as Remotion output
    - parity checks required between on-canvas preview and exported frames
  - Add render orchestration:
    - draft/preview render (fast)
    - final export render (quality profile)
- **Timeline UX (desktop)**
  - 500ms hold-to-grab on clip body; edge drag for trim/extend.
  - `ArrowDown+click` split, `ArrowLeft+click` split+delete left, `ArrowRight+click` split+delete right.
  - Transparent blue vertical guide line follows cursor with exact time mapping.
  - Cursor state machine with custom assets (default/trim/drag).
- **Density + viewport compaction**
  - Thin stacked tracks, slight radius, long timeline.
  - Empty/out-of-view tracks taper to fine lines.
  - Gravity stacking compresses active area while preserving order/editability.
- **Seam model + contextual tools**
  - Seam object supports group/transition toggle and conversion.
  - Double-click contextual pill menus for clip/timeline/keyframe actions.
- **AI + modules**
  - AI uses draft-then-apply only; no direct mutation.
  - 8-tab modular system remains, with Remotion-backed motion/text/transitions as native capabilities.

### Public APIs / Interfaces / Types
- `RemotionBindingConfig`
  - composition id, fps, width/height, duration strategy, quality profile
- `TimelineToRemotionCompiler`
  - `compile(timelineState, bindingConfig) => RemotionCompositionSpec`
- `PreviewRenderRequest` / `FinalRenderRequest`
  - include timeline snapshot id and remotion compile version
- `RemotionParityReport`
  - frame drift/easing mismatch/transition mismatch diagnostics
- Existing core types remain: `EditorLayoutMode`, `TimelineCommand`, `SeamLink`, `AIGenerateDraftRequest/Response`, `TimelineApplyRequest`

### Test Plan
- **Compiler correctness**
  - timeline commands produce expected Remotion spec for clips/transitions/keyframes.
- **Preview/export parity**
  - sampled frame comparisons between editor preview and Remotion render.
  - easing/transition timing parity across multiple presets.
- **Interaction correctness**
  - hold-drag, trim, split/delete gestures, seam toggles, contextual menus.
- **Compaction behavior**
  - viewport taper + gravity stacking with long timelines and many tracks.
- **Performance**
  - large projects remain responsive; compile+preview cycles stay interactive.

### Assumptions and Defaults
- Remotion is mandatory in V1 architecture.
- Timeline remains canonical; Remotion spec is compiled output.
- Desktop-only interaction model.
- V1 prioritizes engine fidelity + Remotion parity over publishing/distribution integrations.
