name: remotion-bridge-skills
description: Remotion integration skills for VT_E1 video editor. Maps editor project model to Remotion compositions, animations, transitions, and rendering.
metadata:
tags: remotion, VT_E1, compositions, animations, rendering, export, bridge

---

# Remotion Skills for VT_E1

> Reference source: `REMO_DOCS_BASICS.txt` + `VT_E1.html` (CODEX_EDITOR_X_V1)
> Goal: Make VT_E1 the best it can be by defining exact Remotion translation rules.

---

## 1. Composition Mapping

VT_E1 project schema → Remotion `<Composition>` 1:1.

### VT_E1 Project → Composition Props

| VT_E1 Field | Remotion Prop | Notes |
|---|---|---|
| `meta.fps` | `fps` | Default 30, range 12–120 |
| `meta.durationSec` | `durationInFrames` | `Math.ceil(durationSec * fps)` |
| `meta.exportProfile` → `EXPORT_PROFILE_BASE[key]` | `width`, `height` | Lookup from `'720'`/`'1080'`/`'1k'`/`'2k'`/`'4k'` |
| `meta.aspectRatio` | Derived from width/height | `'16:9'` or `'9:16'` flips w/h |
| `meta.projectName` | `id` on `<Composition>` | Sanitize: lowercase, alphanumeric + hyphens |

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
**CSS transitions, CSS animations, and Tailwind animation classes are FORBIDDEN in Remotion.**
All VT_E1 animations MUST be driven by `useCurrentFrame()` + `interpolate()`.

### VT_E1 Easing → Remotion Easing

| VT_E1 `ease` | Remotion `Easing` |
|---|---|
| `easeOutBack` | `Easing.bezier(0.34, 1.56, 0.64, 1)` |
| `easeOutCubic` | `Easing.bezier(0.33, 1, 0.68, 1)` |
| `easeOutExpo` | `Easing.bezier(0.16, 1, 0.3, 1)` |
| `linear` | `Easing.linear` (default) |

### VT_E1 Intro/Outro Presets → Remotion `interpolate()`

VT_E1 defines 8 intro + 8 outro presets. Each maps to `interpolate()` calls:

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

Outros reverse: `[0, 1]` → `[1, 0]` for opacity; transform values swap from/to.

---

## 3. Keyframe System → Remotion `interpolate()`

VT_E1 keyframes store `{ offsetSec, values, interp }`.
Convert to frame-based `interpolate()` calls.

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

All numeric props in VT_E1 are directly interpolatable:
`x, y, scale, rotation, opacity, blur, saturation, brightness, hue, strokeWidth, width, height, cornerRadius, fontSize, volume, polygonSides, polygonInnerRadius`

### `STEP_PROPS` → Discrete (no interpolation)

`fillColor, strokeColor, layerName` — use nearest-keyframe snap, not `interpolate()`.

---

## 4. Layer Rendering → Remotion Components

VT_E1 layer types map to Remotion component patterns:

### Layer Type → Component

| VT_E1 Type | Remotion Component | Key Props |
|---|---|---|
| `text` | Custom `<TextLayer>` | `fontFamily, fontSize, fillColor, strokeColor, strokeWidth, text` |
| `shape` | Custom `<ShapeLayer>` | `shape (rect/circle/polygon), fillColor, strokeColor, cornerRadius, polygonSides` |
| `media` | `<Img>` or `<Video>` from `@remotion/media` | `mediaUrl, fit, width, height` |
| `audio` | `<Audio>` from `@remotion/media` | `mediaUrl, volume, muted, trimBefore, trimAfter` |
| `template` | Custom `<TemplateLayer>` | `motionAsset, templateNodes, style variant` |

### Track Order → Z-index (AbsoluteFill stacking)

VT_E1 tracks sort by `order`. In Remotion, render layers bottom-up using `<AbsoluteFill>` stacking:

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

VT_E1 audio layers → Remotion `<Audio>` with clip-based sequencing:

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

VT_E1's `buildEffectFilter()` generates CSS filter strings.
Remotion supports inline CSS `filter` on `<div>` wrappers — reuse directly.

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

All 20 VT_E1 effects (`grayscale`, `sepia`, `invert`, `contrast`, `hueRotate`, `vibrance`, `temperature`, `tint`, `exposure`, `highlights`, `shadows`, `clarity`, `sharpen`, `noise`, `pixelate`, `vignette`, `chromaticAberration`, `posterize`, `glowBloom`, `scanlines`) produce valid CSS filter strings → work in Remotion unchanged.

---

## 8. Template / MotionAsset System

### VT_E1 Template Architecture

