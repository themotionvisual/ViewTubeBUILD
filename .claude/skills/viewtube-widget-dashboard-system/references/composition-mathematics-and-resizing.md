# Composition mathematics and bidirectional resizing

ViewTube widget layouts should be generated as linked geometric systems, not approximate arrangements of independent boxes.

## 1. Parent-first composition

Build in this order:

1. outer widget body;
2. major regions;
3. row/column relationships;
4. signature component;
5. supporting compound components;
6. primitives;
7. labels/detail.

Do not place individual buttons first and then attempt to make the widget fit afterward.

## 2. Matched-column equation

When adjacent columns share top and bottom boundaries, their total visible heights must match.

If left column contains one component and right column contains three:

`H_left = H_r1 + G1 + H_r2 + G2 + H_r3`

If gaps are equal:

`H_left = H_r1 + H_r2 + H_r3 + 2G`

Example:

`96px = 44px + 8px + 44px`

for a one-vs-two stack.

For one-vs-three:

`128px = 40px + 4px + 40px + 4px + 40px`

The visible border edges, not just content boxes, should align.

## 3. Matched-row equation

Apply the same rule horizontally.

If a left region contains one wide component and the right side contains three cells:

`W_group = W_c1 + G1 + W_c2 + G2 + W_c3`

Rows that conceptually terminate on the same grid line should share that grid line.

## 4. Recursive layout equations

Nested grids obey the same logic.

Example:

- outer two-column workspace;
- left = preview;
- right = controls stack;
- third control is itself a two-column mini-grid.

The outer heights must match and the inner grid must resolve to the exact allocated space of its parent.

Use shared CSS variables so a change propagates through all linked regions.

Example:

```css
.widget-workspace {
  --workspace-h: 128px;
  --gap: 8px;
  --row-h: calc((var(--workspace-h) - (2 * var(--gap))) / 3);
}
```

Avoid repeating literal values across unrelated selectors.

## 5. Borders and strokes are part of visible alignment

When calculating alignment, decide whether measurements refer to:

- border-box;
- content-box;
- inner cell;
- split bay;
- separator.

A 2px stroke on both adjacent children can accidentally create a 4px shared divider.

For segmented controls, assign the shared boundary to one owner.

## 6. Gaps are structural dimensions

Canonical gaps are not decorative afterthoughts.

A parent gap plus child margin can create an accidental double gap.

Compound components that own their internal cells should reset inherited:

- `padding`;
- `gap`;
- child margins.

This is especially important for:

- split-left buttons;
- search bars;
- steppers;
- pagination;
- segmented controls;
- split badges.

## 7. Shadows are not layout dimensions

Align visible component frames/borders.

Shadows may extend beyond a grid line without shifting the component's structural placement.

Do not compensate for a shadow with arbitrary neighboring margins.

## 8. Split-left geometry

A split bay should be mathematically square.

For a component whose outer height is `H` and whose outer stroke is `S`, define whether the bay square is based on:

- full outer height, or
- inner available height `H - 2S`.

Use one contract consistently.

Do not use arbitrary `aspect-ratio:1` plus `height:100%` inside a bordered parent when that produces a phantom strip.

## 9. Linked textarea/input layouts

If one large textarea sits next to two stacked inputs:

`textarea height = top input height + gap + bottom input height`

If one large textarea sits next to three:

`textarea height = input1 + gap + input2 + gap + input3`

The initial top and bottom edges must align.

If the textarea is resizable, the initial linked geometry still applies; expansion is an intentional user action after render.

## 10. Grid-line continuity

Where the composition implies alignment, preserve continuous:

- top edges;
- bottom edges;
- vertical rails;
- separators;
- header baselines;
- canvas edges;
- button rows;
- table/metric boundaries.

A layout that is "close" but visibly off by 2–4px fails visual certification.

## 11. Width buckets

Macro dashboard width uses the 24-column system:

| Bucket | Span |
|---|---:|
| quarter | 6 |
| companion | 7 |
| third | 8 |
| between | 10 |
| half | 12 |
| two-thirds | 16 |
| three-quarters | 18 |
| full | 24 |

A widget may support a continuous set of these bucket states between its declared min/max.

Do not invent a width bucket merely to fix internal layout; fix the internal composition first.

## 12. Height buckets

| Bucket | Approx outer height |
|---|---:|
| short | 150px |
| medium | 250px |
| tall | 350px |
| xtall | 450px |
| massive | 850px |

Height changes are independent from width changes.

Every supported width × height combination is a public state.

## 13. Bidirectional state space

Treat a widget as a matrix, not a single responsive line. For complex mobile tools, the complete responsive state is:\n\n`allocated width × selected widget height × interaction/viewport mode`\n\nWidth-only breakpoints are insufficient when landscape increases width while sharply reducing visible vertical space.

For each supported width state and each supported height state, define:

- primitive size;
- gap density;
- information density;
- signature-component allocation;
- visible supporting controls;
- scroll behavior;
- header behavior.

Examples:

| Width | Height | Intent |
|---|---|---|
| narrow | short | irreducible core |
| narrow | tall | same composition with vertical detail/history |
| wide | short | horizontal detail/comparison but limited depth |
| wide | tall | richest simultaneous view |

## 14. Preserve composition before reflow

When contracting, attempt in this order:

