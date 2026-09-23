# Implementation Plan: Mobile Editor Consolidation

## Overview

Consolidate the phone editor into a smaller set of canonical surfaces: a ratio-correct Preview that receives first claim on available workspace, one unified Design Library, one full Clip editor including the desktop FX catalog, one full Transitions editor using the shared desktop transition contract, and one Timeline module containing its editing actions and optional map. Remove redundant workspace/preset/standalone-map/action modules.

## Evidence from current main

- `CustomTemplatePanel` already renders catalog cards through `TemplateVisualPreview`, but template definitions may contain text elements that render names/titles into both thumbnails and added template clips.
- `ClipSettingsPanel` still lays the position pad/rotation and numeric controls out in two columns.
- Mobile Effects currently routes to `EffectsLibrariesPanel`, which is primarily the Remotion visual-asset library/rack; the desktop VT_E1 editor separately owns a much larger `FX_LIBRARY` including Kodachrome, Duotone, Clarendon, VHS Look, etc.
- Desktop VT_E1 also owns transition preset/presentation definitions that are not a shared exported catalog.
- Mobile `PanelBodies.TransitionsPanel` exposes only a small six-transition list rather than desktop parity.
- Mobile track state supports `hidden`, but hidden tracks are filtered out of the timeline, leaving no in-timeline recovery control.
- `MobileWorkspaceLayout` still renders navigation, action row, timeline, standalone map, preset bar, and occupancy strip as independent rows/modules.
- `TemplateLibraryPanel`, `CustomTemplatePanel`, and the Graphics/SVG route split closely related design assets into separate pages.

## Architecture decisions

1. **One canonical project state.** No second mobile clip/transition/effects model. Continue using `EditorStore` + `VtE1Project`.
2. **Extract desktop catalogs, do not duplicate them.** Move FX and transition metadata/contracts out of `VT_E1.jsx` into shared editor modules consumed by desktop, mobile Preview, and Remotion render paths.
3. **One Design Library.** Templates, customizable templates, SVG/graphics, backgrounds, patterns, motion assets and saved/custom items become filters/categories inside one visual browser.
4. **Visual-first cards.** Library cards show the actual rendered asset/template. Names are metadata/search/accessibility, not large card content.
5. **Template metadata is not canvas content.** Catalog names must never become visible text unless the template explicitly defines editable text as part of its design.
6. **Timeline is one compound module.** Editing shortcuts are its header; optional minimap is its footer. No separate shortcut module or Timeline Map module.
7. **Preview-first elastic layout.** After fixed navigation/timeline minimums, Preview receives remaining space. The Preview module itself is aspect-locked close to the composition ratio, preventing dead gutters.
8. **Hidden-track recovery is mandatory.** Hiding a track never makes its control unreachable.
9. **Desktop/mobile parity for clip + transition primitives.** Mobile uses responsive manifestations of the same clip/transition contracts, not reduced parallel implementations.
10. **Remotion parity.** Any FX/transition exposed as active must render identically in Preview and final Remotion output.

## FLOWSTACK UI note

The FLOWSTACK UI builder/review skills were loaded as requested. Current `package.json` does not contain a FLOWSTACK package, so exact-version FLOWSTACK Agent Knowledge cannot be resolved. Per the plugin contract, this plan does **not** invent FLOWSTACK component APIs or recommend direct imports. The ViewTube primitive system remains the implementation authority unless an exact FLOWSTACK package/version is deliberately added later.

## Remotion guidance

The Remotion best-practices, interactivity, and rendering skills were loaded. The implementation should preserve one render-backed effect/transition contract and keep editable values structurally accessible rather than creating mobile-only visual approximations.

## Task List

### Phase 1 — Shared contracts

1. **Extract shared Clip FX catalog**
   - Move desktop `FX_LIBRARY`, labels, ranges, defaults and conversion helpers into a shared typed module.
   - Desktop VT_E1 and mobile import the same definitions.
   - Acceptance: Kodachrome, Duotone and every desktop FX entry are discoverable from both surfaces with identical IDs/defaults.