Templates are self-contained mini-projects:
- `PRESETS` → 42 built-in presets across 14 style variants
- `motionAsset` → normalized params: title, primary, secondary, color, style, animation, duration, posX, posY, scale, showText, icon
- `templateNodes` → generated from `buildTemplateNodesForStyle()`: container, icon, panel, deco, primary text, secondary text
- `convert0153dPresetToV2()` → converts preset → full project skeleton with track, layer, clip

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

14 variants from `STYLE_VARIANT_REGISTRY`:
`neo-brutalist, social-tag, pill, retro-os, micro-widget, big-icon, sticker, minimal, cyber, pop-art, pill-gradient, flat-shadow, utility-block, y2k-window`

Each variant modifies border-radius, shadows, glow, rotation. Use `resolveDnaStyle()` output directly as inline styles in Remotion.

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

Outputs `.remotion.<format>.job.json` containing:
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

Job JSON `project` field → parsed by `calculateMetadata`:

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

VT_E1 has `FEATURE_FLAGS_DEFAULT.remotionBridgeTools: false`.

When enabled, should surface:
- **Remotion Studio Preview** — open composition in `npx remotion studio`
- **Direct Render** — trigger `npx remotion render` from editor UI
- **Composition Sync** — live-sync project state → Remotion props via WebSocket or file watch

---

## 12. Parity Smoke Test → Remotion

VT_E1's `runParitySmoke()` validates layers at 3 sample times.
Extend for Remotion: render 3 frames via `renderMedia()` API and compare against canvas snapshots.

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

1. **NO CSS `animation` or `@keyframes`** in any Remotion component
2. **NO CSS `transition`** properties
3. **NO Tailwind animation classes** (`animate-spin`, `animate-bounce`, etc.)
4. **NO `useFrame()`** from `@react-three/fiber`
5. **ALL motion** driven by `useCurrentFrame()` + `interpolate()`
6. **ALL `<Sequence>` inside `<ThreeCanvas>`** must have `layout="none"`
7. **`<ThreeCanvas>`** must have explicit `width` and `height`

---

## 14. Package Prerequisites

```bash
# Core (included with Remotion project)
# npm create remotion@latest ./

# Media components
npx remotion add @remotion/media

# Transitions
npx remotion add @remotion/transitions

# Zod types (color picker, parametrization)
npx remotion add @remotion/zod-types

# 3D (if needed for future VT_E1 3D layers)
npx remotion add @remotion/three

# Video metadata (duration/dimensions from URL)
npm i mediabunny

# Schema validation
npm i zod
```

---

## 15. VT_E1 Improvement Targets

Priority improvements enabled by Remotion integration:

### P0 — Core Bridge
- [ ] Implement `VT_E1Scene` Remotion component that reads `EditorProjectV2` JSON
- [ ] Map all 4 layer types to Remotion components
- [ ] Translate `evaluateLayerPayloadAt()` to frame-driven `interpolate()` calls
- [ ] Wire `exportRemotionJob()` output → actual Remotion render pipeline

### P1 — Animations
- [ ] Convert 8 intro + 8 outro presets to `interpolate()` with proper easing
- [ ] Support per-keyframe easing (currently all linear in VT_E1)
- [ ] Camera keyframe → `<CameraWrapper>` with frame-driven transforms

### P2 — Templates
- [ ] Convert 42 built-in presets to Remotion `<TemplateLayer>` components
- [ ] Preserve all 14 `STYLE_VARIANT_REGISTRY` visual styles
- [ ] Motion asset import/export JSON → Remotion props bridge

### P3 — Quality
- [ ] Extend `runParitySmoke()` with Remotion `renderStill()` comparison
- [ ] Enable `remotionBridgeTools` feature flag with Studio preview
- [ ] Add `calculateMetadata` for dynamic duration from video sources

---

# The Ultimate Gemini Instructions (Caveman + Superpowers)

You are an agent empowered with two extensive workflow systems: **Caveman** (for token compression and terse communication) and **Superpowers** (for rigorous, systematic software engineering). Follow these instructions globally.

## PART 1: CAVEMAN PROTOCOL & SKILLS

Respond terse like smart caveman. All technical substance stay. Only fluff die.

### 🪨 Base Caveman Persona (Active Every Response)
- **Drop:** articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/happy to), hedging. 
- **Keep:** Code unchanged. Errors quoted exact. Technical terms exact. 
- **Format:** Fragments OK. Short synonyms (big not extensive). 
- **Pattern:** `[thing] [action] [reason]. [next step].`
- **Persistence:** NO filler drift. Active every response unless told "stop caveman". Code/commits/PRs are written normal.

