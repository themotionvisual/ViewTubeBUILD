# ViewTube Video Editor — Complete System Resource, Architecture Reference & Audit

**Audit date:** 2026-09-21  
**Repository:** `themotionvisual/ViewTubeBUILD`  
**Audited baseline:** `main` at the time this document was created  
**Audience:** developers, coding agents, AI agents, reviewers, maintainers, designers, QA, deployment operators  
**Status:** authoritative orientation document. Code remains the source of truth when this document and implementation disagree.

---

# 1. Executive summary

ViewTube's video editor is not one isolated React component. It is a multi-surface editing system with:

1. a canonical desktop editor in `src/features/editor/VT_E1.jsx`;
2. a touch-first mobile editor in `src/features/editor/mobile/`;
3. a shared VT_E1 project/timeline contract;
4. a desktop/mobile project bridge and adapter;
5. shared template, graphic, SVG, background and Remotion asset libraries;
6. a browser preview layer;
7. a canonical Remotion final-render composition;
8. a same-origin render API/proxy;
9. a long-running Node/Chromium/FFmpeg render worker;
10. MP4, MOV and WebM output support when FFmpeg is available;
11. project import/export/save/load systems;
12. timeline, keyframe, transition, compound-clip, effects and template systems;
13. mobile-specific touch primitives, command palette, context trays and interactive guidance.

The most important architectural rule is:

> **Do not create a second editor engine, project model, timeline model or render model.**

Desktop and mobile may have different interfaces, but they exchange one compatible VT_E1 project document. Mobile UI state can remain mobile-specific; project data must remain canonical and bridge-compatible.

The system has matured rapidly, but documentation and registries have not all caught up. The audit found several important authority conflicts:

- `src/features/editor/mobile/README.md` still says the desktop bridge adapter is pending, while the newer bridge handoff and implementation show that desktop ↔ mobile project continuity is implemented.
- `editorCapabilities.ts` still labels several implemented effects as `planned`.
- The mobile primitive authority says empty tracks compact and selected/keyframed tracks expand, while the current desired timeline behavior is fixed row height whether empty or occupied.
- Some newer mobile modules use the ViewTube teal/cyan primitive system while older controls still contain literal black borders/text.
- Template browsers are functionally rich but some menus still communicate templates through icon/title cards instead of rendering the actual template visual. The custom-template menu should use visual thumbnails/previews as its primary representation.
- Preview and final render have increasing parity, but every new visual property/effect must still be explicitly checked in both paths.

These conflicts should be treated as cleanup targets, not as permission to create parallel systems.

---

# 2. System map

The editor can be understood as the following pipeline:

```
EditorV1Page
  |
  +-- Desktop / classic surface
  |     |
  |     +-- VT_E1.jsx
  |     +-- useDesktopProjectBridge
  |
  +-- Responsive / mobile surface
        |
        +-- MobileEditor / ResponsiveEditorShell
        +-- EditorStore (mobile interaction state + canonical project)
        +-- MobileWorkspaceLayout
              |
              +-- PreviewPane / MobileProjectPreview
              +-- EditorNavigationPages
              +-- TimelineStrip
              +-- TimelineMiniMap
              +-- Command palette / context trays / guide

Desktop project <--> editorProjectBridge <--> mobile project
                           |
                           v
                    VtE1Project contract
                           |
             +-------------+-------------+
             |                           |
             v                           v
       browser preview              render job
                                         |
                                         v
                              /api/vt-e1/render
                                         |
                                         v
                              VT_E1 render worker
                                         |
                                  Remotion VTE1Renderer
                                         |
                                         v
                                   canonical MP4
                                         |
                               FFmpeg transcode
                                  /          \
                                MOV          WebM
```

---

# 3. Primary ownership boundaries

## 3.1 Route / host ownership

**Primary host:** `src/views/EditorV1Page.tsx`

Responsibilities include:

- selecting the editor frontend;
- selecting phone layout/orientation behavior;
- owning the mobile store for the lifetime of the route;
- seeding mobile from the shared bridge;
- publishing mobile project changes back to the bridge;
- hosting the desktop VT_E1 editor when the desktop/classic frontend is active;
- exposing editor UI/style preferences;
- providing site navigation/back behavior.

An agent changing editor-host behavior should inspect `EditorV1Page.tsx` before touching either editor implementation.

## 3.2 Desktop editor ownership

**Canonical desktop implementation:** `src/features/editor/VT_E1.jsx`