2. **Extract shared Transition catalog**
   - Move transition presentation metadata, preset packs and compound definitions into shared typed modules.
   - Reconcile with `transitionPresentations.tsx` and canonical `VtE1Transition`.
   - Acceptance: desktop and mobile enumerate the same supported transitions and write the same project data.

3. **Separate template metadata from rendered template content**
   - Audit template definitions for title/name placeholder text such as `template_background`.
   - Add explicit preview-only metadata rather than rendering catalog labels as template elements.
   - Acceptance: adding a gradient/background/template produces only its intended visuals; no catalog title appears in Preview or render.

### Checkpoint A
- Typecheck shared contracts.
- Existing desktop FX/transition behavior remains unchanged.
- Render sample template and verify no metadata title is burned into output.

### Phase 2 — Unified Design Library

4. **Create one Design Library browser**
   - Merge `TemplateLibraryPanel`, `CustomTemplatePanel`, Graphics/SVG and compatible visual assets behind one browser.
   - Filters: All, Templates, Customizable, SVG/Graphics, Backgrounds, Patterns, Motion, Saved/Custom.
   - Preserve search, favorites/recents where already available.

5. **Replace label cards with true visual thumbnails**
   - Use `TemplateVisualPreview` or asset renderer for the entire card surface.
   - Gradient cards show the gradient; SVG cards show the SVG; motion cards show representative preview frames.
   - Keep title only in accessible name/tooltips/selected-details area.
   - Cards maintain a useful thumbnail ratio even in narrow portrait panels; never collapse into thin vertical strips.

6. **Fold Custom Template editing into selected-item details**
   - Selecting a customizable template reveals element/text/icon/color controls below or in a selected-details panel.
   - Remove the separate Custom navigation destination after parity is proven.

### Checkpoint B
- Visual regression at 390×844 and 844×390.
- Every library category displays recognizable visual previews.
- Add each asset type and verify correct canonical timeline clip.

### Phase 3 — Clip editor parity

7. **Make Clip Settings single-column**
   - Position Pad full-width row.
   - Rotation control below it.
   - Every stepper/control follows in one vertical column.
   - No two-column settings grid and no horizontal scrolling.

8. **Add Clip FX Library inside Clips**
   - Add an FX section/tab within the selected clip editor using the shared desktop catalog.
   - Visual preset grid for Kodachrome, Duotone, Clarendon, VHS, etc.
   - Selecting an FX exposes its amount/parameters through ViewTube accelerating steppers.
   - Support ordered stack, bypass, remove and reset.

9. **Unify existing Remotion asset effects with Clip FX**
   - Keep visual/motion assets distinct from per-clip color/image FX but present both through the same Effects area with clear subcategories.
   - Never conflate an overlay asset with a clip filter.

### Checkpoint C
- Same FX ID and parameter values produce matching desktop Preview, mobile Preview and final Remotion frame.
- Single-column Clips page fits phone width with no sideways scroll.

### Phase 4 — Timeline compound module

10. **Move editing shortcuts into Timeline header**
    - Undo, redo, split, duplicate, group/ungroup, combine/uncombine, delete, command/help and related timeline actions become the top row of the Timeline module.
    - Remove the standalone action-row module.
    - Compact icon-only mode remains available.

11. **Move Timeline Map into Timeline footer**
    - Optional minimap becomes the bottom row inside the Timeline frame.
    - Timeline map toggle remains.
    - Remove standalone map module and duplicate outer frame.

12. **Remove Workspace Presets/occupancy modules**
    - Delete the persistent preset bar and occupancy strip from the workspace.
    - Preserve only useful underlying behavior that still has a direct control elsewhere.

13. **Add hidden-track recovery**
    - Add a compact Tracks control in Timeline header or track rail showing visible + hidden tracks.
    - Hidden tracks can always be restored.
    - Hide remains reversible without leaving the editor.

14. **Use fixed timeline row geometry**
    - Empty and occupied tracks have identical row height.
    - Clip addition/removal does not resize track rows.
    - Transition components occupy their seam lane without altering row geometry.

### Checkpoint D
- Hide/show every track.
- Add/remove clips without timeline row jumps.
- Toggle map without creating a second module.
- Verify shortcuts exist exactly once.

