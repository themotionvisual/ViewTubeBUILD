# Primitives, tokens, color, and component authority

This reference explains the canonical ViewTube widget construction vocabulary.

## Production source of truth

Always inspect current code before editing:

- [WidgetPrimitives.tsx](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/WidgetPrimitives.tsx)
- [WidgetPrimitiveExtensions.tsx](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/WidgetPrimitiveExtensions.tsx)
- [widgetPrimitiveSystem.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetPrimitiveSystem.ts)
- [widgetPrimitiveSystem.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetPrimitiveSystem.css)
- [widgetPrimitiveExactHeights.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetPrimitiveExactHeights.css)
- [widgetPrimitiveTones.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetPrimitiveTones.css)
- [widgetPrimitiveVariants.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetPrimitiveVariants.css)
- [widgetMatrixPrimitives.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetMatrixPrimitives.css)
- [widgetMobileContract.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgetMobileContract.css)
- [toolboxWidgetSystem.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/toolboxWidgetSystem.css)
- [tokens.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/tokens.ts)
- [toolboxPalette.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/styles/toolboxPalette.ts)
- [UIReferenceLibraryWidget.tsx](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgets/UIReferenceLibraryWidget.tsx)

`WidgetPrimitives.tsx` is the public widget primitive API. `WidgetPrimitiveExtensions.tsx` is a compatibility/implementation layer; new consumers should import through the canonical public surface.

## Dashboard structural tokens

Current `DASHBOARD_TOKENS`:

| Token | Value |
|---|---:|
| stroke level 1 | 4px |
| stroke level 2 | 3px |
| stroke level 3 | 2px |
| large radius | 16px |
| medium radius | 12px |
| small radius | 8px |
| outer gap | 24px |
| inner gap | 12px |
| dense gap | 8px |
| shadow offset | 6px |
| transition | 180ms |

These are macro/shell tokens. Primitive controls have their own smaller geometry ladder.

## Primitive height ladder

Current intended control scale:

| Height | Role | Type | Icon |
|---|---|---:|---:|
| 18px | micro | 8px | ~12px |
| 24px | compact | 16px | ~18px |
| 32px | standard | 21px | ~24px |
| 38px | large | 26px | ~29px |

Read current production tokens before relying on the numeric snapshot.

Do not introduce ordinary 27/28/30/34px one-off controls when one of the canonical levels can work.

## Adaptive 24px mode

Dense 24px rows may use an adaptive text-fit mode when the intent is to keep the established row/column composition.

Target contract:

- control remains 24px high;
- text scales from 16px toward 10px as the widget container contracts;
- icons/gaps/padding may contract proportionally;
- complete labels remain visible;
- no ellipsis/cropped word starts or ends.

If current main does not yet contain the production `textFit="adaptive"` API, treat the contract as an approved target and verify/port the current implementation before using it.

## Canonical primitive families

The production primitive system should own reusable families including:

- sized buttons;
- icon buttons;
- split-left buttons;
- split badges;
- text inputs;
- textareas / fields;
- selects/dropdowns;
- video selectors;
- search inputs;
- toggle switches;
- radios;
- checkboxes;
- sliders;
- steppers;
- pagination;
- segmented/page toggles;
- header toggles;
- header steppers;
- tabs;
- tags/badges;
- spectrum fill badges;
- alphabetical/continuous spectrum tags;
- live/status badges;
- progress bars;
- metrics/KPI displays;
- tooltips;
- popovers/disclosures;
- state panels;
- toast/alert components;
- upload/media frames;
- scroll areas;
- workflow main/footer/section primitives.

Before creating local markup, search the primitive files and UI Reference Library.

## UI Reference Library rule

The UI Reference Library must render real production primitives.

A component shown only in the library is not canonical.

If a useful reference-only component exists:

1. move/build the reusable implementation in production primitives;
2. expose it from the public primitive API;
3. make the UI Reference Library consume that implementation;
4. add tests/states/sizes;
5. migrate widgets.

Never maintain parallel implementations.

## Split-left / segmented geometry

A split-left primitive is a compound component.

