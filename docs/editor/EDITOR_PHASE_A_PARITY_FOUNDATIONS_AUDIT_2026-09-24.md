# ViewTube Editor Phase A — Parity Foundations Audit

**Status:** active implementation audit  
**Date:** 2026-09-24  
**Audited main:** 2ce55f065af83369bffcd5c1a3b73869bcc9dc24  
**Current implementation branch:** feat/editor-phase-a-visual-frame-parity-v2-2026-09-24  
**Transition/project-bridge slice merged:** PR #405 → 052ff0294b5f8c9b05867a85ab4e2d407a27ec06  
**Shared FX slice merged:** PR #408 → 56e2c0c03f83a168bf385dd2f71d32bc87166d08  
**Rich project parity slice merged:** PR #410 → 4719274d63f37f2164c67641eb885de6104afdba  
**Parent authority:** docs/editor/VIEWTUBE_YOUTUBE_EDITOR_SYSTEM_MASTER_RESOURCE.md

## Purpose

Phase A makes desktop/mobile project semantics and preview/final-render behavior truthful before the Brain assistant or generative-media workflows are allowed to mutate editor state.

The working rule is:

> Shared IDs, shared project identity, shared timeline math, shared transition frame math, and explicit capability truth. Layout may adapt; semantics may not fork.

## Verified current architecture

### Capability registry

Current source already has a central editor capability registry at:

- src/features/editor/editorCapabilities.ts

It distinguishes `active`, `available`, and `planned` capabilities and is already consumed by mobile feature/control manifests. This is the correct seed for the shared capability contract; Phase A should strengthen it rather than create a second registry.

### Timeline math

Desktop and mobile already share canonical timeline operations through:

- src/shared/vtE1TimelineOperations.js
- src/features/editor/shared/desktopTimelineAdapter.js
- src/features/editor/mobile/state/editorState.ts

Split, slip, slide, and ripple-delete already have shared timeline math. Desktop and mobile still have different host/state presentation layers, so parity must be proven at serialization/action boundaries.

### Project bridge

Existing bridge stack:

- src/features/editor/editorProjectBridge.ts
- src/features/editor/editorDesktopProjectAdapter.ts
- src/features/editor/editorDesktopBridgeRuntime.ts

The bridge already preserved clips, transitions, tracks, layers, seam links, and broad unknown project fields, but two gaps were found:

1. desktop layers were typed too loosely for `useEditorState()`, producing a current TypeScript mismatch at the mobile seed boundary;
2. the bridge fingerprint only considered clip timing, coarse track flags, duration, and transition seam timing, so a transition style, layer payload, transform, keyframe, or other project edit could be incorrectly treated as equivalent and skipped.

This branch normalizes mobile bridge layers and fingerprints the complete JSON-safe project state.

### Transition system

Before this branch, transition vocabulary was split across at least five owners:

- mobile add-transition UI: cut/fade/crossfade/slideLeft/slideRight/wipeLeft/wipeRight/zoom
- mobile control manifest: Fade/Slide/Wipe/Iris/Flip/Clock
- browser transition presentation layer: fade/slide/wipe/iris/flip/clock-wipe
- final Remotion composition: cut/fade/crossfade/slide/slideLeft/slideRight/wipeLeft/wipeRight/zoom
- render worker validation: another hard-coded transition set

This caused a real semantic mismatch: mobile wrote `presentation: "slideLeft"`, while the browser presentation resolver only understood `slide`; it therefore fell back to Fade.

Phase A replaces those duplicated write/validation IDs with:

- src/shared/vtE1TransitionCatalog.js
- src/shared/vtE1TransitionCatalog.d.ts

Canonical new-write IDs are:

- cut
- fade
- crossfade
- slideLeft
- slideRight
- wipeLeft
- wipeRight
- zoom

Legacy `slide` and `wipe` remain accepted aliases for old project snapshots.

### Preview ↔ final transition parity

Before this branch, browser preview and final Remotion output used different transition math. Wipe was a clip-path reveal in browser preview but an approximate translation in final render; slide geometry and cut behavior also differed.

Phase A adds:

- src/shared/vtE1TransitionFrame.js
- src/shared/vtE1TransitionFrame.d.ts
- src/shared/vtE1TransitionFrame.test.ts

Canonical transition frame state is now a pure shared contract consumed by browser transition presentations and final Remotion composition. Fixture tests lock deterministic frames for crossfade, slide, wipe, zoom, and cut.

## Changes in this implementation slice

### Shared transition vocabulary

- added canonical transition catalog;
- made transition UI render from that catalog;
- removed unsupported Iris/Flip/Clock entries from the active mobile transition browser;
- preserved those lower-level Remotion presentation primitives as engine capabilities without advertising them as current VT_E1 project capabilities;
- render worker validation now consumes the shared accepted-ID list;
- final Remotion composition normalizes legacy aliases through the shared catalog.

### Shared transition frame contract

- browser transition preview and final composition now use the same pure frame evaluator for canonical VT_E1 transitions;
- final wipe uses the same clip-path semantics as preview rather than a different translation approximation;
- cut has deterministic midpoint ownership;
- zoom/fade/slide state is fixture-tested.

