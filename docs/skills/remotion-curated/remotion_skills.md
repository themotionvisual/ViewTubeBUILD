name: remotion-bridge-skills
description: Remotion integration skills. Maps VT_E1 project model to Remotion compositions, animations, transitions, rendering.
metadata:
tags: remotion, VT_E1, compositions, animations, rendering, export, bridge

---

# Remotion Skills for VT_E1

> Reference: `REMO_DOCS_BASICS.txt` + `VT_E1.html` (CODEX_EDITOR_X_V1)
> Goal: Define exact Remotion translation rules.

---

## 1. Composition Mapping

VT_E1 project schema → Remotion `<Composition>` 1:1.

### VT_E1 Project → Composition Props

| VT_E1 Field | Remotion Prop | Notes |
|---|---|---|
| `meta.fps` | `fps` | Default 30. Range 12–120. |
| `meta.durationSec` | `durationInFrames` | `Math.ceil(durationSec * fps)` |
| `meta.exportProfile` → `EXPORT_PROFILE_BASE[key]` | `width`, `height` | Lookup `'720'`/`'1080'`/`'1k'`/`'2k'`/`'4k'` |
| `meta.aspectRatio` | Derived width/height | `'16:9'` or `'9:16'` flips w/h. |
| `meta.projectName` | `id` on `<Composition>` | Sanitize: lowercase, alphanumeric + hyphens. |

### Translation Rule

```tsx
import { Composition } from "remotion";

const fps = project.meta.fps || 30;
const dims = EXPORT_PROFILE_BASE[project.meta.exportProfile || '1080'];
const w = project.meta.aspectRatio === '9:16' ? dims.h : dims.w;
const h = project.meta.aspectRatio === '9:16' ? dims.w : dims.h;

<Composition
  id={sanitize(project.meta.projectName)}
  component={VT_E1Scene}
  fps={fps}
  durationInFrames={Math.ceil(project.meta.durationSec * fps)}
  width={w}
  height={h}
  defaultProps={{ project }}
/>
```

### Root File Pattern

```tsx
// src/Root.tsx
import { Composition, Folder } from "remotion";

export const RemotionRoot = () => (
  <Folder name="VT-E1">
    <Composition
      id="Main"
      component={VT_E1Scene}
      fps={30}
      durationInFrames={900}
      width={1920}
      height={1080}
      defaultProps={{ project: defaultProject() }}
    />
  </Folder>
);
```

---

## 2. Animation Translation

### CRITICAL RULE
**CSS transitions, CSS animations, Tailwind animation classes FORBIDDEN in Remotion.**
Drive ALL VT_E1 animations via `useCurrentFrame()` + `interpolate()`.

### VT_E1 Easing → Remotion Easing

| VT_E1 `ease` | Remotion `Easing` |
|---|---|
| `easeOutBack` | `Easing.bezier(0.34, 1.56, 0.64, 1)` |
| `easeOutCubic` | `Easing.bezier(0.33, 1, 0.68, 1)` |
| `easeOutExpo` | `Easing.bezier(0.16, 1, 0.3, 1)` |
| `linear` | `Easing.linear` (default) |

### VT_E1 Intro/Outro Presets → Remotion `interpolate()`

VT_E1: 8 intro + 8 outro presets. Maps to `interpolate()`:

```tsx
import { useCurrentFrame, interpolate, Easing } from "remotion";

// bounceIn intro
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const introDur = clip.introDurationSec * fps;
const level = clip.introLevel;

const opacity = interpolate(frame, [0, introDur], [0, 1], {
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.34, 1.56, 0.64, 1),
});

const translateY = interpolate(frame, [0, introDur], [40 * level, 0], {
  extrapolateRight: "clamp",
  easing: Easing.bezier(0.34, 1.56, 0.64, 1),
});
```

### Preset Family → Transform Map