VT_E1 remains the owner of desktop:

- project state;
- timeline behavior;
- history;
- autosave;
- rendering integration;
- transitions;
- templates;
- project mutation;
- desktop-specific fields and workflows.

Do not fork or duplicate VT_E1 to add a mobile feature.

## 3.3 Mobile editor ownership

**Mobile root:** `src/features/editor/mobile/MobileEditor.tsx`  
**State:** `src/features/editor/mobile/state/editorState.ts`  
**Workspace:** `src/features/editor/mobile/layouts/MobileWorkspaceLayout.tsx`

The mobile editor owns touch-first presentation/interactivity state such as:

- playhead;
- playing state;
- playback rate;
- zoom;
- selection;
- active page/tool;
- workspace visibility/focus;
- mobile undo/redo behavior;
- touch gestures;
- mobile UI preferences.

Project/timeline content must remain compatible with the shared VT_E1 contract.

---

# 4. Canonical project and timeline data

## 4.1 Shared contract

**Authority:** `src/shared/vtE1TimelineContract.d.ts`

All editing surfaces should ultimately speak in terms of the shared VT_E1 project/clip/transition contract.

The project contains the timeline's durable edit state. Mobile extends the compatible document with tracks, layers and duration information where required, but should not invent a separate persisted timeline format.

## 4.2 Desktop/mobile adapter

**Files:**

- `src/features/editor/editorDesktopProjectAdapter.ts`
- `src/features/editor/editorDesktopBridgeRuntime.ts`
- `src/features/editor/editorProjectBridge.ts`
- `src/features/editor/useDesktopProjectBridge.ts`

The adapter maps desktop tracks into the mobile vocabulary:

- `video`
- `audio`
- `overlay`
- `caption`

It preserves desktop-specific information such as original track kind and visibility so a mobile round trip does not unnecessarily destroy desktop data.

The bridge snapshot contract is versioned:

- storage key: `viewtube.editor.project-bridge.v1`
- event: `viewtube:editor-project-bridge`
- version: `1`
- sources: `mobile | desktop`

Bridge transport currently uses localStorage plus a custom browser event/storage event. This is a synchronization mechanism, not a server-side collaborative document store.

## 4.3 Bridge behavior

Current intended round trip:

1. Desktop edits publish a `desktop` snapshot.
2. Mobile seeds from the latest compatible project.
3. Mobile edits publish a `mobile` snapshot.
4. Desktop applies only newer mobile snapshots.
5. The desktop adapter merges mobile changes with desktop-only fields.
6. Project fingerprints/timestamps suppress stale or equivalent loops.

### Audit finding

`src/features/editor/mobile/README.md` is stale where it says desktop adapter/apply are pending. `docs/EDITOR_DESKTOP_PROJECT_BRIDGE_HOOK_HANDOFF.md` and the current implementation show that this phase has been implemented. Update or retire the stale section.

---

# 5. Mobile EditorStore

**Authority:** `src/features/editor/mobile/state/editorState.ts`

This is the mobile manifestation of editor state and project mutation. It is not permission to invent a second persisted project format.

Important areas include:

- project normalization;
- tracks;
- layers;
- clips;
- transitions;
- selection;
- playhead;
- playback;
- zoom;
- undo/redo;
- linked layer payloads;
- visual transform updates;
- keyframe insertion/update;
- clip duplication;
- deletion/orphan cleanup;
- grouping;
- compound/combine behavior;
- track controls;
- timeline mutation.

When adding an editor command, prefer adding one canonical store action and making all UI surfaces call it rather than embedding mutation logic in buttons.

---

# 6. Layers and payloads

The layer payload is the primary visual/content property bag used by preview and render paths.

Common payload properties include:

- `layerName`
- `x`, `y`
- `scale` and/or axis scale values
- `rotation`
- `opacity`
- `width`, `height`
- `fontSize`, `fontFamily`
- `fillColor`, `strokeColor`, `strokeWidth`
- `cornerRadius`
- `blur`
- `saturation`
- `brightness`
- `hue`
- media URL/name/fit information
- audio volume/mute/rate data
- template data/overrides
- generated/Remotion asset metadata
- effect ordering/bypass metadata.

### Rule

A new visual property is not complete when it only appears in an inspector. It must be traced through:

```
control -> store/project -> preview evaluation -> bridge -> Remotion renderer -> export
```

If keyframeable, also trace:

```
property -> keyframe values -> interpolation -> preview -> render
```

---

