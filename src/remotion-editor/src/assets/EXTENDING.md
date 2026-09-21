# Extending the Remotion Asset Library

## Add a new visual family only when necessary

Prefer configuring an existing family when the visual grammar is genuinely related. Add a new renderer family when its geometry, compositing model or motion language is meaningfully different.

1. Add the family literal to `VisualFamily` in `types.ts`.
2. Implement a focused renderer in `AssetRenderer.tsx`.
3. Add the family to `renderFamily()`.
4. Add one or more registry seeds in `catalog.ts`.
5. Give each asset an explicit use case, tags, safe areas and motion intensity.
6. Run `validateAssetLibrary()`.
7. Inspect the contact sheets and replace visually redundant work rather than merely documenting duplication.

## Add a static asset

Static entries are created from the still seed collection and become `static-NNN` entries. They render through the same `AssetRenderer` and are registered as native Remotion `<Still>` compositions.

A static design may still use deterministic seeded layout. It must not depend on playback history.

## Add a motion asset

A motion entry must define a natural cycle duration in seconds and a motion-intensity category. Render motion from `useCurrentFrame()` / `useVideoConfig()` through shared helpers such as `loopProgress()`, `phaseOffset()`, `waveValue()` and `orbitalPosition()`.

A new loop must satisfy:

- frame N is a pure function of frame + props
- direct forward/backward seeking needs no previous frame
- the phase wraps exactly at the cycle boundary
- changing fps preserves duration in seconds
- no browser-time animation runtime is introduced
- representative still mode is visually useful

## Parameter rules

Common props are schema-normalized. Only expose controls that are meaningful to the design. The editor reads `controls`, `defaults` and `schema` from the registry instead of requiring a bespoke settings panel for each asset.

Use `seededRandom(seed, index)` for generative layouts. Never call `Math.random()` during rendering.

## Interactivity

Keep editor-facing layers logical: background field, primary graphic, accent system, frame, etc. Do not expose every repeated dot or grid line as a separately editable layer.

When adopting newer Remotion Studio `Interactive.*` APIs, first confirm the repository's installed Remotion version supports the exact API and upgrade the entire Remotion package family together. Do not introduce a mismatched package solely for one asset.

## Performance

Prefer normalized SVG geometry, moderate node counts and shared generators. Avoid large filter stacks, giant masks and per-frame React state. Precompute only data that is independent of the frame; frame-dependent values must remain deterministic.

## Review checklist

Before an asset is accepted:

- verify all four ratios
- inspect first/middle/final/wrap frames
- seek 0 → 80 → 20 → final
- test default and non-default colors
- test reduced motion
- test speed on motion assets
- confirm no clipping in editor bounds
- inspect the contact sheet for redundancy
- verify registry metadata and recommended use