Rules:

- square bay derives from control height;
- square math must account for the outer border;
- no inherited parent padding/gap around internal cells;
- only one shared divider should own the boundary;
- labels use the same primitive typography;
- icon size and stroke scale with height.

These rules also apply to search, pagination, steppers and split badges.

## Toggle, radio, checkbox states

State indicators must remain visible.

- toggle: visible thumb/inner control with clear position change;
- radio: visible contrasting inner dot;
- checkbox: large thick rounded X;
- selected/active: palette-aware contrast;
- do not allow fill and state glyph to become visually identical.

State semantics should also use `aria-checked`, `aria-pressed`, or appropriate native semantics.

## Media/upload frames

Canonical media upload surfaces are not button-height strips.

Use:

- solid ViewTube stroke;
- transparent/palette-tinted interior;
- stable media geometry;
- 16:9 default for video/thumbnail/image workflows;
- 1:1 where the content is square;
- explicit drag/hover/selected states.

Generic dashed dropzone styling is legacy unless a specific current approved design says otherwise.

## Textareas

Resizable textareas should preserve the native/custom bottom-right diagonal resize affordance when user expansion is useful.

Do not disable resize simply to make a screenshot align.

The initial layout still must satisfy composition equations.

## Color system

Production palette authority is `src/styles/toolboxPalette.ts`.

Twelve named spectrum colors:

| Name | Hex |
|---|---|
| Rose | #FA618A |
| Coral | #FF7F6B |
| Orange | #FFA85C |
| Yellow | #FFDA47 |
| Lime | #C0F240 |
| Green | #3FEE56 |
| Teal | #4EE4BE |
| Cyan | #36E0F6 |
| Royal | #528FFA |
| Purple | #A467F4 |
| Magenta | #F55EFC |
| Pink | #FF7AC8 |

Widgets are primarily monochromatic around the assigned widget color.

Use ViewTube Ink/current widget ink tokens rather than pure black in the widget system where the current authority prohibits black.

## Multi-color exceptions

Additional colors are valid when they encode meaning.

Examples:

- multiple metrics;
- multiple compared videos;
- status;
- warning/success/error;
- anomaly;
- categories;
- timeline tracks;
- different content formats;
- ranked clusters;
- selections.

Do not add random color solely for visual variety.

## Semantic metric colors

`VT_VISUAL_METRIC_ORDER` maps the twelve core analytics metrics to the spectrum so the same metric can remain consistent across visuals.

Use the shared resolver rather than locally assigning a different color to views/watch time/revenue/etc.

## Spectrum tags

Two different concepts exist:

1. named 12-slot palette colors;
2. continuous/infinite spectrum tags where arbitrary labels should not all repeat the same 12 colors.

Do not confuse the legacy A→12-slot mapping in shared toolbox code with a widget-specific continuous spectrum requirement. Inspect the current widget primitive implementation and preserve the intended system for that context.

## Typography hierarchy

Rules:

- titles remain the canonical title size;
- titles do not shrink to make room for header controls;
- titles may wrap to two lines;
- titles never ellipsize;
- primitive text follows primitive level;
- adaptive text fitting is opt-in for dense 24px layouts;
- labels should visually fill available space rather than becoming tiny text floating in empty controls.

## Icon hierarchy

Do not use identical 14px/2px icons in every control size.

Icon geometry and stroke should scale with primitive height.

Square icon-only controls should derive both width and height from the same primitive token.

## Focus and interaction

Use palette-derived focus.

Focus must not change external component dimensions.

Hover/pressed travel and shadow behavior belongs to primitives, not widget-local CSS.

## Scrollbars

Use explicit scroll primitives/contracts.

Titles/headers never scroll.

Notes/tags/feeds/tables may scroll when the region is intentionally bounded.

Avoid accidental nested scrolling.

## Component-authoring rule

When a reusable component is missing:

1. verify it is reusable across more than one domain;
2. define its size/tone/state API;
3. implement in primitive layer;
4. expose through `WidgetPrimitives.tsx`;
5. add to UI Reference Library;
6. test;
7. migrate consumers.