1. smaller canonical primitive size;
2. smaller canonical gap/padding;
3. 24px adaptive text fit where appropriate;
4. proportional icon reduction;
5. less secondary metadata;
6. less tertiary information;
7. reduced signature-component detail;
8. only then restructure rows/columns.

When expanding:

1. larger canonical primitives;
2. larger signature component;
3. richer labels;
4. more history/data;
5. secondary controls;
6. simultaneous comparison;
7. deeper context.

## 15. Density states

A widget may define density states such as:

- Micro;
- Compact;
- Standard;
- Expanded;
- Detailed.

These are not different widgets.

They change:

- primitive scale;
- gaps;
- visible detail;
- supporting metadata;
- canvas allocation.

They should preserve the same mental model and signature component.

## 16. Adaptive 24px text

Use the agreed adaptive text mode only where retaining a dense row is preferable to reflow.

Contract:

- outer height remains 24px;
- default type begins near 16px;
- type may decrease to approximately 10px;
- icon/gap/padding may contract proportionally;
- complete words must remain visible;
- no start/end clipping;
- no ellipsis as a substitute for fitting.

Do not use adaptive text to force clearly unsuitable content into a tiny region.

## 17. Primitive scaling

Ordinary canonical component levels:

- 18 micro;
- 24 compact;
- 32 standard;
- 38 large.

When width/height changes, primitive scaling may be asymmetric.

Example: a tall narrow widget may keep 24px horizontal controls but enlarge its vertical signature component.

Do not blindly scale every child at the same time.

## 18. Header geometry

Header title typography does not shrink to save space.

On narrow/portrait widgets:

- title may wrap to two lines;
- primary header toggle remains visible;
- title never ellipsizes;
- toggle may compact;
- nonessential header extras may hide.

Header layout is part of composition certification.

## 19. FIT / ADAPT / SCROLL by region

For each region explicitly choose:

- FIT;
- ADAPT;
- SCROLL.

Example:

- signature visualization: ADAPT;
- toolbar: FIT;
- repeating feed: SCROLL;
- title/header: FIT/ADAPT but never SCROLL.

The outer widget shell remains deterministic.

## 20. Container queries

Internal composition responds to widget allocation, not only browser viewport.

Prefer the named widget container where current runtime owns it.

A quarter-width widget on a desktop may need the same internal composition as a full-width widget on a phone.

## 21. Portrait and landscape

Test both.

Portrait stresses horizontal space.

Landscape often stresses vertical space and header/browser chrome.

Do not assume a landscape phone is simply a wider desktop.

## 22. Minimum usable geometry

Document the irreducible core:

- signature component;
- primary action;
- essential state;
- essential label/data.

If supported geometry becomes smaller than the tool can remain usable, change the registry min width/height rather than shipping a broken composition.

## 23. Maximum useful geometry

Maximum size should also be intentional.

A widget should not grow to full/XXL merely because the registry allows it unless that space yields meaningful additional capability.

## 24. Leftover-pixel discipline

Resolve leftover pixels intentionally.

If the parent offers 302px and children/gaps consume 298px, decide where the 4px belongs:

- flexible canvas;
- explicit fractional row;
- padding;
- intentional distribution.

Do not let browser auto-stretch create random alignment drift.

## 25. Certification equations

For each complex layout, record at least one geometry equation in implementation notes/tests.

Examples:

- `previewH = inputA + gap + inputB`
- `rightRailW = controlH`
- `contentW = parentW - railW - gap`
- `threeRows = 3*rowH + 2*gap`

A layout that fails its own equation fails certification.


## 26. Aspect-ratio signature budget

Media-like signature components must respect vertical budget.

Do not let a full-width 16:9 canvas become taller simply because a phone rotates to landscape.

Use the relationship:

`signatureHeight = min(desiredAspectHeight, availableVerticalBudget)`

Then, when necessary:

`signatureWidth = min(availableWidth, signatureHeight × aspectRatio)`

The signature visual remains conceptually identical; only its allocation changes.

## 27. Breakpoints come from measured failure

A breakpoint must correspond to an actual composition failure:

- label no longer fits under approved adaptive range;
- signature interaction becomes unusable;
- required control cannot retain its allocation;
- linked geometry cannot remain aligned;
- touch interaction becomes ambiguous.

Do not add generic 430/620/etc. breakpoints without recording what invariant fails there.

## 28. Sequential systems may scroll without changing their mental model

Storyboards, timelines, shot strips, queues, and similar sequence-native components may preserve horizontal ordering with bounded horizontal scrolling instead of changing row counts.

Use scroll only where the sequence itself makes scrolling understandable. Essential navigation still requires a discoverable primary control.


## 29. Scroll safe-area ownership

Do not combine a flush widget body with a full-bleed `WidgetScrollArea` unless the widget intentionally owns and compensates the resulting edge geometry.

The canonical scroll area assumes the shell content inset when calculating its negative margins and scrollbar lane. If the body inset is zeroed and the scroll area is still full-bleed, the scroll frame can extend beyond the widget shell and be clipped on both sides.

For ordinary tool widgets:

- keep the shell body inset;
- use `edge="inset"` for the primary workflow scroll area;
- let full-bleed sections opt out deliberately rather than making the whole scroll surface full-bleed;
- verify that every input, selector, signature component and border remains inside the shell at portrait width.

Treat visible clipping at both left and right edges as an ownership/geometry defect, not a reason to shrink text or controls.
