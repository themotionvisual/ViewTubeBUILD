# VT_E1 Complete User Guide And Editor Working Skill

Last updated: 2026-05-22
Runtime covered: [public/editors/VT_E1.html](/Users/cwb/Downloads/viewtube/viewtubeX/public/editors/VT_E1.html)
Workspace: `/Users/cwb/Downloads/viewtube/viewtubeX`

## Purpose

This document is the practical guide for the active VT_E1 video editor runtime. It has four jobs:

1. Explain how to navigate and use the editor as it exists now.
2. List the major features that are finished, partial, missing, or should be updated/removed/folded.
3. Capture the current product and engineering recommendations for making the editor easier to use, more modular, and faster.
4. Provide one complete editor-working skill that future contributors can follow when extending VT_E1.

This guide is based on the current standalone runtime in `public/editors/VT_E1.html`, not on older parallel editor experiments.

## Canonical References

Use these when planning or validating future work:

- `/Users/cwb/Downloads/viewtube/REMOTION_EDITOR_MASTER_SPEC.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VIEWTUBE_VIDEO_EDITOR_UNIFIED_INTENT.md`
- `/Users/cwb/Downloads/viewtube/docs/VIDEO_EDITOR/Editor Research/VT_E1_MASTERPLAN_100_PLUS.md`
- [public/editors/VT_E1.html](/Users/cwb/Downloads/viewtube/viewtubeX/public/editors/VT_E1.html)

## Editor Overview

VT_E1 is a standalone timeline editor built around a clip-first workflow. The current editor is organized into these main pages:

- `Projects`
- `Clips`
- `Text/Caps`
- `Trans/FX`
- `Templates`
- `Code`
- `AI`
- `Vault`

Legacy aliases still exist in code:

- `VIDEO (LEGACY)` routes into `Clips`
- `TEXT (LEGACY)` routes into `Text/Caps`

## Quick Start

1. Open `VT_E1.html` through the local app/runtime path used by this workspace.
2. Start on `Projects` if you need setup, export, session restore, or camera/project controls.
3. Move to `Clips` for timeline editing, media positioning, dragging, splitting, trimming, grouping, and keyframes.
4. Use `Text/Caps` for text layers, caption cues, text presets, and script-related tools.
5. Use `Trans/FX` for clip-level effects, transition seams, transition presets, and per-layer style controls.
6. Use `Templates` to apply built-in templates, save custom templates, or import/export template-related JSON.
7. Use `Code` for JSON review, JSON patch apply, export diagnostics, and schema-based inspection.
8. Use `AI` only for manual, user-triggered tools. VT_E1 does not allow hidden autonomous timeline mutation.
9. Use `Vault` for reusable library/media flows.

## Main Navigation

### Left rail

The left rail is the primary page switcher. It maps to:

- `Projects`: setup, camera, export, sessions
- `Clips`: media and timeline work
- `Text/Caps`: text and captions
- `Trans/FX`: transitions and clip FX
- `Templates`: template browsing and apply
- `Code`: JSON and export diagnostics
- `AI`: manual AI tools and Unified FX Studio
- `Vault`: saved/library assets

### Top controls

The top timeline bar changes by page, but the common controls are:

- `Undo`
- `Redo`
- playhead time display
- project duration input
- snap mode
- cursor preview mode
- split selected clip
- copy keyframe
- paste keyframe
- chroma key toggle and color picker on supported pages
- add track

### Floating global controls

The runtime currently also exposes:

- `Focus`
- `Quickstart`
- `/ Commands`

## Keyboard Shortcuts

Default shortcuts currently exposed by the runtime:

- `?`: open keyboard shortcuts help
- `/`: open command palette
- `Space`: play / pause
- `S`: split selected clip
- `Shift+S`: split all selected clips
- `Cmd/Ctrl+Z`: undo
- `Shift+Cmd/Ctrl+Z`: redo
- `Backspace/Delete`: delete selected
- `Cmd/Ctrl+S`: save manual session
- `T`: add text layer