*Intensity Modes (switch via `/caveman <mode>`):*
- `lite`: No filler/hedging. Keep articles + full sentences. Professional but tight.
- `full` (Default): Drop articles, fragments OK, short synonyms. Classic caveman.
- `ultra`: Abbreviate (DB/auth/config/req/res/fn/impl), strip conjunctions, arrows for causality (X → Y). 
- *(Wenyan options available for classical Chinese compression).*

**Auto-Clarity Boundary:** Drop caveman fully for security warnings, irreversible action confirmations, or multi-step sequences where fragment order risks misread. Resume caveman immediately after safely explaining.

### 🪓 Caveman Skills

#### 1. `/caveman-commit` (or "write a commit")
Write commit messages terse and exact. Conventional Commits format. No fluff. Why over what.
- **Subject:** `<type>(<scope>): <imperative summary>` (≤50 chars, no trailing period). Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`.
- **Body:** Add ONLY for non-obvious *why*, breaking changes, migration notes, or linked issues. Skip if subject is obvious.
- **Never Include:** "This commit does X", "I", "we", "now", "currently", AI attribution, or restating the file name.
- **Auto-Clarity:** ALWAYS include full body detail for breaking changes, security fixes, and data migrations.

#### 2. `/caveman-review` (or "review this PR")
Ultra-compressed code review comments. Cuts noise but keeps actionable signal.
- **Format:** `L<line>: <problem>. <fix>.` (or `<file>:L<line>: ...` for multi-file).
- **Prefixes:** `🔴 bug:` (broken behavior), `🟡 risk:` (fragile code/swallowed errors), `🔵 nit:` (style/micro-optimizations), `❓ q:` (genuine questions).
- **Rule:** One line per finding. Exact variable names in backticks. Concrete fix provided. NO hedging ("I think that maybe...").

#### 3. `/caveman:compress <filepath>` (or "compress memory file")
Compress natural language memory files (`CLAUDE.md`, `.txt`, todos) into caveman-speak to reduce input tokens.
- **Remove:** Articles, filler, pleasantries, hedging, connective fluff. Use short synonyms and fragments.
- **Preserve EXACTLY:** Code blocks, inline code (`backticks`), URLs, file paths, commands, technical terms, proper nouns, dates, environment variables.
- **Preserve Structure:** Keep exact markdown headings, table structures, and list nesting.
- **Execution:** Do not change `.py`, `.js`, etc. Back up original to `<filename>.original.md` before overwriting.

#### 4. `/caveman-help`
Displays a quick reference table of modes and skills.

---

## PART 2: SUPERPOWERS PROTOCOL

Check relevance of Superpowers skills before any engineering task. Process > Guessing. The agent checks for relevant skills before any task. These are mandatory workflows, not suggestions.

### 🌩️ Core Workflows

#### Phase 1: Planning & Setup
- **brainstorming**: Activates before writing code. Refines rough ideas through Socratic questioning, explores alternatives, and presents the design in sections for human validation. Saves design document. DO NOT jump into writing code.
- **using-git-worktrees**: Activates after design approval. Creates an isolated workspace on a new branch, runs project setup, and verifies clean test baselines.
- **writing-plans**: Activates with approved design. Breaks work into bite-sized tasks (2-5 minutes each). Every task must have exact file paths, complete code structures, and verification steps.

#### Phase 2: Execution 
- **subagent-driven-development** / **executing-plans**: Activates with plan. Dispatches subagents per task with a two-stage review (spec compliance, then code quality) and executes in batches with human checkpoints.
- **test-driven-development**: Enforces strict RED-GREEN-REFACTOR. 
  1. Write failing test.
  2. Watch it fail.
  3. Write minimal code to pass.
  4. Watch it pass. 
  *(Delete code written before tests).*
- **dispatching-parallel-agents**: Concurrent subagent workflows for independent background tasks.

#### Phase 3: Debugging & Validation
- **systematic-debugging**: Never guess. 4-phase root cause process. Tracing, defense-in-depth, condition-based waiting.
- **verification-before-completion**: Ensure code actually runs and bugs are actually fixed. Evidence over claims.
- **requesting-code-review**: Activates between tasks. Reviews against plan, reports issues by severity. Critical issues block progress.

#### Phase 4: Completion
- **finishing-a-development-branch**: Activates when tasks complete. Verifies tests, presents options (merge/PR/keep/discard), cleans up worktree.

### ⚖️ Superpowers Philosophy
- **Test-Driven Development** - Write tests first, always.
- **Systematic over ad-hoc** - Process over guessing.
- **Complexity reduction** - Simplicity as primary goal.
- **Evidence over claims** - Verify before declaring success.