### Desktop/mobile project round trip

- introduced a strict mobile bridge layer shape with required `payload`;
- desktop layers are normalized without discarding unknown fields;
- ContentBuild/project identity fields remain preserved;
- tests now round-trip layers, transition identity/presentation/params, seam links, project metadata, and unknown desktop fields;
- complete stable project fingerprinting detects semantic edits beyond clip timing.

### Shared FX contract

After PR #405 merged, the next audit found a second duplicated semantic owner: the FX rack, mobile preview, final Remotion composition, and render-worker keyframe evaluator each carried their own lists/defaults/order/filter rules.

The shared authority is now:

- src/shared/vtE1FxCatalog.js
- src/shared/vtE1FxCatalog.d.ts
- src/shared/vtE1FxCatalog.test.ts

Canonical FX keys are:

- blur
- saturation
- brightness
- hue
- contrast
- sepia
- grayscale
- opacity

The contract owns defaults, min/max clamping, step/precision metadata, keyframeability, default ordering, custom-order normalization, bypass and per-effect disable semantics, and CSS filter generation. Mobile controls no longer own a private definition list. Mobile preview and final Remotion output use the same filter builder. Mobile preview geometry, final Remotion keyframe evaluation, and the render worker now consume one animated-FX key list, which closes the prior gap where contrast/sepia/grayscale were statically rendered but omitted from animation evaluation.

The capability registry now records surface-specific truth for color adjustments and blur:
- mobile: active
- preview: active
- render: active
- desktop: planned until the legacy/current desktop host is verified and wired

This avoids turning real mobile/render capability into a false claim of desktop parity.

## Remaining Phase A gaps

1. **Capability-surface matrix:** the registry exists, but desktop/mobile/render implementation evidence is not yet generated from tests into one parity table.
2. **Desktop FX parity:** the shared FX contract is implemented and mobile/preview/render support is explicit, but the desktop host is intentionally still marked planned until its controls/actions are verified against the same contract.
3. **Whole-project fixture:** verified in PR #410. It covers media, text, audio, keyframes, FX, transitions, templates, Remotion assets, ContentBuild identity, forward-compatible metadata, and all current track kinds. The rich fixture passed 4/4, bridge runtime 8/8, bridge hook 2/2, and desktop timeline adapter 5/5 on runtime head `e2bea9e2...`.
4. **Preview ↔ final beyond transitions:** transform, crop, keyframe interpolation, and track ordering are now routed through a canonical visual-frame contract in this branch. Template assets, audio-critical state, and explicit rendered fixture evidence still remain.
5. **Desktop host integration:** shared adapters exist, but the legacy desktop host still owns significant behavior separately and needs measured adoption rather than an assumption of parity.
6. **Editor static-quality debt:** PR #410 repairs renderJobContract Promise<Response> typing, ExportRenderPanel project ID narrowing, PreviewPane keyframe value narrowing, bridge-test layer typing, desktop timeline adapter declarations, and truthful optional layer visibility. The latest static-quality run reports no remaining errors in these changed editor files; remaining errors are outside this slice.
7. **Visual certification:** this slice primarily changes contracts and transition semantics; responsive UI screenshots should be taken when the next visible editor-shell slice is implemented.

## Visual-frame parity slice — 2026-09-24

This branch adds `src/shared/vtE1VisualFrame.js` as the framework-free preview/final authority for visual keyframe interpolation, clip transforms, non-destructive crop math, and explicit track ordering.

The slice closes four concrete divergences:

- mobile preview and final Remotion now share the same `easeIn`, `easeOut`, `easeInOut`, `springy`, and `bell` interpolation semantics;
- clip-level transform controls (x/y, independent scaleX/scaleY, rotation, opacity) now affect final output instead of preview only;
- clip crop controls now affect both browser preview and final image/video rendering with the same non-destructive transform;
- desktop track `order` now survives the desktop→mobile→desktop bridge, while preview and final both consume the same stable ordering helper.

The final renderer also accepts the same media source aliases (`mediaUrl`, `src`, `url`) and `fit` semantics used by mobile preview.

## Acceptance gates for Phase A

Phase A is complete only when:

- one capability vocabulary has evidence per desktop/mobile/render surface;
- transition and FX IDs have one canonical source each;
- desktop → mobile → desktop round-trip fixture preserves all supported project semantics;
- preview/final fixtures cover transitions, transforms, crop, keyframes, layer order/visibility, templates/assets, and audio-critical state;
- no editor surface writes an ID another surface silently downgrades;
- current targeted tests pass;
- the living master resource records evidence and remaining debt.

## Next implementation order

1. verify/merge the rich whole-project round-trip + bounded editor-health slice;
2. expand preview/final fixture coverage to transforms, crop, layer visibility/order, templates/assets, and audio-critical state;
3. verify and wire the desktop FX surface to the canonical FX contract;
4. generate the capability parity matrix from verified tests/contracts;
5. close any remaining editor-owned static-quality errors surfaced by the parity work;
6. then proceed into Phase B UI consolidation and Phase C Editor Brain guide/proposal assistant.