# 7. Keyframe system

Keyframes live on clips and use local clip time offsets.

The editor currently supports:

- insertion/update at the playhead;
- visible timeline keyframes;
- circle and compound/diamond forms;
- selection;
- dragging in time;
- duplication;
- deletion;
- interpolation assignment;
- property evaluation in Preview;
- property evaluation in Remotion.

Interpolation vocabulary includes modes such as:

- linear;
- ease-in;
- ease-out;
- ease-in-out;
- springy;
- bell.

Agents must not implement a mobile-only interpolation engine that diverges from the final renderer. Preview approximations must be documented when exact parity is not possible.

---

# 8. Timeline system

**Primary mobile file:** `src/features/editor/mobile/components/TimelineStrip.tsx`

Related systems include the timeline minimap, shared timeline contract, compound-clip helpers and transition systems.

Timeline responsibilities include:

- track rows;
- clip blocks;
- playhead;
- move;
- trim;
- split;
- duplicate;
- delete/ripple delete;
- multi-selection;
- long-press additive selection;
- grouping/ungrouping;
- combining/uncombining;
- snapping;
- track mute/lock/hide/remove;
- track reorder;
- keyframe lanes;
- timeline zoom;
- timeline scrub controls;
- context menus;
- compound clip navigation;
- overlap feedback;
- clip colors.

## 8.1 Touch ownership

The intended touch model is:

- clip center owns move;
- clip edge zones own trim;
- dedicated grip owns track reorder;
- long press owns additive selection/context behavior;
- timeline background owns seeking/empty-context actions;
- keyframe points own keyframe drag;
- minimap owns global viewport movement;
- scrub strip owns precision seeking.

Avoid overlapping gesture ownership.

## 8.2 Current row-height requirement

The latest product requirement is that timeline rows remain the same height whether empty or occupied. Adding a clip must not expand a track and move the rest of the timeline.

This supersedes the older primitive document wording that says empty rows compact and active/keyframed rows expand. Update the primitive authority after the implementation is finalized.

## 8.3 Left controls

Track buttons must stay inside the track-label rail and must never extend into clip time space. The label rail and time canvas should be treated as separate geometry.

---

# 9. Mobile workspace/layout system

**Authority:** `src/features/editor/mobile/layouts/MobileWorkspaceLayout.tsx`

The mobile workspace composes:

- Preview;
- settings/navigation page;
- page-navigation row;
- action row;
- timeline;
- minimap;
- workspace presets;
- optional resize dividers.

The editor supports portrait and landscape phone orientations plus portrait/landscape video aspect ratios.

## 9.1 Containment

Modules must remain inside the phone viewport. Oversized content scrolls inside its module, not by expanding the page.

Ordinary settings pages should not require horizontal scrolling.

## 9.2 Preview geometry

The Preview module must aspect-fit the actual video canvas.

Supported core ratios include:

- 9:16 portrait;
- 16:9 landscape.

The canvas should consume the largest possible area while preserving its composition aspect ratio and leaving room for the Preview's own transport controls.

Do not make the Preview canvas small merely because the module container is large. Do not stretch the visible Preview module to a ratio that visually implies a different composition ratio.

## 9.3 Module dragging

Module resize/drag affordances should be hidden in normal editing. They should appear only when the user explicitly enables module dragging in Settings.

The preference belongs to mobile UI preferences, not the project document.

---

# 10. Preview and direct manipulation

**Files:**

- `src/features/editor/mobile/components/PreviewPane.tsx`
- `src/features/editor/mobile/components/MobileProjectPreview.tsx`

Preview responsibilities include:

- composition display;
- playhead-aware active clip rendering;
- text;
- shapes;
- images;
- video;
- templates;
- generated/Remotion assets where supported;
- keyframed transforms;
- effect/filter evaluation;
- direct manipulation;
- interaction frame;
- motion paths;
- transport controls.

## 10.1 Interaction frame

The selected visual's interaction frame must follow:

- position;
- scale;
- rotation;
- visual dimensions.

It must not remain at untransformed source geometry.

## 10.2 Preview transport

Play, rewind/step/forward and snap-back style Preview controls belong below the canvas inside the Preview module. Avoid showing the same primary playback command simultaneously in unrelated control rows.

## 10.3 iOS interaction safety

Touch controllers should suppress browser-native interference:

- `user-select: none`
- `-webkit-user-select: none`
- `-webkit-touch-callout: none`
- transparent tap highlight where appropriate
- `touch-action` scoped to the gesture.