If it is unique to one creator job, keep it as a widget-specific signature/compound component built from canonical primitives.


## Density is not fitting

Do not use a widget-wide density override as a substitute for control-level adaptive text.

A complex widget may need different densities simultaneously:

- compact page/mode navigation;
- standard form inputs;
- larger signature controls;
- expanded preview/output surfaces.

Apply density to a deliberate region or composition state.

Use `textFit="adaptive"` on the controls/groups whose labels actually need fitting.

Never use broad `overflow:hidden` / `text-overflow:clip` to simulate successful fitting.

## Adaptive action buttons

Canonical action buttons should support the same adaptive text-fit contract as ordinary sized buttons when they use the 24px geometry.

Long primary labels such as generation/build actions should fit through the primitive API rather than private widget CSS.

## Visual size versus interaction size

A 24px ViewTube control does not automatically become a 44px visible control on coarse pointers if that destroys the composition.

Visual geometry and acquisition target are separate concerns.

When larger touch acquisition is required, use an intentional hit-area mechanism that does not alter visible primitive height or overlap neighboring actions ambiguously.


## Portalled select/dropdown geometry

A dropdown trigger and its portalled menu share visual tokens, but they are **not the same geometric primitive root**.

Do not apply the full trigger/root primitive class to the portalled menu when that class imposes:

- fixed control height;
- inline-flex row layout;
- trigger padding;
- adaptive text-fit overflow clipping;
- trigger interaction transforms.

A portalled menu should inherit/carry only the size/tone variables and menu-specific classes needed for:

- row height;
- menu typography;
- border/radius/color;
- max-height and scrolling.

The menu itself must remain an auto-height vertical list.

If a dropdown opens as an empty white strip with only a scroll chevron visible, inspect whether trigger geometry classes were copied onto the portal content and collapsed the viewport.

Always verify dropdowns on mobile Safari/Chrome after primitive changes because portals escape the widget container and do not inherit the widget element directly.

## Mobile dropdown height exception

A portalled select menu is not a single fixed-height control.

Any mobile rule that enforces canonical control height on `.vt-sized-control` must explicitly exclude `.widget-select-content` or override it back to auto-height.

Otherwise a valid dropdown with many options can collapse to one control-row height, leaving only a scroll chevron visible while the option viewport appears empty.

Required invariant:

- trigger: fixed canonical height;
- menu container: auto height up to max-height;
- option rows: canonical primitive height;
- viewport: scrolls when option count exceeds available space.

Mobile accessibility/density layers must not accidentally re-clamp the menu after the primitive layer has made it auto-height.


## Compact counters and module compounds

Canonical numeric controls now include two related compounds:

- **WidgetStepper** — minus / value / plus. The value cell is intentionally only wide enough for a comfortable two-digit value; do not let it grow into a large empty center panel.
- **WidgetSplitCounter** — a split-left counter. Its left bay is mathematically square after the outer stroke is removed, and that bay is divided horizontally into two equal 2:1 rectangles. The upper chevron increments and the lower chevron decrements. The numeric value sits in the compact right cell.

Geometry:

`splitBay = controlHeight - outerStroke - outerStroke`

`chevronCellHeight = splitBay / 2`

Therefore each chevron cell is `2:1` (width : height).

Reusable compound/module primitives also include:

- **WidgetAccentRailModule** — Daily Oracle-derived module with a semantic colored rail touching the module edge;
- **WidgetIconTitleModule** — About VIEWTUBE-derived square colored icon bay plus title/subtitle copy;
- **WidgetTinySpectrumIcon** + **WIDGET_TINY_ICON_SET** — 50 small reusable icon choices rendered through the ViewTube spectrum;
- **WidgetRainbowPanel** and **WidgetRainbowDivider** — full-width spectrum surface and edge-to-edge divider;
- **WidgetModuleFrame** and **WidgetModuleHeader** — generic module shell/header with a control slot for toggles, counters, buttons, dropdowns, and similar primitives.

The UI Reference Library must render these actual production primitives, not visual copies.

## Dropdown row and scrolling invariant

