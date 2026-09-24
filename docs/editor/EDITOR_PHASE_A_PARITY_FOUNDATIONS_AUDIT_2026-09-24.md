# ViewTube Editor Phase A — Parity Foundations Audit

**Status:** active implementation audit  
**Date:** 2026-09-24  
**Audited main:** 4a273685fcae36403977e28be9804b02217717c4  
**Implementation branch:** feat/editor-phase-a-fx-contract-2026-09-24 (Phase A continuation after PR #405 merged)  
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

### Shared FX contract

This Phase A continuation adds:

- `src/shared/vtE1FxCatalog.js`
- `src/shared/vtE1FxCatalog.d.ts`
- `src/shared/vtE1FxCatalog.test.ts`

The catalog now owns the currently renderer-backed layer effects: blur, saturation, brightness, hue, contrast, sepia, grayscale, and opacity. It also owns bounds/defaults, order normalization, disabled/bypass behavior, CSS filter generation, and reset state.

Mobile FX controls no longer maintain a private definition list. Mobile preview and final Remotion composition now call the same FX evaluator, removing duplicated filter-order/default/clamping code. Motion blur and masks remain planned because they do not yet have the same verified shared render contract.

### Desktop/mobile project round trip

- introduced a strict mobile bridge layer shape with required `payload`;
- desktop layers are normalized without discarding unknown fields;
- ContentBuild/project identity fields remain preserved;
- tests now round-trip layers, transition identity/presentation/params, seam links, project metadata, and unknown desktop fields;
- complete stable project fingerprinting detects semantic edits beyond clip timing.

## Remaining Phase A gaps

1. **Capability-surface matrix:** the registry exists, but desktop/mobile/render implementation evidence is not yet generated from tests into one parity table.
2. **Shared FX contract:** started and materially implemented. Canonical definitions now live in `src/shared/vtE1FxCatalog.js` with typed sidecar/tests. Mobile FX controls, mobile preview, and final Remotion composition consume the shared contract. Color/Blur capabilities are promoted from planned to available. Remaining work is desktop-surface parity plus richer preview/final fixtures.
3. **Whole-project fixture:** add one richer fixture with media, text, audio, keyframes, effects, transitions, templates/assets, ContentBuild identity, and multiple track kinds, then round-trip it desktop → mobile → desktop.
4. **Preview ↔ final beyond transitions:** transform, crop, keyframes, layer visibility/order, template assets, and audio need deterministic parity fixtures.
5. **Desktop host integration:** shared adapters exist, but the legacy desktop host still owns significant behavior separately and needs measured adoption rather than an assumption of parity.
6. **Render client baseline debt:** renderJobContract.ts has existing Promise<Response> typing errors and should be repaired in a bounded follow-up.
7. **Visual certification:** this slice primarily changes contracts and transition semantics; responsive UI screenshots should be taken when the next visible editor-shell slice is implemented.

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

1. finish/verify this transition + project-bridge slice;
2. verify the shared FX catalog + controls across CI and desktop/mobile surfaces;
3. add rich whole-project round-trip fixture;
4. expand preview/final fixture coverage beyond transitions and FX;
5. expand preview/final fixture coverage beyond transitions;
6. generate the capability parity matrix from those verified contracts;
7. then proceed into Phase B UI consolidation and Phase C Editor Brain guide/proposal assistant.
