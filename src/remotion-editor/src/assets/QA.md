# Asset Library QA Report

## Automated/source-level checks

The branch includes `validateAssetLibrary()`, which checks:

- exactly 100 registered assets
- exactly 50 static and 50 motion
- unique IDs and names
- all four ratio declarations
- default props parse through each asset schema
- motion preview frames fall inside natural cycles
- loop math wraps at 24, 30 and 60 fps
- repeated arbitrary-seek probes return identical phase values
- every motion asset exposes reduced-motion and speed controls
- `durationInFrames === round(loopDurationSeconds × fps)`

A source-policy scan of the new asset subsystem found no use of `Math.random()`, `Date.now()`, `setTimeout()`, `setInterval()`, `requestAnimationFrame()`, CSS animation timing, CSS transition timing, or SVG `<animate>`.

## Architecture checks

- Remotion `4.0.465` remains the repository authority.
- No second motion runtime was added.
- No mismatched `@remotion/*` package was added.
- Static and motion assets share one renderer.
- Thumbnail/static mode uses the registered preview state.
- Editor clips mount assets inside the existing Remotion `Sequence`.
- The Studio gallery uses the production renderer rather than demo-only substitutes.

## Runtime validation status

Source-level implementation is complete on the feature branch. Full CLI/Studio render validation is not claimed in this report because the current execution shell cannot clone the GitHub repository or install its dependencies. The connected GitHub integration can read/write the branch but does not execute `npm run lint`, Remotion Studio or Chromium.

Before merge, the branch should therefore pass the repository's normal TypeScript/ESLint checks and a Studio visual pass covering the registered assets and contact sheets.

## Required visual acceptance pass

For each motion family, inspect:
- beginning
- middle
- last rendered frame
- wrap to frame 0
- random seek
- reverse seek
- 16:9 / 9:16 / 1:1 / 4:5
- default and altered palette
- static mode
- reduced-motion mode

For still families, inspect all four ratios, safe negative space and clipping.

No item should be marked runtime-certified until those rendered frames have been observed.