| Family | Property | From | To |
|---|---|---|---|
| `bounceIn` | translateY | `40 * level` | `0` |
| `slideUp` | translateY | `120 * level` | `0` |
| `slideRight` | translateX | `-120 * level` | `0` |
| `slideLeft` | translateX | `120 * level` | `0` |
| `dropIn` | translateY | `-120 * level` | `0` |
| `zoomIn` | scale | `0.3 * level` | `1` |
| `zoomOut` | scale | `1.6 * level` | `1` |
| `spinIn` | rotate | `-180 * level` | `0` |

Outros reverse: `[0, 1]` → `[1, 0]` opacity. Transform values swap from/to.

---

## 3. Keyframe System → Remotion `interpolate()`

VT_E1 keyframes: `{ offsetSec, values, interp }`.
Convert frame-based `interpolate()`.

### Translation Pattern

```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Convert VT_E1 keyframes to frame-domain arrays
const kfFrames = keyframes.map(kf => Math.round(kf.offsetSec * fps));
const kfValues = keyframes.map(kf => kf.values[prop]);

const value = interpolate(frame, kfFrames, kfValues, {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### VT_E1 `NUMERIC_PROPS` → Remotion Interpolatable

Interpolatable numeric props:
`x, y, scale, rotation, opacity, blur, saturation, brightness, hue, strokeWidth, width, height, cornerRadius, fontSize, volume, polygonSides, polygonInnerRadius`

### `STEP_PROPS` → Discrete (no interpolation)

`fillColor, strokeColor, layerName` — use nearest-keyframe snap. NO `interpolate()`.

---

## 4. Layer Rendering → Remotion Components

VT_E1 layer types → Remotion components:

### Layer Type → Component

| VT_E1 Type | Remotion Component | Key Props |
|---|---|---|
| `text` | Custom `<TextLayer>` | `fontFamily, fontSize, fillColor, strokeColor, strokeWidth, text` |
| `shape` | Custom `<ShapeLayer>` | `shape (rect/circle/polygon), fillColor, strokeColor, cornerRadius, polygonSides` |
| `media` | `<Img>` or `<Video>` from `@remotion/media` | `mediaUrl, fit, width, height` |
| `audio` | `<Audio>` from `@remotion/media` | `mediaUrl, volume, muted, trimBefore, trimAfter` |
| `template` | Custom `<TemplateLayer>` | `motionAsset, templateNodes, style variant` |

### Track Order → Z-index (AbsoluteFill stacking)

VT_E1 tracks sort `order`. Remotion renders bottom-up `<AbsoluteFill>`:

```tsx
import { AbsoluteFill, Sequence } from "remotion";

// Higher track order = rendered first (behind)
const sortedLayers = [...layers].sort((a, b) => {
  const orderA = trackOrderMap[a.trackId] ?? 999;
  const orderB = trackOrderMap[b.trackId] ?? 999;
  return orderB - orderA; // reverse: higher order behind
});