### Phase 5 — Mobile transition parity

15. **Build shared mobile TransitionClip/Seam component**
    - Reuse the desktop transition contract and visual vocabulary.
    - Transition is visibly attached to the seam between clips.
    - Touch target supports select, duration adjustment and context actions without stealing clip trim gestures.

16. **Replace six-item mobile transition panel**
    - Populate from the shared transition catalog/presets.
    - Visual transition cards/previews rather than plain text buttons.
    - Existing transition selection opens editable duration/type/parameters.

17. **Render parity**
    - Validate every exposed mobile transition against `transitionPresentations.tsx` / Remotion renderer.
    - Unsupported presentations remain hidden or explicitly unavailable; no fake controls.

### Checkpoint E
- Add, select, edit, move around, and remove transitions entirely by touch.
- Project opened on desktop shows the same transitions unchanged.
- Final render matches Preview at representative seam frames.

### Phase 6 — Preview-first responsive workspace

18. **Replace row-allocation layout with constraint-based elastic layout**
    - Fixed: navigation and Timeline minimum.
    - Flexible: selected settings/library panel.
    - Priority flexible: Preview.
    - Hidden surfaces release all their space.

19. **Aspect-lock Preview module as well as canvas**
    - Preview outer module closely follows 9:16 or 16:9.
    - Canvas fills the module minus transport/chrome.
    - No large unused side/top/bottom areas.
    - For portrait phone + 9:16 project, Preview grows as tall as remaining viewport permits.
    - For portrait phone + 16:9 project, Preview becomes a full-width ratio-correct band.

20. **Simplify workspace controls**
    - Keep module dragging only as an optional Settings feature.
    - With dragging off, no divider handles are rendered and layout automatically fills the viewport.

### Checkpoint F
- 390×844 and 844×390, both 9:16 and 16:9 projects.
- Preview is the largest feasible ratio-correct surface.
- No clipped navigation, timeline, or settings.

### Phase 7 — Cleanup and certification

21. **Remove superseded routes/components**
    - Remove separate Custom Templates/Graphics routes only after unified Design Library parity.
    - Remove standalone action/map/preset/occupancy module render paths.

22. **Accessibility + iOS touch pass**
    - Suppress unwanted text selection/callouts on controllers while preserving selection inside actual text inputs.
    - Minimum touch targets, labels and keyboard equivalents where appropriate.

23. **Automated contract tests**
    - Shared FX catalog parity.
    - Shared transition catalog parity.
    - template metadata not rendered.
    - hidden-track restore.
    - fixed timeline row height.
    - library category/add flows.

24. **Built UI captures**
    - Capture before/after at 390×844 and 844×390.
    - Required states: Design Library, Customizable selection, Clips single-column, Clip FX, Transitions, hidden-track recovery, map on/off, 9:16 Preview, 16:9 Preview.

25. **Release gate**
    - `npm run typecheck`
    - focused editor tests
    - `npm run build`
    - mobile smoke interaction
    - final Remotion render samples for template, FX and transition parity.

## Dependency order

Shared FX/transition/template contracts → Unified Design Library + Clip FX + Transitions → Timeline consolidation → Preview-first workspace → cleanup/certification.

Do not remove old routes/modules before their replacement reaches parity.

## Primary risks

- Desktop constants currently embedded in `VT_E1.jsx`: extraction must be behavior-preserving.
- Template names may be real editable content in some designs: remove only metadata-derived labels, not intentional design copy.
- Remotion FX support may not cover every desktop catalog entry equally; expose only renderer-backed entries as active.
- Combining libraries can create an overly dense browser; solve through category filters and visual cards, not separate pages.
- Timeline transition touch targets can conflict with clip trimming; seam hit zones need explicit gesture ownership.
- Hidden tracks must remain serialized as hidden, not deleted/recreated.

## Definition of done

The phone editor has one visual Design Library, one complete Clip editor with desktop-parity FX, one complete Transitions surface, and one Timeline module containing its controls and optional map. Hidden tracks are recoverable. Template names are not burned into visuals. Preview gets maximum available ratio-correct space. Desktop, mobile Preview and Remotion final render share the same FX/transition/project contracts.
