# Mobile Editor Primitive & Touch Control Authority

**Status:** CURRENT SCOPED IMPLEMENTATION REFERENCE — subordinate to the Editor master  
**Last audited main:** `2efe0f56eb52c1029c71543291cf65e2b1a2245f`  
**Scope:** phone-editor touch primitives/controls and direct-manipulation rules. It does not own overall Editor architecture, project identity or render truth.

Status: implementation authority for the phone editor controls introduced in the 26–50 improvement pass.

## Purpose

The mobile editor must remain dense without becoming hard to touch. New controls should reuse these primitives instead of inventing another local slider, number input, icon button, color selector, or gesture vocabulary.

## Tokens

The code authority is `src/features/editor/mobile/components/MobileEditorPrimitives.tsx`.

- Ink / structural stroke: `#248b99`
- Primary active cyan: `#36E0F6`
- Attention yellow: `#FFFF61`
- Destructive pink: `#FA618A`
- Success green: `#4EE4BE`
- Blue: `#528FFA`
- Orange: `#FF9B54`
- Purple: `#C86BFA`
- Default radius: 6px
- Default component stroke: 2px
- Default component gap: 4px
- Compact touch-control height: 28px

Black is not a default component stroke. Existing legacy black uses should be migrated to the ink token when those components are touched.

## Primitive contracts

### AcceleratingStepper

Use for mobile numeric adjustment instead of sliders or editable numeric boxes.

Interaction:
- Tap minus/plus: one increment.
- Hold: repeat rate accelerates.
- Continue holding and drag upward: precision changes to 0.25× and then 0.1×.
- Continue holding and drag downward: speed changes to 2× and then 4×.
- Double-tap the center value: reset to the supplied default.
- Both stepper ends are colored.
- Animatable properties may attach the standardized keyframe-state control.

### MobileIconButton

Use for compact icon-only actions. It inherits the standard border, radius, active cyan, touch behavior, and sizing.

### LinkToggle

Use beside paired values such as Width/Height and Scale X/Scale Y. Linked changes update both members proportionally or identically according to the property contract.

### XYJoystick

Use for direct X/Y transform adjustment. The pad is bounded, touch-only while active, and resets through double-tap when a reset callback is supplied.

### RotationDial

Use for direct rotation. The pointer follows the touch angle around the dial and can reset through double-tap.

### MobileSection / mobilePanel / mobileButton

Use these as the base assembly for new mobile-editor modules and compound controls. Custom components may extend them, but should preserve stroke, radius, density, and active-state semantics.

## Timeline control authority

- Empty tracks compact vertically.
- The active track expands.
- An active clip with keyframes receives an expanded keyframe lane.
- Track order is changed only from the dedicated grip.
- Clip bodies own move gestures.
- Clip edge zones own trim gestures once acquired.
- Long-press enters additive clip selection.
- Keyframes may be selected, dragged, duplicated, deleted, and assigned interpolation.
- Circle and compound-diamond keyframe forms remain visible in the clip.
- Magnetic snapping exposes Off / Soft / Strong plus target filters.
- The dedicated scrub strip owns seeking and vertical precision scrubbing.
- The minimap owns project-range navigation and viewport resizing.

## Preview authority

- Preview transport controls remain below the canvas and are not duplicated elsewhere.
- The interaction frame follows selected visual position, scale, and rotation.
- Position animation displays a motion path and draggable keyframe points.
- Direct-manipulation gestures must modify canonical editor state only.
- Long-press/right-click opens the Preview shortcut tray.

## Color authority

Timeline clip colors are compact square swatches in one row. Color operations support Selected, Group, and Track scope. Type-derived automatic colors, recent colors, and a custom color square are allowed; long vertical color menus are not.

## Effects authority

The mobile effect system is one ordered rack over renderer-backed properties.

- Master bypass temporarily disables the rack.
- Each effect has an individual visibility/bypass control.
- Effects can be reordered.
- The same order/bypass state must be honored by mobile preview and final Remotion render.
- User FX presets are local reusable presets.
- Visual FX browsing supports search, static/motion type, category, favorites, recents, and visual mini-previews.

## Template authority

Template clips stay canonical timeline clips. The Custom Template panel may edit content, icon substitutions, colors, and template definitions. Tapping an editable element in the template preview selects its matching editor control. Context action trays may edit, duplicate, or reset that element.

## Command and context authority

The command palette is the global mobile shortcut surface. It searches editor commands without adding persistent toolbar clutter.

Context shortcut trays are local and target-specific:
- Clip
- Empty timeline
- Track
- Keyframe
- Preview
- Template element

A tray should expose only actions relevant to the pressed object.

## Guidance authority

The full Touch Editor Guide is the static reference. The Interactive Coach is the in-product teaching layer. Coach targets are identified through stable `data-guide-id` attributes rather than absolute hard-coded phone coordinates.

## Persistence

Device-local editor preferences and user presets may use localStorage when they are UI preferences or local presets. Project/timeline data must remain in the canonical editor project model.

## Acceptance checklist for new controls

1. No sideways scrolling is required for ordinary settings.
2. Numeric adjustment uses AcceleratingStepper unless direct manipulation is clearly superior.
3. Touch and drag ownership is unambiguous.
4. No duplicate command is visible in multiple primary control rows at once.
5. Icons are used instead of emoji.
6. Components use the mobile editor token system.
7. Hidden modules release their screen space.
8. Preview, timeline, and settings stay within the phone viewport.
9. Rendering behavior matches Preview where the feature affects output.
10. Any new gesture or compound control is represented in the Touch Guide or Interactive Coach.
