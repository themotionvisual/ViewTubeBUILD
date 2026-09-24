# Studio Hub Component Library source of truth

`ToolboxUIReferenceLibrary.tsx` is the Studio Hub entry point and shell. It must not maintain an independent subset of component examples.

`StudioHubCompletePrimitiveCatalog.tsx` owns the canonical family registry and rendered examples. Add reusable component families there so they automatically appear in the Studio Hub toolbox.

`studio-hub-complete-primitive-catalog.css` owns catalog-only presentation. Production primitive geometry should continue moving toward shared primitive/token ownership rather than feature-local overrides.

Main Toolbox and SubToolbox are separate structural levels. Main Toolbox authority is 80px header / 5px stroke / 16px radius / 10px shadow / 26px title. Standard SubToolbox authority remains 56px / 4px / 12px / 6px / 20px. Do not globally map the main toolbox header to 56px.

Mobile shell density is intentionally tighter: main Toolbox 56px header / 14px radius / 6px shadow offset, SubToolbox 44px header / 10px radius / 4px shadow offset. Mobile preserves the 26px and 20px title sizes and two-line wrapping; header height is derived from two tight title lines plus roughly 10px total vertical breathing room.


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