Do **not** globally disable selection for actual text-editing inputs/areas. The suppression belongs on controls, timeline objects, Preview manipulation handles and draggable surfaces.

---

# 11. Mobile primitive system

**Code authority:** `src/features/editor/mobile/components/MobileEditorPrimitives.tsx`  
**Documentation:** `docs/editor/MOBILE_EDITOR_PRIMITIVES_AND_TOUCH_CONTROLS_2026-09-19.md`

Core tokens:

- structural ink: `#248b99`
- cyan: `#36E0F6`
- yellow: `#FFFF61`
- destructive pink: `#FA618A`
- green: `#4EE4BE`
- blue: `#528FFA`
- orange: `#FF9B54`
- purple: `#C86BFA`
- standard radius: ~6px
- standard component stroke: ~2px
- compact component height: ~28px.

Core primitives:

### AcceleratingStepper
Use instead of mobile sliders/numeric text boxes for ordinary numeric adjustment.

- tap = one increment;
- hold = accelerating repeat;
- hold + vertical drag = precision/speed modulation;
- double tap center = reset;
- colored button ends;
- optional keyframe state.

### MobileIconButton
Compact icon-only action.

### LinkToggle
Links paired values such as Scale X/Y or Width/Height.

### XYJoystick
Direct X/Y manipulation.

### RotationDial
Direct rotation manipulation.

### MobileSection / mobilePanel / mobileButton
Base compound-component assembly.

### Audit finding

Some legacy mobile components still use literal `#111`/black borders or text. New work should use the token authority unless the black has an explicit visual purpose.

---

# 12. Navigation and pages

**Authority:** `src/features/editor/mobile/components/EditorNavigationPages.tsx`

Current navigation vocabulary:

- Project
- Clips
- Inspect
- Text
- Audio
- Graphics
- Effects
- Transitions
- Templates
- Custom
- Export
- Settings

The navigation row should maximize available page space and avoid duplicated actions.

## 12.1 Project

Project settings should cover:

- new project;
- save;
- load;
- import;
- project metadata;
- duration/aspect settings where appropriate;
- project document movement without creating a parallel schema.

## 12.2 Clips

**Authority:** `ClipSettingsPanel.tsx`

Clip creation types include:

- text;
- shape;
- image;
- video;
- audio;
- template.

The Clips page also exposes timing, transform, appearance and context-specific controls.

## 12.3 Inspect

The Inspector handles selected clip/track/transition state and transform/crop editing.

## 12.4 Graphics & SVG

Uses the shared template/design library rather than a disconnected mobile-only asset collection.

## 12.5 Effects

Uses `EffectsLibrariesPanel.tsx` and the shared Remotion asset registry/effect rack.

## 12.6 Templates and Custom Templates

Template clips remain canonical timeline clips and can carry template definition/override data.

## 12.7 Export

Uses the render-job client/worker path described below.

---

# 13. Template and design library

Important files include:

- `src/features/editor/mobile/components/TemplateLibraryPanel.tsx`
- `src/features/editor/mobile/components/CustomTemplatePanel.tsx`
- `src/editor-design-library/catalog.ts`
- `src/editor-design-library/core/schema.ts`
- `src/editor-design-library/integration/timelineAdapter.ts`
- `src/editor-design-library/integration/remotionAssetAdapter.ts`
- `src/editor-design-library/integration/legacyTemplateAliases.ts`

Template categories include design compositions, graphics/SVG and backgrounds/patterns/gradients depending on catalog entries.

Templates should be inserted into the timeline through the adapter/canonical clip path rather than existing only as UI cards.

## 13.1 Custom template editing

The custom-template editor supports editable elements and overrides. It can target an element from a visual preview and expose matching controls.

Template overrides may include:

- text/content;
- colors;
- icon substitutions;
- element-level customization.

## 13.2 Required visual-browser correction

The custom-template selection menu should be **visual-first**.

For example:

- a gradient template card should show the actual gradient;
- a pattern should show the actual pattern;
- a title composition should show a miniature rendered title;
- an icon composition should show its actual icon arrangement.

An icon plus the text `ViewTube Gradient 3` is insufficient as the primary browser representation.

Recommended card anatomy:

```
[ rendered miniature / live thumbnail ]
[ optional compact name ]
```

The thumbnail should be generated from the same template definition/catalog data used when the template is inserted. Avoid manually maintained screenshots that can drift from the template.

---

