# Studio Hub Component Library source of truth

**Status:** Canonical scoped Component Library / primitive-correction authority  
**Last audited main:** `988098840050f4b658a266e1a7d6fe1c4d939c81`  
**Scope:** Studio Hub Component Library catalog wiring, catalog presentation, demonstrated primitive families, and named primitive-correction contracts.  
**Related authority:** `../architecture/VIEWTUBE_TOOLBOX_UI_MASTER_RESOURCE.md` owns the production Toolbox/Subtoolbox system globally. Production tokens/code/tests win over catalog-only CSS.

`ToolboxUIReferenceLibrary.tsx` is the Studio Hub entry point and shell. It must not maintain an independent subset of component examples.

`StudioHubCompletePrimitiveCatalog.tsx` owns the canonical family registry and rendered examples. Add reusable component families there so they automatically appear in the Studio Hub toolbox.

`studio-hub-complete-primitive-catalog.css` owns catalog-only presentation. Production primitive geometry should continue moving toward shared primitive/token ownership rather than feature-local overrides.

Main Toolbox and SubToolbox are separate structural levels. Main Toolbox authority is 80px header / 5px stroke / 16px radius / 10px shadow / 26px title. Standard SubToolbox authority remains 56px / 4px / 12px / 6px / 20px. Do not globally map the main toolbox header to 56px.

Mobile shell density is intentionally tighter and **fixed by token contract**: main Toolbox 56px header / 14px radius / 6px shadow offset, SubToolbox 44px header / 10px radius / 4px shadow offset. Mobile preserves the 26px and 20px title sizes and permits up to two tight wrapped lines. The fixed mobile heights do not redefine the desktop 80px / 56px shell authority.


## Primitive Correction Authority — 2026-09-23

The following rules supersede older local family styling and are production primitive authority.

### Floating overlays
- `Tooltip`, `Tooltip Color`, and `Hover Card` use a body-level portal/floating overlay layer rather than remaining inside a Toolbox/SubToolbox stacking context.
- Floating primitive z-index authority is `--vt-floating-overlay-z`.
- Tooltip #37 remains the visual/anatomical reference for tooltip geometry.
- Tooltip variants may change fill/text treatment, but not border width, radius, connected-spout construction, or L0/L1/L2 geometry.
- The tooltip spout uses the same stroke width as its parent bubble.
- Tooltip and Hover Card automatically flip above/below their trigger at viewport edges.

### LED status family
- Labeled LED controls shrink-wrap to LED + label rather than occupying arbitrary width.
- LED label typography is intentionally strong at every component level.
- Active LEDs emit one circular ripple every eight seconds. The ripple starts at the exact core size, expands to 500% over the first three seconds, and fades fully transparent during that expansion.
- Ripple authority: 2px pair-color perimeter plus a 10px inward-blurred 30%-opacity pair-color glow.
- `LED Dot` is the bare status-light family. Its core is exactly the component-level height; ripple paint must not affect layout dimensions.

### Controller switch
- Controller Switch is one rounded track with no detached right-side label compartment.
- OFF/ON track fills are transparent versions of opposite pair colors.
- The circular thumb is fully opaque in the opposite pair color and owns the centered white OFF/ON label.
- Track fill, thumb color, and thumb position animate together.

### Scrollbars
- Horizontal and vertical scrollbar families share the same icon language and component-level end-cell geometry.
- Track interior is black.
- Thumb is pair-colored with a black border equal to component stroke; that border visually forms the maintained black gap around the thumb.
- End icons may grow inside their square cells but the cells themselves must not grow.

### Calendar
- Calendar has one canonical production size: L0.
- The Primitive Library renders only the L0 Calendar example.
- Month typography is intentionally oversized.
- Weekday/date typography is enlarged without increasing calendar-cell geometry.
- The weekday strip uses a 50%-strength opposite-pair fill.
- Selected-date typography enlarges inside the existing cell rather than resizing the cell.

### Loader family
- Inline loaders do not use a generic outer rectangle.
- Spinner diameter and label visual height are coordinated.
- Spinner base uses the opposite pair color; the active arc is longer and ends with a gradient tail rather than a hard stop.
- Canonical loading representations include Spinner, Progress, Split Gradient, Orbit, and Bars.
- The Split Gradient loader is the module-shaped option and uses pair-color split-left anatomy with a horizontally moving title gradient.

