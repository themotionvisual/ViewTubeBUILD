# Animation Lock — 2026-08-21

Snapshot of the four known-good animation files taken from main HEAD
(`cf93ce6046f32b9b621fa2a748093fa5541335b7`) at 2026-08-21.

Purpose: preserve one canonical, together-tested version of the hero
animation surface so future edits don't fragment the set again.

## Recover

```bash
# Restore any single file to the locked version:
cp governance/animation-lock-2026-08-21/<filename> src/components/<filename>

# Or check out the whole set from the tag:
git show animation-lock/2026-08-21:src/components/GraphsPageCharts.tsx > src/components/GraphsPageCharts.tsx
```

## Integrity manifest (git blob SHA-1 of each locked copy)

| File | Blob SHA-1 | Size (bytes) | Lines |
| --- | --- | --- | --- |
| `GraphsPageCharts.tsx` | `fd55c525e0de5cc28487f7ec3932a80e28c5eddb` | 278996 | 6928 |
| `TubeExplorerVisualModules.tsx` | `1436b6bb8505fd977da88794ee0de8915d9f3690` | 254121 | 5798 |
| `HeroIntroBoundary.tsx` | `1c8898892934670b538d3669922f2f8cca7ae468` | 8590 | 448 |
| `heroVisualAnimations.ts` | `a0ce09187ddf604a7d1a46022e346ffd07695a2a` | 39198 | 1221 |

## What the locked set contains

- 12 hero visuals × 3 animation variants each (36 total), per
  `HERO_VISUAL_VARIANT_COUNT` in `heroVisualAnimations.ts`.
- Circular-arrow header replay button (`HeaderHeroPlayButton`).
- Old in-canvas `HeroAnimationPlayButton` still exported and marked
  `@deprecated` for back-compat with any legacy render site.
- Channel Progress: bars/lines animation runner with variant 0 = intro,
  1 = showcase, 2 = alt.
- Heat Matrix: serpentine-column + serpentine-row + fast row variants.