# 14. Remotion asset library

**Primary registry:** `src/remotion-editor/src/assets/catalog.ts`  
**Exports:** `src/remotion-editor/src/assets/index.ts`  
**Validation:** `src/remotion-editor/src/assets/validation.ts`

The system contains a reusable Remotion-first visual asset library, including static and motion compositions.

Asset concepts include:

- IDs;
- names;
- type: static/motion;
- category;
- tags;
- renderer;
- thumbnail/preview metadata;
- fps;
- duration;
- looping;
- motion intensity;
- transparency;
- supported ratios;
- controls/schema;
- recommended uses.

The mobile Effects browser consumes this shared registry rather than inventing a second effect catalog.

Browser functionality includes:

- search;
- static/motion filter;
- category filter;
- favorites;
- recents;
- visual previews.

---

# 15. Effects system

**Mobile UI:** `EffectsLibrariesPanel.tsx`

The current effects model combines renderer-backed payload properties and shared Remotion visual assets.

The ordered FX rack supports:

- master bypass;
- per-effect disable/bypass;
- effect ordering;
- reusable FX presets.

Renderer-backed filter properties include:

- blur;
- saturation;
- brightness;
- hue;
- opacity handling.

The payload uses concepts such as:

- `fxBypass`
- `fxDisabled`
- `fxOrder`

Both mobile Preview and Remotion final render must interpret these consistently.

### Audit finding

`editorCapabilities.ts` still labels `effects.color` and `effects.blur` as planned even though the newer effect rack implements color/filter functionality. The registry should be reconciled with reality.

---

# 16. Transitions

Transitions belong to the shared project/timeline system.

Related code includes shared transition contracts/presentations and desktop VT_E1 transition behavior.

Mobile supports add/remove and transition editing entry points.

Important export caveat: the SVG exact-frame rendering lane currently does not claim transition parity. Canonical Remotion is the final-video path.

---

# 17. Grouping and compound clips

The editor distinguishes lightweight grouping from combining/compound behavior.

Shared helper:

- `src/shared/vtE1CompoundClips.js`

Mobile timeline/store supports:

- multi-selection;
- group;
- ungroup;
- combine;
- uncombine;
- compound navigation.

Do not represent a compound clip as an irreversible destructive flatten unless explicitly requested. Preserve source editability and renderer compatibility.

---

# 18. Command palette and context trays

**Command palette:** `MobileCommandPalette.tsx`  
**Context menu:** `ContextMenu.tsx`

The command palette is the global searchable shortcut surface. It reduces the need for permanent toolbar duplication.

Context trays should be object-specific:

- clip;
- empty timeline;
- track;
- keyframe;
- Preview;
- template element.

Only actions meaningful to the pressed target should appear.

---

# 19. Touch guide and interactive coach

Files include:

- `TouchEditorGuide.tsx`
- `EditorCoachOverlay.tsx`

The static guide is the reference manual inside the product.

The interactive coach highlights real editor modules through stable `data-guide-id` targets.

Any major new touch gesture should be added to one or both guidance systems.

---

# 20. Rendering architecture

The final render path is deliberately separate from the browser Preview.

## 20.1 Browser client

**Contract/client:** `src/features/editor/render/renderJobContract.ts`

The browser calls same-origin:

`/api/vt-e1/render`

Do not point browser code directly at a worker hostname or localhost.

Client operations include:

- health;
- capabilities;
- create render job;
- poll/get render job;
- download URL;
- wait with progress callback/abort support.

## 20.2 Proxy

**Path:** `api/vt-e1/render/_proxy.mjs` and related route files.

The web deployment proxies render requests to the dedicated worker. Shared secrets remain server-side.

## 20.3 Worker

**Authority:** `src/server/vt-e1-render-server.mjs`

Worker responsibilities include:

- validation;
- job creation;
- persistent job records;
- queueing;
- recovery of interrupted rendering jobs;
- asset staging;
- Remotion execution;
- FFmpeg availability checks;
- output transcoding;
- output/download handling;
- readiness/capability reporting.

Deployment resources:

- `docker/vt-e1-render-worker.Dockerfile`
- `render-worker.env.example`
- `docs/vt-e1-render-worker.md`

The worker expects durable storage, Chromium/Remotion dependencies and FFmpeg.

---

# 21. Export formats

**Canonical final format:** MP4.

When FFmpeg is installed, supported final formats are:

- MP4;
- MOV;
- WebM.

