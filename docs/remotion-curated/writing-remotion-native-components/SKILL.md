---
name: writing-remotion-native-components
description: Use when implementing visual components or effects in the Remotion-native editor context to ensure deterministic rendering and parity.
---

# Writing Remotion-Native Components

## Overview
ViewTube (VT_E1) is a Remotion-native editor. All visual components MUST be deterministic. This means given the same frame number and seed, the output must be identical.

## The Iron Law of Determinism
**Never use nondeterministic sources for visual properties.**
- NO `Math.random()` (use `random(seed)`)
- NO `Date.now()` (use `useCurrentFrame()`)
- NO `setTimeout`/`setInterval`
- NO side-effectful network calls during render

## When to Use
- Implementing a new visual layer or clip renderer.
- Adding procedural animations or effects.
- Refactoring existing components for render parity.

## Core Pattern: Frame-Based Logic
Use `useCurrentFrame()` and `useVideoConfig()` as the primary source of truth for all time-based logic.

```tsx
import { useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

export const MyDeterministicComponent = ({ seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // ✅ GOOD: Seeded randomness
  const opacity = random(`${seed}-${frame}`);
  
  // ✅ GOOD: Frame-based interpolation
  const scale = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });

  return <div style={{ opacity, transform: `scale(${scale})` }} />;
};
```

## Quick Reference

| Property | Use instead of... | Use this... |
|----------|-------------------|-------------|
| Time | `Date.now()`, `new Date()` | `useCurrentFrame()` / `fps` |
| Randomness | `Math.random()` | `random(seed)` |
| Animation | CSS Transitions/Animations | `interpolate()`, `spring()` |
| Window Size | `window.innerWidth` | `useVideoConfig().width` |

## Common Mistakes & Rationalizations

| Excuse / Rationalization | Reality |
|--------------------------|---------|
| "It's just a simple flicker, `Math.random()` is easier." | `Math.random()` will flicker differently every time the user seeks. The preview won't match the export. |
| "I'm just using `Date.now()` for a unique key." | Use a combination of `clipId` and `frame` for keys. `Date.now()` breaks render consistency. |
| "The user needs it fast, I'll fix the determinism later." | Fixing non-deterministic bugs later is 10x harder because they are "ghost" bugs. Fix it now. |

## Red Flags - STOP and Refactor
- Usage of `Math.random()` inside a functional component.
- Usage of `Date.now()` or `new Date()` inside `render`.
- Use of `useEffect` to trigger animations (animations should be frame-driven).
- Use of browser-native `requestAnimationFrame`.

## Verification Checklist
- [ ] Component uses `useCurrentFrame()` for time-based behavior.
- [ ] Any randomness is seeded (e.g., using a `clipId` or `seed` prop).
- [ ] Component output is identical when seeking back and forth to the same frame.
- [ ] No browser-native time/random APIs are used.