### Tree View
- Tree View prioritizes hierarchy readability while reducing row height.
- Root rows begin at 50% opposite-pair fill; each deeper depth reduces visual fill strength by 15 percentage points.
- Deeper rows use two square icon rails (pair A then pair B), followed by a left-aligned pair-A text region.
- Icons should communicate node contents rather than act as generic decoration.
- Type size and weight reduce gradually with depth while remaining larger than the superseded Tree View typography.

### Certification
- Floating overlays require viewport captures when open because their panels are portaled outside the component locator.
- Tooltip Color, Hover Card, Controller Switch, LED Light, LED Dot, both Scrollbars, Calendar, all Loader variants, and Tree View are priority visual-certification families.


## Component Library Presentation Contract — 2026-09-24

These rules apply to the Component Library presentation layer and do **not** change production-control anatomy.

### Catalog shells and width
- Numbered Component Library SubToolboxes do not draw a second heavy outer rectangle around the family.
- L0/L1/L2 demo shells are borderless labels, not nested cards.
- **The catalog owns placement; the primitive owns geometry.** Catalog CSS must not override a production primitive root with `width: fit-content !important`, `width: 100% !important`, or family-specific pixel widths.
- Component preview widths are expressed as multiples of the canonical L0/L1/L2 component height, so each level preserves the same anatomy at a different scale.
- Preview families declare one sizing mode: `intrinsic`, `fixed`, `compound`, `field`, or `canvas`.
- `intrinsic` families shrink-wrap their own content. `fixed` families derive both axes from component height. `compound` families own fixed square rails plus a proportional body minimum. `field` and `canvas` families fill an explicit preview slot rather than the entire SubToolbox.
- Desktop and mobile landscape show L0/L1/L2 on one comparison row whenever the declared geometry fits without clipping.
- Mobile portrait keeps intrinsic/fixed families in the compact two-column comparison, but compound/field/canvas families stack one level per row when their real minimum width cannot fit a half-column.
- Responsive layout must move or stack a component before violating its square rails, text body, center alignment, or canonical level ratios.

### Level parity
- L0/L1/L2 are one component anatomy, not three separately tuned designs.
- Height, stroke, radius, shadow, font, icon size, rail width, padding, and compound body minimums derive from shared component-level variables.
- Split-left rails are literal 1:1 squares and never shrink to make room for the label.
- Canonical library sample labels must render without ellipsis or clipping at their declared preview size.
- Geometry certification compares normalized ratios such as rail-width / component-height and total-width / component-height rather than only raw pixels.

### Visual Key tooltip
- `SubToolboxLegendTooltip` is the dense visual-key / legend tooltip primitive.
- It reuses the canonical floating-overlay positioning, viewport flipping, spout geometry, and z-index authority.
- Its body adds a colored title band, repeated key rows, optional swatch/icon markers, primary labels, secondary explanations, and an optional note band.
- It is intended for chart legends, status keys, workflow-state explanations, and dense visual metadata—not ordinary one-line help copy.

### Skeleton variants
- `SubToolboxSkeleton` supports `lines`, `compact`, and `media` variants.
- `compact` represents short horizontal controls/list rows with icon, text, and trailing-action geometry.
- `media` represents ratio-aware media/card loading states and supports 16:9, 1:1, and 4:5.
- All variants inherit the owning pair colors and share the canonical shimmer motion/reduced-motion behavior.


## Video Manager Structural Contract — 2026-09-25

### Equal shell rhythm
- Main Toolbox and SubToolbox content use one equal interior gutter on all four sides and between first-level children.
- Desktop/narrow authority: 6px. Mobile authority: 5px.
- SubToolbox inset wrappers do not add a second horizontal inset; the content gutter is the single spacing authority.
- Toolbox content therefore gains a small amount of top/bottom clearance while SubToolbox interiors lose the former doubled side clearance.