## Timeline Use Guide

### Selecting

- Click a clip to select it.
- Shift-select supports multi-selection.
- Box select is available by dragging a selection rectangle.
- Clip selection drives most page-specific controls.

### Dragging clips

Current drag model:

- the source clip remains visible as a dimmed placeholder
- the projected drop location is shown separately
- cross-track movement is supported
- drop-below can create a new track/layer row
- grouped multi-clip drags are supported

### Trimming

- left trim and right trim are supported
- trim operations preserve keyframe timing as much as the current contract allows
- trims participate in history

### Splitting

- split selected clip at playhead
- split all selected clips at playhead
- drag-modifier split paths also exist in the runtime

### Grouping

- selected clips can be grouped/ungrouped
- seam grouping is supported between adjacent clips
- seam grouping is intended to preserve linked edit behavior

### Track controls

Track settings currently support:

- lock
- solo
- mute
- reset flags
- tint overlay state
- add track
- remove track

## Keyframes

VT_E1 supports keyframing for clip/layer properties, camera values, and FX properties.

Current keyframe workflow:

- add keyframes at playhead
- copy keyframe at playhead
- paste keyframe at playhead
- keyframe interpolation is tracked
- FX keyframe properties use `fx:<effectId>:<paramKey>` keys
- keyframe marker state supports `active` and `attached`

Current strength:

- copy/paste now supports broader selected-clip coverage than before

Current limitation:

- this is not yet a full multi-edit keyframe system across all channels and all selected clips

## Page-By-Page Guide

### Projects

Use `Projects` for:

- project duration
- project resolution/profile
- aspect-related composition setup
- camera controls
- export
- save/restore session
- parity/preflight/runtime smoke tools

Available actions include:

- export JSON
- load JSON
- export SVG
- export HTML
- preview WebM capture
- export MP4
- export MOV
- save session
- restore session
- clear saved session
- parity smoke
- one-frame sanity
- preflight diagnostics
- runtime smoke

### Clips

Use `Clips` for:

- adding/importing media
- searching media/layers
- selecting clips
- dragging clips on the timeline
- trimming and splitting
- clip grouping
- clip color/visibility/duplicate/delete actions
- clip-level editing

This remains the primary editing page.

### Text/Caps

Use `Text/Caps` for:

- text layer edits
- caption cue creation and editing
- text presets
- duplicate text style to selection
- caption-to-clip workflows

Current text presets:

- `Title`
- `Lower Third`
- `Callout`

### Trans/FX

Use `Trans/FX` for two different systems:

1. Clip-level effect stack
2. Transition seam editing

#### Clip-level effect stack

This is the effect list that directly affects selected layers/clips.

Current clip FX button catalog:

- Grayscale
- Sepia
- Invert
- Contrast
- Brightness
- Saturation
- Hue Rotate
- Vibrance
- Temperature
- Tint
- Exposure
- Highlights
- Shadows
- Clarity
- Sharpen
- Noise
- Pixelate
- Vignette
- Chromatic Aberration
- Posterize
- Glow Bloom
- Scanlines
- Film Grain
- Halation
- Bleach Bypass
- Gamma
- Luma Lift
- Duotone
- Teal Orange
- Cool Blue
- Warm Gold
- CRT
- Edge Glow
- Dream Soft

Important current behavior:

- clicking a clip FX adds it to the selected layer
- once active, the button slot is replaced by the active effect card
- the active card contains:
  - enable/disable eye toggle
  - delete button
  - parameter sliders
  - keyframe support for effect parameters

Important current exclusions:

- `opacityFx` has been removed from the clip FX list
- `fade` is not treated as a clip effect button in this list

#### Transition editing

Transition editing is seam-based.

Current transition capabilities include:

- click seam badge on timeline to edit transition
- choose transition type
- use transition preset packs
- use compound transition templates
- control:
  - direction
  - duration
  - intensity
  - amount
  - blur
  - rotation
  - frequency