The worker renders canonical Remotion MP4 first, then uses FFmpeg for MOV/WebM transcoding.

The worker capability response is authoritative for what is actually available on a deployment.

Do not advertise MOV/WebM solely because the UI offers a button; check worker readiness/capabilities.

Other formats such as GIF, PNG sequence and WAV are currently outside the supported final-format contract.

---

# 22. Remotion final renderer

**Authority:** `src/remotion-editor/src/Composition.tsx`

The canonical composition ID used by the worker is:

`VTE1Renderer`

The composition evaluates project clips/layers and keyframes at render time.

Important renderer responsibilities include:

- media;
- audio;
- text;
- shapes;
- SVG overlays;
- generative shapes;
- Remotion asset clips;
- transform;
- opacity;
- crop/fit where supported;
- filter stack;
- keyframe interpolation;
- Shorts extractor rendering paths;
- project timing.

The renderer includes FX ordering/bypass logic. Any new Preview effect must be added here before it can be considered export-complete.

---

# 23. SVG frame lane

The worker also contains an SVG-frame utility lane.

This is **not** the canonical final-video engine.

The exact SVG policy has stricter limitations. The worker explicitly validates unsupported cases and may require Remotion fallback.

Current important limitations include:

- transitions are not exact-SVG render-safe;
- some overlay FX require fallback;
- Remotion asset clips require the Remotion path;
- blocked/local blob/data URLs must be staged or rejected.

---

# 24. Media URLs and persistence

Browser media import may use `URL.createObjectURL` for immediate editing.

This is convenient but session-local. Blob URLs are not durable project assets and cannot be assumed to survive reload/export/worker rendering.

Before final render, media must have a stable URL or be staged into the render worker's accessible asset storage.

An agent implementing persistent project saving should explicitly distinguish:

- editor-session object URL;
- durable Vault/storage asset;
- render-worker staged asset.

---

# 25. Project persistence

There are multiple persistence concerns and they must not be conflated:

1. **Editor project document** — clips/layers/tracks/transitions.
2. **Desktop/mobile bridge snapshot** — local synchronization transport.
3. **UI preferences** — device-local layout/labels/presets.
4. **User control/FX presets** — local reusable configuration.
5. **Media assets** — durable external/staged files.
6. **Render jobs/results** — worker-side job/storage records.

Do not store large media blobs inside the bridge snapshot.

---

# 26. Capability registry

**File:** `src/features/editor/editorCapabilities.ts`

This registry describes feature categories and status:

- active;
- available;
- planned.

It covers edit, media, text, audio, transitions, effects, templates, export and settings.

### Audit finding

The registry is useful but stale in places. It must not be treated as stronger evidence than working implementation. Reconcile statuses whenever a feature graduates from planned/available to active.

---

# 27. Current design system

The mobile editor is neo-brutalist / ViewTube-specific rather than generic iOS chrome.

Key rules:

- teal ink instead of black as the default structural stroke;
- cyan as primary active state;
- purposeful secondary color pops;
- compact controls;
- heavy typography;
- hard borders;
- modest radii;
- dense grid alignment;
- iconography instead of emoji;
- controls fill their allotted space;
- avoid tiny text floating in large empty controls;
- avoid unnecessary horizontal scrolling;
- visual assets/templates should be represented visually.

Do not replace the system with generic Material, Bootstrap or stock Tailwind styling.

---

# 28. Testing and verification

Editor changes should be verified at multiple levels.

## Unit/contract tests

Important test families include:

- project bridge;
- desktop project adapter;
- desktop bridge hook;
- timeline/store mutations;
- template adapters;
- render job contracts;
- component contracts.

## Build gates

Typical repository release gates include:

- production build;
- typecheck/static quality;
- focused contracts;
- full Vitest suite;
- source governance;
- local Playwright smoke.

A repository-wide failure outside editor code should be reported separately from an editor regression.

## Visual acceptance

Mobile UI work is not visually proven merely because TypeScript compiles.

Minimum phone evidence should include approximately:

- portrait phone: 390×844;
- landscape phone: 844×390;
- 9:16 composition;
- 16:9 composition.

Capture important states:

- no selection;
- selected clip;
- populated timeline;
- empty timeline;
- keyframes;
- template browser;
- effects;
- export;
- portrait and landscape.

---

# 29. Known documentation/implementation conflicts

## Conflict A — mobile README bridge status
The mobile README says desktop bridge work is pending. Newer implementation and bridge handoff show it is implemented.

