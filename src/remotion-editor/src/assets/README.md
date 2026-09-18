# ViewTube Remotion Asset Library

A native Remotion-first motion-design system for the ViewTube video editor.

## Authority

Remotion owns time, rendering, frame seeking, composition registration and output. React defines structure. SVG/HTML define artwork. The asset registry defines discovery and editor metadata.

The package intentionally follows the repository's installed Remotion version (`4.0.465`). No second animation runtime and no additional `@remotion/*` package version was introduced.

## What ships

- 50 static assets: `static-001` through `static-050`
- 50 motion assets: `motion-001` through `motion-050`
- 30 visual families
- 4 declared ratios: 16:9, 9:16, 1:1, 4:5
- deterministic frame math and seeded randomness
- schema-backed prop normalization
- registry-driven metadata and discovery
- Studio asset browser (`AssetGallery`)
- 5 review/contact-sheet stills
- editor timeline adapter and `remotion-asset` layer renderer
- static/reduced-motion representative states
- validation helpers for registry, ratios, schemas, looping and seeking

## Architecture

```
Remotion Studio / ViewTube Timeline
          |
          v
    Asset Registry
          |
          +--> metadata / controls / schema / safe areas
          |
          v
     AssetRenderer
          |
          +--> useCurrentFrame()
          +--> useVideoConfig()
          +--> frame-derived loop math
          +--> seeded deterministic layout
          |
          v
 SVG / React visual families
```

## Key files

- `catalog.ts` — canonical 100-asset registry
- `types.ts` — editor and asset contracts
- `schemas.ts` — prop normalization/validation contract
- `motion.ts` — deterministic timing and generative helpers
- `AssetRenderer.tsx` — shared renderer for Studio, thumbnails and timeline clips
- `AssetGallery.tsx` — development browser hosted in Remotion Studio
- `AssetContactSheet.tsx` — contact-sheet review surface
- `AssetLibraryRoot.tsx` — composition registration
- `editorAdapter.ts` — asset-to-timeline object adapter
- `validation.ts` — executable structural and loop-math validation

## Timing contract

Motion assets derive visual state only from Remotion frame/config plus props. The asset subsystem does not use CSS animation, CSS transition timing, browser timers, `requestAnimationFrame()`, `Date.now()` or uncontrolled randomness.

Natural cycle timing is represented as seconds in metadata and converted through the active Remotion fps by `loopProgress()`. A clip longer than its natural cycle repeats. A shorter clip displays the corresponding deterministic portion of the cycle. Speed modifies the frame-derived phase, not a runtime timer.

## Studio workflow

Open the repository's Remotion Studio and choose `AssetGallery` under `Asset-Library-Development`. The gallery uses the same `AssetRenderer` as the editor. Search/filter/color/ratio/speed controls live in the gallery; Remotion Studio's transport remains authoritative for play, pause and arbitrary frame seeking.

The 100 individual registered asset compositions live under `Asset-Library-Static` and `Asset-Library-Motion`. Contact sheets live under `Asset-Library-Review`.

## Editor integration

Use `createAssetTimelineObject()` to create a ViewTube layer + clip pair. The renderer recognizes `layer.type === 'remotion-asset'` and mounts the same asset component inside the existing Remotion `Sequence`, so local frame time starts with the clip and remains seekable.

## Responsive behavior

`AssetRenderer` reads Remotion dimensions by default. Embedded previews may pass `layoutWidth/layoutHeight` so the same renderer applies portrait, square and 4:5 layout decisions inside the Studio gallery. Geometry is normalized to a 100×100 SVG coordinate space and cropped/repositioned rather than stretched.

## Accessibility / reduced motion

Every motion asset exposes `reducedMotion` and `staticMode`. Both resolve to the registry's representative preview frame instead of destroying the composition.

## Validation

Call `validateAssetLibrary()` for a non-throwing report or `assertAssetLibraryIntegrity()` to fail fast. See `QA.md` and `MOTION_VALIDATION.md` for the validation boundary.

Runtime Studio screenshots and CLI render verification must still be performed in an environment that can execute the repository; this branch was authored through the connected GitHub integration, while the current shell environment cannot clone the repository.