- delete transition

### Templates

Use `Templates` for:

- browse built-in templates
- search templates
- apply templates
- save current state as custom template
- import/export related JSON and motion data
- create template flows via the template creator

### Code

Use `Code` for:

- direct JSON inspection
- JSON draft editing
- JSON patch diff review
- applying validated JSON patches
- schema-aware import/export and diagnostics

The current JSON path includes:

- timeline envelope validation
- patch diff before apply
- export contract checks

### AI

Use `AI` for manual-only tools.

This page currently includes the `Unified FX Studio`, which is distinct from the clip FX stack.

Unified FX Studio supports:

- selected-clip effect application
- new overlay clip creation
- generated asset clip creation
- per-effect parameter editing
- quality tier selection for overlays
- target-track selection for overlays
- turbo mode
- max preset
- live preview

Current Unified FX catalog includes entries such as:

- Digital Glitch RGB
- Noise Surface
- Starburst
- Light Leaks
- Gradient Waves
- CRT Scanline
- Kaleidoscope
- Plasma Field
- Particle Dust
- Film Burn
- Prism Rainbow
- Bokeh Burst
- Warp Ripple
- Volumetric Godrays
- Electric Storm
- Aurora Ribbons
- Halftone Pop
- Mirror Matrix
- Mirror Matrix Duplicate
- RGB Layer Transform
- Vignette Pulse
- Duotone Binary
- Dither BW
- Circle Noise Pro

### Vault

Use `Vault` for:

- reusable library assets
- saved media/library flows
- search-based retrieval

This area still needs more completion than the core editing pages.

## Sessions, Restore, And Safety Checks

### Session controls

Current session controls:

- save manual session
- restore manual session
- clear saved session
- autosave snapshot infrastructure
- restore picker infrastructure

### Diagnostics

Current diagnostics exposed in the runtime:

- `Parity Smoke`
- `One-Frame Sanity`
- `Preflight Diagnostics`
- `Runtime Smoke`
- `Undo History`

### What each one does

- `Parity Smoke`: checks sample points for visible geometry and determinism issues.
- `One-Frame Sanity`: checks current active stage/layer size and opacity constraints.
- `Preflight Diagnostics`: checks contract validity, timeline envelope, determinism, missing assets, and track/layer integrity.
- `Runtime Smoke`: checks runtime contract items such as history presence/labels, clip FX catalog state, hidden shell-surface flags, and envelope sanity.
- `Undo History`: shows labeled history states with timestamps.

## What Is Finished Now

The live runtime contains these finished or substantially working features.

### Core navigation and shell

- single active standalone VT_E1 runtime
- page-based workflow navigation
- quickstart overlay
- command palette
- shortcuts help
- topbar help
- focus mode
- remembered panel width state

### Timeline and clip editing

- clip selection
- multi-selection
- box selection
- clip drag and drop with placeholder + projected landing preview
- cross-track drop
- create-track-on-drop path
- clip splitting
- clip trimming
- clip duplication
- clip deletion
- clip visibility toggle
- clip color change
- clip grouping
- seam grouping
- track add/remove
- track lock/solo/mute/reset

### History

- undo
- redo
- jump-to-history-state
- labeled history entries for major action categories
- history timestamps

### Keyframes and animation

- layer property keyframes
- camera keyframes
- FX parameter keyframes
- copy keyframe
- paste keyframe
- interpolation state tracking

### Effects and transitions

- clip FX stack
- enable/disable effect
- delete effect
- in-grid active effect replacement
- transition seam editing
- transition presets
- compound transition templates
- mirror matrix controls
- unified overlay/generative FX studio

### Templates and content creation

- built-in template library
- custom template save
- template apply
- template creator flow
- motion JSON import/export

### Export and diagnostics

- JSON export/import
- SVG export
- HTML export
- preview capture
- MP4/MOV export job path
- parity smoke
- preflight diagnostics
- runtime smoke
- patch diff before JSON apply