Dropdowns use a scrollbar rather than dedicated top/bottom scroll buttons.

Required geometry:

- closed trigger = one canonical primitive height;
- open option row = exactly the same canonical primitive height;
- video-search row = the split-left search primitive, with magnifying-glass bay and input on one row;
- menu container = auto height up to its bounded viewport;
- viewport = vertically scrollable with visible scrollbar when options exceed the bound.

Do not copy `.vt-sized-control` fixed-height root geometry onto the portalled/open menu container. Carry only the size/tone variables needed for rows and color.


## UI Reference size-first certification page

The UI Reference Library includes a dedicated **SIZE** page whose ordering is size-first, then color:

1. 18px — default, primary, secondary
2. 24px — default, primary, secondary
3. 32px — default, primary, secondary
4. 38px — default, primary, secondary

Normal flow mode must keep every primitive at natural/content width so mixed control widths can be inspected together. Grid mode is an explicit comparison mode: it equalizes the primitive widths and uses a fixed three-column row so alignment defects become obvious.

Do not duplicate primitive families merely to demonstrate sizing. The same production primitive should be rendered into the size-first matrix.

## Video select closed-trigger anatomy

The canonical closed video selector uses two regions:

- a square split-left bay divided horizontally into equal halves;
- selected video content.

The top half reads **VIDEO**. The bottom half contains the open/close chevron. There is no right-side chevron and no file icon.

The selected video title wraps naturally into the available space. Never apply ellipsis to the closed selected title; use two or three compact lines as the size permits.

## Input filler-copy behavior

Filler copy belongs in the native `placeholder`, not in the input value.

- Unfocused: placeholder is visible at reduced opacity.
- Focused while empty: placeholder becomes mostly transparent and the caret starts at the far-left editing origin.
- First typed character: the browser removes the placeholder naturally.
- Never prefill demonstration/filler copy as the actual value merely to make an empty input look occupied.

## Canonical 12-metric tiny icon map

The tiny-icon library reserves one icon/color pair for each canonical Data Visual metric, in `VT_VISUAL_METRIC_ORDER` and therefore in the same 12-stop spectrum order:

- rose — Views
- coral — Engaged Views
- orange — Watch Time
- yellow — Subscribers
- lime — Revenue
- green — Comments
- teal — Average % Viewed
- cyan — Average View Duration
- royal — Likes
- purple — RPM
- magenta — Shares
- pink — Playlist Saves

These metric icons must not be recolored arbitrarily when rendered in the reference library or a Data Visual.


## Tone construction, not tint duplication

The three widget primitive tones must be visibly distinct constructions rather than three near-identical tint levels.

### Default

Use as the neutral reference construction:

- white or near-white primary surface;
- palette-aware stroke and ink;
- colored accents limited to active cells, bays, or handles.

### Primary

Use as the emphasized construction:

- stronger widget-color presence than Default;
- saturated active regions;
- still preserves ink-led readability where practical.

### Secondary

Use as the inverse/compound construction:

- saturated structural zones instead of another pale tint;
- white text/icons on saturated areas;
- white or inverted center/selected cells where they improve hierarchy;
- component anatomy may change to communicate the alternate construction.

Canonical examples:

- **Stepper:** saturated chassis + saturated plus/minus cells + white glyphs/value.
- **Pagination:** saturated strip with white page copy; active page becomes the inverse white tile.
- **Split-left Search:** saturated bay + saturated input field + white icon/copy.
- **Text Input:** saturated resting surface with white copy; focus inverts to a white editing surface.
- **Select:** saturated trigger with white label/chevron; secondary open-menu treatment remains inverse.
- **Video Select:** saturated title surface + saturated VIDEO/chevron bay with white foreground.
- **Toggle:** no stroke in Secondary. OFF = pale/white track + widget-colored thumb. ON = widget-colored track + white thumb. Background and thumb color animate together as the state changes.

Do not implement a new tone by merely changing opacity on the Default construction. If Default, Primary, and Secondary are difficult to distinguish in the UI Reference Library without reading their labels, the family needs another construction pass.