**Action:** update README.

## Conflict B — timeline row behavior
The primitive authority says empty tracks compact and active tracks expand. Current product direction requires fixed row height empty or occupied.

**Action:** change the authority after the fixed-height behavior is merged/verified.

## Conflict C — capability statuses
Effects are partially/meaningfully implemented while registry entries still say planned.

**Action:** audit every capability against actual code.

## Conflict D — black styling
The primitive authority says teal ink is the default structural stroke, but older components still use literal black.

**Action:** migrate opportunistically; do not perform blind global replacement where black is content/style rather than UI structure.

## Conflict E — template browser representation
Template menus can still be label/icon dominant.

**Action:** use rendered miniatures/live thumbnails derived from template definitions.

---

# 30. High-priority technical debt / next work

1. Reconcile stale editor documentation and capability statuses.
2. Make template and custom-template browsers visual-first.
3. Complete fixed-height timeline-row behavior and ensure label controls never overlap time space.
4. Verify Preview canvas maximizes its module while preserving composition ratio.
5. Keep module-resize handles hidden unless explicitly enabled.
6. Finish iOS selection/callout suppression on all manipulation surfaces without breaking text editing.
7. Audit Preview ↔ Remotion parity property-by-property.
8. Replace remaining session-only media assumptions with durable Vault/staging paths.
9. Expand tests for keyframe drag/interpolation, compound clips, FX order/bypass and template overrides.
10. Add visual regression captures for core phone layouts.
11. Reconcile desktop and mobile feature manifests.
12. Keep render capability UI driven by worker capability response.
13. Verify MOV/WebM transcoding on deployed worker, not just locally.
14. Audit transitions through Preview and final Remotion render.
15. Keep one canonical command per action and remove duplicate visible controls.

---

# 31. File map for agents

## Host and editor selection
- `src/views/EditorV1Page.tsx`
- `src/features/editor/editorFrontendMode.ts`
- `src/features/editor/index.ts`

## Desktop editor
- `src/features/editor/VT_E1.jsx`
- `src/features/editor/VT_E1.css`
- `src/features/editor/VT_E1.portrait-workspace.css`

## Shared project bridge
- `src/features/editor/editorProjectBridge.ts`
- `src/features/editor/editorDesktopProjectAdapter.ts`
- `src/features/editor/editorDesktopBridgeRuntime.ts`
- `src/features/editor/useDesktopProjectBridge.ts`

## Shared timeline/compound model
- `src/shared/vtE1TimelineContract.d.ts`
- `src/shared/vtE1CompoundClips.js`
- `src/shared/vtE1Shorts.ts`

## Mobile shell/state
- `src/features/editor/mobile/MobileEditor.tsx`
- `src/features/editor/mobile/state/editorState.ts`
- `src/features/editor/mobile/hooks/`
- `src/features/editor/mobile/layouts/`

## Mobile core UI
- `MobileWorkspaceLayout.tsx`
- `PreviewPane.tsx`
- `MobileProjectPreview.tsx`
- `TimelineStrip.tsx`
- `TimelineMiniMap.tsx`
- `EditorNavigationPages.tsx`
- `ClipSettingsPanel.tsx`
- `MobileEditorPrimitives.tsx`
- `ContextMenu.tsx`
- `MobileCommandPalette.tsx`
- `TouchEditorGuide.tsx`
- `EditorCoachOverlay.tsx`

## Mobile feature pages
- `ProjectSettingsPanel.tsx`
- `TemplateLibraryPanel.tsx`
- `CustomTemplatePanel.tsx`
- `EffectsLibrariesPanel.tsx`
- `ExportRenderPanel.tsx`
- `PanelBodies.tsx`

## Capability/feature descriptions
- `src/features/editor/editorCapabilities.ts`
- `src/features/editor/mobile/components/EditorFeatureManifest.tsx`
- `src/features/editor/mobile/components/EditorControlManifest.tsx`

## Design/template system
- `src/editor-design-library/catalog.ts`
- `src/editor-design-library/core/schema.ts`
- `src/editor-design-library/core/validateTemplate.ts`
- `src/editor-design-library/integration/timelineAdapter.ts`
- `src/editor-design-library/integration/remotionAssetAdapter.ts`
- `src/editor-design-library/integration/legacyTemplateAliases.ts`