## What Is Partial Or In Progress

These features exist, but are not yet complete enough to call fully finished.

### Timeline and edit reliability

- grouped drag parity across all cases
- seam/group-linked edit behavior under all trim/split/move combinations
- full editor-state undo/redo coverage across every direct mutation path
- more predictable multi-keyframe editing across larger selections

### Text and captions

- caption workflow exists, but full caption CRUD maturity is still below the strongest editor areas
- script/caption/text systems are useful, but not yet fully unified

### Search and library surfaces

- video/image/audio search surfaces are present in partial form
- reusable files/library path is still weaker than the main timeline/editor stack

### Startup and settings shell

- session recovery logic exists
- startup recovery/settings shell is still more infrastructural than polished

### Diagnostics and parity

- parity/preflight/runtime smoke are present
- preview/export parity evidence is still not exhaustive across every subsystem

## What Still Needs To Be Completed

These are the highest-value unfinished areas based on the runtime, the canonical roadmap direction, and the current recommendations.

### Phase B closeout

- full group drag parity
- seam-linked move/trim/split parity
- broader multi-keyframe edit tools
- stronger action-by-action undo/redo guarantees

### Phase C closeout

- GIF pause-sync
- animated media FPS override parity
- deeper preview/export parity checks
- stronger deterministic randomness enforcement
- broader easing/motion reuse

### Narrow Phase D contract work

- stricter JSON timeline hardening
- broader disabled-state contracts for provider/MCP/AI actions
- governance/evidence logging for contract changes

## What Needs To Be Updated Next

These are the most important UX and architecture updates to make the editor easier to use and maintain.

### User experience

- compact active effect cards so they stay readable inside the 2-column FX grid
- simplify page-to-page mental model so `Projects`, `Clips`, `Text/Caps`, `Trans/FX`, `Templates`, `Code`, `AI`, and `Vault` each have a tighter ownership boundary
- make topbar control availability more obvious by page
- improve transition between onboarding and real work so first-time users understand where each workflow belongs immediately

### Editor architecture

- replace remaining direct `setProject` mutation hotspots with shared labeled actions or reducer-like helpers
- split the monolithic `VT_E1.html` runtime into internal logical sections or extracted helper modules without breaking the single-runtime delivery model
- unify shell/module state ownership so dead display infrastructure does not linger after UX cleanup

### Performance and maintainability

- add a repeatable runtime smoke harness policy before larger feature work lands
- reduce inline render complexity for FX, transitions, and shell modules
- isolate expensive preview and diagnostics helpers

## What Should Be Removed, Folded, Or Deprecated

These are the main cleanup targets.

### Should be folded into canonical paths

- legacy `VIDEO` and `TEXT` tabs should remain aliases only, not treated as first-class parallel surfaces
- hidden shell status cards and old module badge surfaces should stay out of the visible UI and eventually be removed structurally where safe

### Should be avoided

- duplicate editor runtimes as separate active sources of truth
- hidden autonomous AI timeline mutation
- ad hoc features that bypass history, parity checks, or explicit state models

### Already removed or intentionally hidden

- clip FX `opacityFx`
- visible shell/module status cards
- visible feature backlog card
- visible module badge chrome

## Complete Feature Status Inventory

### Finished or largely working

- page navigation
- timeline selection and editing
- drag/drop preview
- clip operations
- keyframe basics
- transition seam editor
- clip FX stack
- Unified FX Studio
- templates
- export/import
- diagnostics
- session save/restore
- history panel with labels

### Partial

- caption workflow maturity
- library/file reuse surfaces
- startup recovery polish
- parity breadth
- group drag parity
- full history coverage
- multi-keyframe authoring depth

### Missing or weak

- full files-library maturity
- stronger caption CRUD completeness
- comprehensive modular decomposition of the runtime
- full automated smoke regression harness outside manual button checks

### Update/fold candidates