return (
  <AbsoluteFill>
    {sortedLayers.map(layer => (
      <Sequence
        key={layer.id}
        from={Math.round(clip.start * fps)}
        durationInFrames={Math.round((clip.end - clip.start) * fps)}
      >
        <LayerRenderer layer={layer} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
```

---

## 5. Media Handling

### Images
```tsx
import { Img, staticFile } from "remotion";

// Remote URL (VT_E1 mediaUrl)
<Img src={layer.payload.mediaUrl} style={{ width, height, objectFit: payload.fit }} />

// Local file (public/ folder)
<Img src={staticFile("asset.png")} />
```

### Video
```tsx
import { Video } from "@remotion/media";

<Video
  src={layer.payload.mediaUrl}
  style={{ width, height, objectFit: payload.fit }}
/>
```

### Audio

VT_E1 audio → Remotion `<Audio>` clip-based sequencing:

```tsx
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";

const { fps } = useVideoConfig();

<Sequence from={Math.round(clip.start * fps)} durationInFrames={Math.round((clip.end - clip.start) * fps)}>
  <Audio
    src={layer.payload.mediaUrl}
    volume={layer.payload.muted ? 0 : layer.payload.volume}
  />
</Sequence>
```

#### Volume Automation via Keyframes

```tsx
<Audio
  src={src}
  volume={(f) => {
    // f = frame relative to Audio start
    return interpolate(f, kfFrames, kfVolumes, { extrapolateRight: "clamp" });
  }}
/>
```

---

## 6. Transition System → TransitionSeries

### Prerequisites
```bash
npx remotion add @remotion/transitions
```

### VT_E1 `TRANSITION_TYPES` → Remotion Transitions

| VT_E1 Type | Remotion Presentation | Import Path |
|---|---|---|
| `cut` | No transition | — |
| `fade` | `fade()` | `@remotion/transitions/fade` |
| `crossfade` | `fade()` | `@remotion/transitions/fade` |
| `wipeLeft` | `wipe({ direction: "from-right" })` | `@remotion/transitions/wipe` |
| `wipeRight` | `wipe({ direction: "from-left" })` | `@remotion/transitions/wipe` |
| `slideLeft` | `slide({ direction: "from-right" })` | `@remotion/transitions/slide` |
| `slideRight` | `slide({ direction: "from-left" })` | `@remotion/transitions/slide` |
| `zoom` | Custom presentation | Manual `interpolate()` |
| `blurDissolve` | Custom presentation | Manual `interpolate()` blur + opacity |
| `dipToColor` | Custom presentation | Intermediate color fill + `fade()` |

### Translation Pattern

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

const { fps } = useVideoConfig();
const transitionFrames = Math.round(transition.durationSec * fps);

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={scene1Frames}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: transitionFrames })}
  />
  <TransitionSeries.Sequence durationInFrames={scene2Frames}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Duration Calculation

VT_E1 transitions overlap clips. Remotion `TransitionSeries` shortens total:
```
totalFrames = sum(sequenceFrames) - sum(transitionFrames)
```

---

## 7. Effects System → CSS Filter in Remotion

VT_E1 `buildEffectFilter()` makes CSS filter strings.
Remotion supports inline CSS `filter` on `<div>` wrappers. Reuse.

```tsx
const filterStr = buildEffectFilter(evaluatedPayload, project.meta.visualDNA);

<div style={{
  filter: filterStr,
  opacity: evaluatedPayload.opacity,
  transform: `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`,
}}>
  <LayerContent />
</div>
```

### Effect Types Fully Supported via CSS Filter

All 20 VT_E1 effects produce valid CSS filter strings. Work Remotion unchanged.

---

## 8. Template / MotionAsset System

### VT_E1 Template Architecture

Templates = mini-projects:
- `PRESETS` → 42 presets, 14 style variants.
- `motionAsset` → params: title, primary, secondary, color, style, animation, duration, posX, posY, scale, showText, icon.
- `templateNodes` → `buildTemplateNodesForStyle()` output: container, icon, panel, deco, primary, secondary text.
- `convert0153dPresetToV2()` → converts preset → project skeleton (track, layer, clip).

### Remotion Template Component

```tsx
const TemplateLayer: React.FC<{
  motionAsset: MotionAsset;
  templateNodes: TemplateNode[];
  style: string; // style variant from STYLE_VARIANT_REGISTRY
}> = ({ motionAsset, templateNodes, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Drive ALL animations via useCurrentFrame()
  const entryProgress = interpolate(
    frame,
    [0, Math.round(0.4 * fps)],
    [0, 1],
    { extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) }
  );

  return (
    <AbsoluteFill style={{
      transform: `translate(${motionAsset.posX}px, ${motionAsset.posY}px) scale(${motionAsset.scale})`,
    }}>
      {/* Render nodes: container → icon → text */}
      <TemplateNodeRenderer nodes={templateNodes} style={style} color={motionAsset.color} progress={entryProgress} />
    </AbsoluteFill>
  );
};
```

### Style Variant Rendering

14 variants `STYLE_VARIANT_REGISTRY`.
Variants modify border-radius, shadows, glow, rotation. Use `resolveDnaStyle()` output inline Remotion.

### Icon Resolution

```tsx
import * as LucideIcons from "lucide-react";

const IconComponent = LucideIcons[toPascalIconName(motionAsset.icon)];
if (IconComponent) return <IconComponent size={48} color={motionAsset.color} />;
```

---

## 9. Camera System

VT_E1 camera: `{ x, y, z, scale, rotate, keyframes[] }`

### Remotion Camera Wrapper

```tsx
const CameraWrapper: React.FC<{ camera: Camera; children: React.ReactNode }> = ({ camera, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Evaluate camera keyframes
  const cx = valueFromKeyframes(camera.x, camera.keyframes, 'x', t);
  const cy = valueFromKeyframes(camera.y, camera.keyframes, 'y', t);
  const cz = valueFromKeyframes(camera.z, camera.keyframes, 'z', t);
  const cScale = valueFromKeyframes(camera.scale, camera.keyframes, 'scale', t);
  const cRotate = valueFromKeyframes(camera.rotate, camera.keyframes, 'rotate', t);

  return (
    <AbsoluteFill style={{
      transform: `translate(${-cx}px, ${-cy}px) scale(${cScale}) rotate(${cRotate}deg)`,
      perspective: `${1000 + cz}px`,
    }}>
      {children}
    </AbsoluteFill>
  );
};
```

---

## 10. Export / Render Bridge

### Current VT_E1 Export: `exportRemotionJob()`

Outputs `.remotion.<format>.job.json`:
```json
{
  "kind": "remotionRender",
  "targetFormat": "mp4",
  "composition": { "fps": 30, "durationInSeconds": 10, "width": 1920, "height": 1080 },
  "exportProfile": "1080",
  "schemaVersion": "EditorProjectV2",
  "project": { /* full project state */ }
}
```

### Bridge: Job JSON → Remotion Render

```bash
npx remotion render src/index.ts Main --props=./job.json --output=output.mp4
```

Job JSON `project` parsed `calculateMetadata`:

```tsx
const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const project = normalizeProject(props.project);
  return {
    fps: project.meta.fps,
    durationInFrames: Math.ceil(project.meta.durationSec * project.meta.fps),
    width: EXPORT_PROFILE_BASE[project.meta.exportProfile].w,
    height: EXPORT_PROFILE_BASE[project.meta.exportProfile].h,
    props: { ...props, project },
  };
};
```

### Parametrization with Zod

```tsx
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const VT_E1Schema = z.object({
  project: z.any(), // Full EditorProjectV2 — validated by normalizeProject()
  overrideTitle: z.string().optional(),
  overrideColor: zColor().optional(),
});
```

---

## 11. Feature Flag: `remotionBridgeTools`

VT_E1 `FEATURE_FLAGS_DEFAULT.remotionBridgeTools: false`.

Enabled surfaces:
- **Remotion Studio Preview** — `npx remotion studio`
- **Direct Render** — `npx remotion render` UI
- **Composition Sync** — live-sync project state → Remotion props.

---

## 12. Parity Smoke Test → Remotion

VT_E1 `runParitySmoke()` validates layers 3 sample times.
Extend Remotion: render 3 frames `renderMedia()` API. Compare canvas snapshots.

```tsx
import { renderStill } from "@remotion/renderer";

const sampleFrames = [0, totalFrames / 2, totalFrames - 1];
for (const frame of sampleFrames) {
  await renderStill({
    composition: "Main",
    serveUrl: bundlePath,
    output: `parity_frame_${frame}.png`,
    frame,
  });
}
// Compare against VT_E1 canvas captures at same timestamps
```

---

## 13. Forbidden Patterns (Hard Rules)

1. **NO CSS `animation` or `@keyframes`** Remotion components.
2. **NO CSS `transition`**.
3. **NO Tailwind animation classes** (`animate-spin`, `animate-bounce`).
4. **NO `useFrame()`** `@react-three/fiber`.
5. **ALL motion** `useCurrentFrame()` + `interpolate()`.
6. **ALL `<Sequence>` inside `<ThreeCanvas>`** require `layout="none"`.
7. **`<ThreeCanvas>`** requires explicit `width`, `height`.

---

## 14. Gemini + Caveman + Superpowers Skill Overlay

Use this overlay when operating VT_E1 as an AI-assisted editor system.

### Gemini Alignment Rules

- Keep all generation deterministic and replayable.
- Use schema-first outputs for AI steps (`sceneBeatSheet`, `timelinePatch`, `renderPlan`).
- Require preview-before-apply for every AI mutation.
- Preserve creator authority: no hidden auto-apply.

### Caveman Protocol (from `GEMINI.md`)

- Keep operator-facing copy concise and action-first.
- Use terse status lines in AI logs: `thing action reason`.
- Keep exact code terms unchanged in all generated artifacts.
- Use full clarity mode only for destructive/security-critical actions.

### Superpowers Workflow Mapping

- **brainstorming** → generate 3 candidate scene plans before coding.
- **writing-plans** → convert chosen scene plan into file-level TODOs.
- **test-driven-development** → parity tests first, then bridge code.
- **systematic-debugging** → route-identify first (`/editor-v1` vs `/internal/editor-launch`), then patch.
- **verification-before-completion** → prove frame parity + metadata integrity before sign-off.

### Mandatory Guardrails

1. No non-deterministic animation logic.
2. No direct AI mutation of timeline without explicit user confirmation.
3. No UI style mutation leaking into render math.
4. No undocumented schema changes to export contracts.

---

## 15. VT_E1 Bang-for-Buck Upgrade Backlog (Top 100)

### A. UX and Editor Flow (1-20)

1. Add command palette with fuzzy search for all editor actions.
2. Add keyboard shortcut cheat-sheet modal (`?`) with live filtering.
3. Add onboarding quickstart overlay with skip + never-show toggle.
4. Add “focus mode” that hides non-essential panels during timeline edits.
5. Add dockable/undockable inspector panel with saved layout states.
6. Add recent-projects launcher with auto-thumbnail previews.
7. Add project-level autosave restore banner with diff preview.
8. Add multi-select lasso on timeline clips.
9. Add clip grouping with collapse/expand group lanes.
10. Add track lock/solo/mute controls with one-click reset.
11. Add snap strength levels (hard/soft/off) instead of binary snap.
12. Add ripple-edit mode toggle for insert/delete operations.
13. Add marker lanes (chapter/beat/comment/approval).
14. Add searchable clip list panel with jump-to-time.
15. Add right-click context menus for timeline seams and clips.
16. Add drag ghost previews with frame/time tooltip.
17. Add hover-scrub thumbnails for video clips.
18. Add persistent breadcrumbs for nested edits/precomps.
19. Add undo history panel with jump-to-state.
20. Add compact mobile-safe control layout for smaller screens.

### B. Timeline and Core Editing (21-40)

21. Add subframe-safe internal timing but frame-snapped UI display.
22. Add trim handles with precision nudge (1f/5f/1s).
23. Add split-at-playhead across selected clips.
24. Add gap detection + close-gap action.
25. Add match-duration tool for selected clips.
26. Add speed ramp curves per clip (visual graph editor).
27. Add clip freeze-frame and hold-frame insert.
28. Add reverse playback toggle for compatible media.
29. Add per-track color labels and semantic track types.
30. Add lane auto-height by content density.
31. Add transition handles directly on seam nodes.
32. Add transition presets with editable easing curves.
33. Add linked A/V clip pairing and unlink workflow.
34. Add timeline minimap for long projects.
35. Add beat grid overlay synced to BPM.
36. Add marker snapping and marker quantization.
37. Add fit-to-selection and fit-to-all zoom shortcuts.
38. Add batch clip alignment tools (start/end/center).
39. Add non-destructive trim model with source in/out offsets.
40. Add conflict warnings for overlapping locked clips.

### C. Motion, Keyframes, and Animation (41-55)

41. Add channel-based keyframe editor (position/scale/rotation/opacity).
42. Add bezier handles for temporal easing per keyframe.
43. Add keyframe copy/paste across clips with remap options.
44. Add keyframe presets (bounce, overshoot, smoothstep, expo).
45. Add ghost path visualization for animated position.
46. Add value graph and speed graph toggle.
47. Add hold keyframe type for step changes.
48. Add multi-property keyframe selection + transform.
49. Add motion blur preview toggle with quality tiers.
50. Add spring parameter UI (mass/stiffness/damping) with presets.
51. Add anchor/origin controls with viewport gizmo.
52. Add path-follow animation from SVG path.
53. Add stagger generator for selected layers.
54. Add secondary motion generator (jitter, drift, sway).
55. Add animation diagnostics panel (non-determinism + invalid ranges).

### D. Visual System and Templates (56-68)

56. Add template browser with tags, previews, and intensity filter.
57. Add one-click style swap across project (neo variants).
58. Add tokenized theme editor for palette/border/shadow settings.
59. Add strict style-boundary validator (UI style vs render style).
60. Add reusable “scene blocks” library from user-created sequences.
61. Add dynamic safe-area overlays for Shorts/Reels/TikTok.
62. Add responsive text fitting with overflow policies.
63. Add font fallback manager with preflight validation.
64. Add shape toolkit (polygon/star/blob) with deterministic seed control.
65. Add filter stack presets (film, cyber, noir, clean promo).
66. Add compositional guides (rule-of-thirds, center, golden ratio).
67. Add contrast/readability checker for text-over-video.
68. Add auto-caption style packs consistent with Neo-Brutalist system.

### E. Audio and Captions (69-78)

69. Add waveform rendering cache for fast scrolling.
70. Add audio ducking automation tied to voiceover track.
71. Add silence detection + auto-trim suggestions.
72. Add loudness normalization presets (podcast, shorts, music).
73. Add beat detection and beat marker generation.
74. Add caption timing nudges with keyboard-only workflow.
75. Add word-level caption emphasis animation presets.
76. Add profanity mute/beep tool with transcript targeting.
77. Add room-tone fill generator for hard audio cuts.
78. Add audio FX rack (EQ, compressor, limiter) with safe defaults.

### F. AI, Orchestration, and Safety (79-90)

79. Add AI “draft only” mode globally enforced in settings.
80. Add timeline patch diff viewer before apply.
81. Add AI confidence score + risk flags per suggestion.
82. Add multi-agent pipeline states (Analyzer/Architect/Coder/Critic).
83. Add prompt-to-scene schema validator with auto-repair hints.
84. Add intent presets (hook, explainer, ad, teaser, montage).
85. Add style-locked generation so AI cannot break brand tokens.
86. Add deterministic seed ledger for all generated assets.
87. Add retry strategy with exponential backoff for model calls.
88. Add token/cost meter per AI operation in UI.
89. Add “regenerate only selected layer” operation.
90. Add safety rails for prompt injection in imported text/assets.

### G. Rendering, Performance, and Reliability (91-100)

91. Add one-frame render sanity check button in editor.
92. Add 3-frame parity smoke test (`start`, `middle`, `end`) export.
93. Add render queue inspector with per-stage timing.
94. Add local-vs-server render mode switch with fallback logic.
95. Add preflight diagnostics (missing assets/fonts/invalid clips).
96. Add offscreen worker pipeline for heavy preview tasks.
97. Add adaptive preview quality under load.
98. Add deterministic snapshot test pack for template regressions.
99. Add crash-safe recovery package on failed render jobs.
100. Add export contract version checker with migration assistant.