## Remotion assets
- `src/remotion-editor/src/assets/catalog.ts`
- `src/remotion-editor/src/assets/index.ts`
- `src/remotion-editor/src/assets/validation.ts`
- `src/remotion-editor/src/assets/AssetGallery.tsx`
- `src/remotion-editor/src/assets/AssetContactSheet.tsx`

## Final renderer
- `src/remotion-editor/src/Composition.tsx`

## Render client/worker
- `src/features/editor/render/renderJobContract.ts`
- `api/vt-e1/render/`
- `src/server/vt-e1-render-server.mjs`
- `docker/vt-e1-render-worker.Dockerfile`
- `render-worker.env.example`
- `docs/vt-e1-render-worker.md`

## Editor authority docs
- `docs/editor/MOBILE_EDITOR_WORKSPACE_REPAIR_2026-09-18.md`
- `docs/editor/MOBILE_EDITOR_PRIMITIVES_AND_TOUCH_CONTROLS_2026-09-19.md`
- `docs/EDITOR_DESKTOP_PROJECT_BRIDGE_HOOK_HANDOFF.md`

---

# 32. Safe modification workflow for developers and AI agents

Before editing:

1. Fetch current `main`.
2. Identify the owning file/system from the map above.
3. Search for prior art before creating a new component.
4. Confirm whether the requested value is project state, UI state, asset state or render state.
5. Confirm the shared contract before changing data shape.
6. Create a branch.
7. Make the smallest coherent change.

During implementation:

1. Reuse the canonical store action.
2. Reuse mobile primitives.
3. Avoid duplicate visible controls.
4. Keep touch ownership unambiguous.
5. Keep project mutations bridge-compatible.
6. Add Preview support.
7. Add Remotion support when output changes.
8. Add worker support if render protocol/output changes.
9. Update guidance for new gestures.
10. Update capability/status documentation.

Before merge:

1. Typecheck/build.
2. Run focused editor contracts.
3. Run relevant full tests.
4. Test portrait/landscape.
5. Test 9:16/16:9.
6. Test iOS touch behavior for mobile interaction changes.
7. Capture built UI.
8. Compare Preview with rendered output for visual changes.
9. Verify worker capabilities for export changes.
10. Record known unrelated failures separately.

---

# 33. Rules that prevent architectural regression

Never:

- fork VT_E1 to implement a mobile feature;
- create a second persisted timeline schema;
- create a mobile-only render format;
- treat localStorage bridge snapshots as durable cloud project storage;
- put browser blob URLs into a render job and assume the worker can read them;
- implement a visual effect only in Preview;
- implement an output-affecting property only in the inspector;
- make template cards manually diverge from their actual definitions;
- duplicate play/undo/delete controls across every module;
- use emoji as editor icons;
- allow workspace modules to force the phone page wider than the viewport;
- make resize handles permanently obstruct content;
- globally disable text selection in actual text editors;
- claim MOV/WebM support without worker capability evidence.

Prefer:

- one canonical project;
- one canonical action per mutation;
- shared adapters;
- shared template/asset registries;
- visual template thumbnails;
- touch primitives;
- explicit capability reporting;
- built-app visual evidence;
- incremental branch/PR work.

---

# 34. Definition of done for an editor feature

A feature is complete only when the applicable chain is complete.

## UI-only feature
- correct component;
- correct tokens/primitives;
- touch behavior;
- orientation/layout;
- accessibility;
- no duplicate controls;
- visual verification.

## Project-edit feature
All UI-only requirements plus:
- canonical store action;
- project persistence;
- undo/redo;
- desktop/mobile bridge preservation;
- import/export preservation.

## Visual/output feature
All project-edit requirements plus:
- browser Preview;
- keyframe behavior if animatable;
- Remotion renderer;
- render worker acceptance;
- exported-file verification.

## Asset/template feature
All relevant requirements plus:
- shared catalog registration;
- visual browser thumbnail;
- timeline insertion;
- editable overrides;
- Preview;
- final render.

---

# 35. Current architectural verdict

The editor now has the right broad architecture: **one compatible project model, two specialized interfaces, a shared asset/template ecosystem and a canonical Remotion render path**.

The highest risk is no longer lack of features. It is divergence: stale docs, stale capability labels, duplicate UI concepts, Preview/render mismatch, and older components that predate the newer mobile primitive authority.

Future work should therefore favor consolidation and parity over new parallel subsystems.

For an AI agent entering the repository, the safest first question is not “where can I add this?” but:

> **Which existing owner already represents this concept, and what complete path does it take from UI to project to Preview to final render?**

That question should govern every editor change.