- remaining shell helper leftovers
- overlarge active effect cards
- inconsistent direct mutation paths
- overly broad inline runtime file structure

## Overall Editor Working Skill

This section is the total operating skill for planning, reviewing, and extending VT_E1.

### Name

`VT_E1 Complete Operator Skill`

### Mission

Build, refine, and document VT_E1 as a simple-by-default, deep-on-demand, creator-controlled video editor with deterministic behavior, explicit state models, and testable preview/export parity.

### Primary goals

1. Keep clip-first editing as the main user workflow.
2. Make every edit predictable before commit and reversible after commit.
3. Keep AI manual-only and explicitly applied.
4. Improve usability by reducing visible complexity, not by hiding logic behind unsafe automation.
5. Move the runtime toward modular internals without fragmenting the product into multiple competing editor surfaces.

### Non-negotiable invariants

1. Deterministic frame output for identical input.
2. No hidden AI timeline mutation.
3. Preview/export parity must be diagnosable.
4. Every major editing action must be history-bearing.
5. UI behavior must map to explicit state.
6. The standalone runtime remains canonical until a deliberate migration replaces it.

### Working method

1. Start from the active runtime and canonical docs, not memory guesses alone.
2. Identify the domain:
   - timeline
   - text/captions
   - transitions
   - clip FX
   - Unified FX Studio
   - export/parity
   - shell/navigation
3. Find the existing state model before editing UI.
4. Prefer shared mutation helpers over one-off `setProject` branches.
5. Add verification alongside features:
   - parity smoke
   - preflight
   - runtime smoke
   - history/state checks
6. Keep visible UX cleaner after every pass.

### Design rules

1. Remove redundant visible chrome.
2. Keep page boundaries obvious.
3. Do not expose two controls for the same job unless one is clearly advanced.
4. Avoid generic or duplicate effect entries in the same user-facing list.
5. Keep advanced controls available, but behind stable page/module ownership.

### Code rules

1. One canonical runtime file during this phase.
2. Shared helpers for repeated mutations.
3. History labels on major actions.
4. Validation before JSON apply and export.
5. Runtime smoke must stay current with important UX contracts.

### Performance rules

1. Avoid heavy repeated calculations directly in render when a memoized helper will do.
2. Keep diagnostics and effect previews scoped to the page that needs them.
3. Reduce sidebar and shell noise before adding more surface area.
4. Favor predictable local checks over large opaque runtime magic.

### Modularization plan

The next modularization path should be:

1. timeline mutation helpers
2. history/diagnostics helpers
3. clip FX panel helpers
4. Unified FX Studio helpers
5. export/parity helpers
6. shell/page rendering helpers

### Usability upgrade checklist

- every page says what it owns
- active effects are readable in their own grid slot
- drag destination is always visible before drop
- history names are understandable
- export tools explain pass/fail state
- users can tell when an action is blocked and why

### Completion checklist for future editor work

- feature matches a page/workflow owner
- history behavior is correct
- diagnostics still pass
- runtime smoke still passes
- no new duplicate visible systems were introduced
- guide docs stay aligned with the runtime

## Recommended Next Documentation Updates

After this guide, the next best docs to add are:

1. `VT_E1 change log by feature ID`
2. `VT_E1 parity checklist for manual QA`
3. `VT_E1 mutation map` covering all major `setProject` paths
4. `VT_E1 page ownership map` for modularization/refactor work

## Final Summary

VT_E1 is already usable as a serious standalone editor, especially for clip-first editing, transitions, FX, templates, export, and diagnostics. Its biggest remaining weaknesses are not the absence of core features, but coherence problems:

- too much logic still lives inline in one large runtime file
- some subsystems are more mature than others
- history and parity need broader completion
- the UX still benefits from simplification and stronger page ownership

The right strategy is not to replace VT_E1 with another editor. The right strategy is to keep this runtime canonical, finish the Phase B/C trust work, tighten the user model, and progressively modularize the internals without breaking the working surface.