### Mini SubToolbox
- Mini SubToolbox is the next structural level below SubToolbox, not a styled card pretending to be a shell.
- Desktop authority: 40px header / 3px stroke / 8px radius / 4px shadow / 16px title.
- Mobile authority: 36px header / 3px stroke / 7px radius / 3px shadow / 14px title.
- Anatomy is square icon rail → title region → optional header actions → content.
- It is appropriate for tightly scoped embedded workflows such as the Video Manager thumbnail editor.

### Rich Video Selector
- Video Selector is a direct L0 compound and must not require a surrounding SubToolbox.
- Trigger anatomy follows SubToolbox split-left proportions.
- The square left rail contains the thumbnail at the top with equal visible fill margin and compact publish-date/runtime badges below it.
- Title uses up to two full lines, dynamically reduces type for long titles, uses clipping rather than ellipsis, and never deliberately renders an ellipsis.
- The opened panel is portaled above shell overflow/stacking contexts and carries the owning pair-A/pair-B values into the portal.
- Search is the first row of the opened panel and uses the canonical split-left Search field.

### Overlay-labeled fields
- Labeled Input and Labeled Textarea put the contextual label inside the field on the right instead of consuming a separate line above the control.
- Resting field tint is 50% pair A. The contextual label uses pair A at 65% strength and weight 1000.
- Typed/user text is black and visually above the contextual label when their areas overlap.
- The contextual label disappears while the field has focus.
- Focus remains the canonical white field + pair-A inset + pair-B glow state.

### Video Manager production order
1. Direct L0 Video Selector.
2. Video Details SubToolbox.
3. Labeled Title field.
4. Thumbnail Mini SubToolbox with Upload and Generate header actions.
5. Labeled Description field.
6. Publishing controls.
7. Video Tags SubToolbox using the canonical two-color Tag Editor.
8. Direct SubToolbox-level split-left Update Video Details action.

Video Stats KPI cards are intentionally removed from the editing flow. Thumbnail Generate hands the selected video context to Thumbnail Studio. Mobile portrait may stack Publishing controls and long tag actions to prevent clipped values; landscape/desktop retain denser horizontal composition.


## 2026-09-25 required certification additions

The Render/iPhone audit adds these mandatory primitive/compound demonstrations before the Component Library can be considered visually current:

- restored four-arrow Toolbox/SubToolbox collapse control, with no generic chevron replacement;
- interactive custom dropdown proof where selecting a different option visibly changes the trigger value;
- SubToolbox-level split-left full-row action at supported levels;
- reusable Thumbnail MiniSubToolbox with paint-safe Upload/Generate header actions;
- Spectrum Tag L3;
- Spectrum Tag L3 + Tag Editor #30 removable/addable compound;
- Vault Asset editable title;
- Vault Asset large selection checkbox;
- Vault Asset notes input/textarea and tag editor;
- Vault Asset landscape, portrait and intermediate-ratio contained thumbnail/media states;
- palette-sequence specimen proving Toolbox -> first SubToolbox -> sibling/nested SubToolbox ordering through the 12-color palette.

Static source presence is insufficient for dropdown and editable-asset states; these examples must be interactable in the production-import track.

## Vault Asset Module donor-parity authority — 2026-09-25

The compact Vault asset family now has a dedicated production primitive: `VaultAssetModule`.

- The source geometry and interaction donor is recorded in `VAULT_ASSET_MODULE_REFERENCE_PARITY.md`.
- `VAULT_ASSET_MODULE_DNA` is the geometry authority. The module is a fixed compound and does not scale its outer anatomy through L0/L1/L2.
- Production variants are Landscape, Landscape Swapped, Portrait Single, Portrait Double, Audio, and Document.
- Creator Vault consumes the same component rendered in the Studio Hub primitive track.
- The primitive track must use real editable title, shared spectrum tag editor, dirty-save notes, selection state, media preview, waveform and document-preview behavior.
- The hardcoded catalog stays frozen as a comparison baseline; donor-only variants may therefore exist only in the primitive track.
- Each Vault Asset Module represents one single image, video clip, audio file, or document. It is not a project/package/engine container, and higher-level Vault workflow controls must stay outside the compact module unless separately approved.
- ViewTube palette/font/focus tokens may flow into the module, but generic Toolbox CSS must not change the donor's fixed dimensions or layout.

