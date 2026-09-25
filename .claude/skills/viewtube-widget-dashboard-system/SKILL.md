---
name: viewtube-widget-dashboard-system
description: Canonical authority for designing, inventing, building, editing, resizing, integrating, optimizing, migrating, certifying, and maintaining ViewTube dashboard widgets, widget primitives, compound components, responsive composition, CSS, data/action systems, registry metadata, and the UI Reference Library.
---

# ViewTube Widget Dashboard System

This skill is the canonical operational guide for all ViewTube dashboard/widget work.

It exists to help an agent build **individually designed, highly functional creator tools that visibly belong to one shared ViewTube system**.

The core principle is:

> **Standardize the shell, grid, tokens, primitives, interaction contracts, responsive rules, data contracts, and certification process — not the identity or internal composition of the widget.**

A ViewTube widget is not a differently colored copy of a template. Every widget should be a recognizable tool designed around its own creator job.

## Mandatory reading

Before changing widget code, read `docs/architecture/VIEWTUBE_WIDGET_DASHBOARD_MASTER_RESOURCE.md` for the current living program state, consolidation decisions, task backlog, settings-widget plan, preview-state policy, and file inventories. Then read the relevant references in this skill:

- `references/design-doctrine-and-utility.md`
- `references/composition-mathematics-and-resizing.md`
- `references/primitives-tokens-color.md`
- `references/current-widget-inventory.md`
- `references/source-code-map.md`
- `references/futures-prototypes-and-reference-atlas.md`
- `references/data-actions-and-integrations.md`
- `references/testing-certification-and-management.md`
- `references/video-director-responsive-lessons.md` — complex-widget case study for local-fix containment, two-axis/landscape behavior, density vs fitting, and rendered certification.
- `references/authority-and-reconciliation.md`
- `references/css-management-and-deployment.md`

For visible work also follow `agent/contracts/herald-workflow.md` and `agent/contracts/herald-out.md`.

## Authority order

When sources disagree, current production code and the newest verified contract win.

Use this ownership chain:

`TOKENS -> PRIMITIVES -> COMPOUND COMPONENTS -> WIDGET-SPECIFIC FUNCTIONAL SYSTEM -> WIDGET SHELL -> DASHBOARD GRID -> CERTIFICATION`

The UI Reference Library renders and documents production primitives; it is not a separate implementation authority.

Historical archetype/category documents are useful as pattern libraries only. **Do not force a widget into an archetype or category as a design prerequisite.** Registry categories are metadata, not a design mold.

## 1. Start with the creator job

Before layout or styling, write a Widget Identity Brief containing:

- stable widget ID and title;
- creator job / problem solved;
- primary input;
- primary output;
- primary action;
- supporting actions;
- data/dependencies;
- signature component or compound system;
- signature interaction;
- information hierarchy;
- default/minimum/maximum width;
- default/minimum/maximum height;
- what must remain invariant through resizing;
- what gains detail when space expands;
- what loses detail first when space contracts;
- loading / ready / empty / disconnected / stale / error behavior;
- cross-tool inputs, outputs, and handoffs;
- accessibility and certification requirements.

Do not begin by choosing an archetype.

## 2. Every widget requires a signature functional component

Every widget must contain at least one explicitly designed component, compound component, visual system, control system, or interaction that:

1. is specific to that widget's job;
2. makes the widget recognizable even if the title is hidden;
3. visually communicates what the widget does;
4. directly assists with the main function;
5. remains conceptually recognizable as the widget resizes.

Examples include a response queue, goal trajectory, anomaly field, synchronization matrix, video stack, editor timeline, planning lane, packaging composition, audience request cluster, or generation/preview system.

Decoration alone does not count.

## 3. Shared ViewTube system, individually designed tools

Use canonical primitives for buttons, icon buttons, split controls, inputs, selects, toggles, radios, checkboxes, sliders, tags, badges, steppers, pagination, upload frames, progress, states, scroll areas, and related reusable UI.

Do **not** flatten custom functional interiors to make widgets look identical.

Preserve useful custom systems such as Comment Responder, Goals Tracker, Video Director, Brain Hub, Image Generator, or future purpose-built tools while bringing their shared geometry, tokens, colors, component sizing, state behavior, and accessibility into the canonical system.

## 4. Dashboard grid contract

The dashboard uses a 24-column macro grid.

Width buckets:

- quarter = 6/24
- companion = 7/24
- third = 8/24
- between = 10/24
- half = 12/24
- two-thirds = 16/24
- three-quarters = 18/24
- full = 24/24

Height buckets:

- short / S ≈ 150px
- medium / M ≈ 250px
- tall / L ≈ 350px
- xtall / XL ≈ 450px
- massive / XXL ≈ 850px

Use `src/views/dashboard/tokens.ts`, registry min/default/max metadata, and current shell CSS as runtime authority.

Choose the smallest default allocation that makes the unique widget genuinely useful. Width/height are determined by the widget's needs, not by a category stereotype.

## 5. Bidirectional width × height resizing

A widget must support intentional positive and negative resizing in **both width and height** across its declared supported dimensions.

Do not treat responsive behavior as desktop versus mobile only.

For each supported state ask:

- What happens when width decreases?
- What happens when width increases?
- What happens when height decreases?
- What happens when height increases?
- What happens when one increases while the other decreases?

Preserve the recognizable composition before changing structure.

Preferred contraction order:

`primitive scale -> gap/padding density -> adaptive 24px type -> icon/detail reduction -> secondary information reduction -> signature-component reallocation -> composition reflow only if necessary`

Preferred expansion order:

`larger primitives -> richer labels -> larger signature component -> more visible data/history -> supporting controls/context -> simultaneous comparison/detail`

Never merely stretch empty whitespace.

## 6. Canonical primitive sizing

**Density and fitting are separate systems.** Density changes the overall scale/detail of a region. Adaptive text fitting preserves a specific control geometry while fitting its complete label. Do not set an entire complex widget to compact merely because several dense buttons are long, and never use clipping as a substitute for fitting.

Current control ladder:

- 18px micro
- 24px compact
- 32px standard
- 38px large

Current intended type scale is approximately:

- 18px control -> 8px type
- 24px control -> 16px type
- 32px control -> 21px type
- 38px control -> 26px type

Use current code if it supersedes these values.

Dense 24px rows may opt into the agreed adaptive text-fit contract: **16px down to 10px while the control remains 24px high**. Do this to preserve useful row geometry when text can remain fully readable. Never crop the start/end of a word.

Do not invent arbitrary control heights for ordinary canonical controls.

## 7. Composition mathematics

Layouts are mathematical compositions, not approximate arrangements.

If one column contains one component and the adjacent column contains three stacked components:

`single height = component A + gap + component B + gap + component C`

The top and bottom visible border edges must align exactly.

Apply the same rule horizontally, recursively, and to nested grids.

Account for:

- component heights/widths;
- gaps;
- border/stroke thickness;
- dividers;
- internal split bays;
- parent padding;
- shadows as visual effects, not structural dimensions.

Avoid accidental double gaps and double strokes.

Read `references/composition-mathematics-and-resizing.md` before designing a multi-region widget.

## 8. Title and header contract

Widget titles:

- keep the same canonical widget-title size;
- never shrink merely to make a header fit;
- never use ellipsis;
- may wrap naturally to two lines when necessary;
- do not scroll.

Primary header mode/page toggles remain visible in portrait layouts. Compact the toggle itself and reallocate header space before hiding it.

## 9. Color contract

Widgets are predominantly monochromatic around their assigned ViewTube spectrum color.

Use ViewTube Ink/current palette tokens rather than pure black for widget text, strokes, borders, and icons where current widget authority prohibits black.

The twelve named spectrum colors are defined in `src/styles/toolboxPalette.ts`.

Secondary/multiple colors are allowed when they communicate real meaning such as:

- comparison;
- category;
- status;
- warning/success/error;
- anomaly;
- selection;
- sequence;
- metric identity;
- timeline ownership;
- multiple datasets.

Color must have a reason. Do not add arbitrary decoration colors.

## 10. Compound controls

Split-left buttons, split badges, search bars, steppers, pagination, segmented controls and similar structures are one compound geometry.

Their square bays must be mathematically square after accounting for the outer stroke.

Reset inherited button padding/gaps when the compound owns its own internal cells.

Icons and icon strokes scale with primitive size.

Interactive state must be visible:

- toggles show their moving inner control;
- radios show a contrasting inner dot;
- checkboxes use the established large thick rounded X;
- selected/pressed/focus states remain palette-aware.

## 11. Media and editable surfaces

Media upload/drop surfaces use solid ViewTube upload-frame treatments, not generic dashed dropzones.

Use meaningful media geometry:

- 16:9 default for thumbnail/video/image workflow frames;
- 1:1 when the asset is square;
- other aspect ratios only when the content requires them.

Resizable textareas should retain the bottom-right resize affordance when expansion is useful.

If one large text area sits beside two or three stacked fields, linked geometry must make the stacked total plus gaps equal the large field's initial height.

## 12. FIT / ADAPT / SCROLL

Every internal region must intentionally use one of:

- FIT — stays inside the region without structural change;
- ADAPT — changes density/primitive/detail allocation;
- SCROLL — explicit bounded internal scroll.

Do not let body content grow the deterministic outer shell.

Headers and titles never become scroll regions.

Prefer one intentional body scroll area unless the tool's function genuinely requires more.

## 13. Data and action contract

Preferred data flow:

`SOURCE -> CANONICAL DATASET -> SELECTOR/ADAPTER -> WIDGET VIEW MODEL -> VISUAL/CONTROL`

A compatible imported dataset must not be ignored merely because a preferred API source is unavailable.

Widgets should help the creator **do** something with information, not merely display it. Where appropriate connect insight to actions, other widgets, Studio Hub, Projects, Vault, Editor, Publisher, Brain, analytics, or packaging systems.

AI inside widgets should be context-aware and domain-specific rather than a generic chat box.

## 14. Utility-first feature design

Before adding a feature ask:

- What decision/action does it improve?
- Can the user understand its current state?
- Does it reduce repeated work?
- Can sensible defaults make it useful immediately?
- Can direct manipulation replace configuration?
- Can it show cause/effect immediately?
- Can comparison improve the decision?
- Can it hand off useful outputs elsewhere?
- Can the user recover/undo safely?
- What makes it 10× more useful without 10× more complexity?

Read `references/design-doctrine-and-utility.md`.

## 15. Registry and renderer ownership

Stable widget IDs matter because dashboard layout is persisted.

Current production-facing metadata lives in:

- `src/views/dashboard/WidgetRegistryBase.ts`
- `src/views/dashboard/WidgetRegistry.ts`
- `src/views/dashboard/widgets/newWidgetSet.ts`

Rendering lives in:

- `src/views/dashboard/WidgetRendererBase.tsx`
- `src/views/dashboard/WidgetRenderer.tsx`
- individual files under `src/views/dashboard/widgets/`

Never add a second ID for an existing creator job without explicit migration/alias reasoning.

### Independent top-level widget ownership

One stable widget ID must resolve to one independently editable top-level widget TSX owner. A widget may consume shared primitives, utilities, data adapters, services, types, and deliberately reusable compound components, but it must not be implemented merely as a mode/configuration of another widget's top-level component. Prefer limited duplicated widget composition over a shared mode-driven owner when independent editing would otherwise create cross-widget side effects.

Current main contains **65 registered widget definitions**; older documents that say 59 are historical snapshots.

## 16. UI Reference Library contract

`src/views/dashboard/widgets/UIReferenceLibraryWidget.tsx` is the visual catalog of production primitives.

It must:

- import the real canonical primitive;
- show canonical size/tone/state variants;
- never maintain a private lookalike;
- expose new reusable primitives after production implementation exists;
- act as visual QA, not as a source-only mock.

## 17. CSS ownership

Order:

`tokens -> shell/grid -> primitives -> compound components -> widget-specific -> accessibility`

Fix the highest shared owner.

Do not solve ownership mistakes by endlessly escalating selector specificity or `!important`.

Keep Widget and Toolbox/Subtoolbox systems isolated unless a deliberately shared lower-level token is used.

## 18. Mobile and container responsiveness

Responsive state is not width alone. For complex widgets reason about:

`allocated width × selected widget height × interaction/viewport mode`

Widget internals respond to allocated widget width with container queries whenever possible. Use the shell's declared height state as a second design input when vertical detail changes meaningfully. Treat coarse-pointer landscape as a distinct vertical-budget state when appropriate.

A widget-specific mobile fix may not weaken a shared primitive/shell guarantee. Before changing shared widget-system CSS during one-widget work, perform a blast-radius review and prove the change is correct for unrelated consumers.

On phones:

- outer widget is full available row width with visually equal left/right gutters;
- persisted desktop width remains stored;
- deterministic height remains selected;
- no horizontal page overflow;
- title stays full-size and may wrap;
- primary header toggles remain reachable and their labels may wrap to two lines rather than clip;
- touch interaction cannot depend on hover;
- do not reserve invisible scrollbar gutters when the custom scroll rail is hidden;
- preserve symmetric clearance for component shadows/glows instead of clipping them at an interior edge;
- prefer dense 2-column or 3-column control grids over long vertical stacks when labels remain readable;
- prefer 24px compact controls for secondary mobile actions; use 32/38px only when the action hierarchy or touch geometry requires them;
- full-bleed dividers, gradient bands and emphasis panels must reach the same usable edge on both sides;
- important labels and supporting text wrap before they ellipsize; ellipsis is an exception, not the default.

Portrait and landscape must both be verified because they stress width and height differently.

### Mobile content-edge contract

Every widget body must distinguish three geometry zones:

1. **Inset zone** — ordinary cards, forms and reading content.
2. **Full-bleed zone** — dividers, gradient bands, horizontal rails, footer/callout strips and other surfaces intended to touch the usable module edge.
3. **Shadow-safe zone** — controls/cards whose focus glow or shadow must remain visible without creating a one-sided white gutter.

Rules:
- never reserve a hidden scrollbar lane on only one side;
- full-bleed sections include the scroll shadow-clearance allowance, not only the ordinary content inset;
- horizontal rails must be able to reach the usable widget edge and scroll internally without being cropped by their parent;
- focused inputs, textareas and raised controls may not be clipped by an interior wrapper;
- segmented/header toggles derive space from their real item count and allow two-line labels in portrait;
- do not use emoji as widget icons, header actions, status glyphs or navigation affordances; use the canonical Lucide/icon primitive;
- single header destinations use `WidgetHeaderActionButton`, not an ad-hoc button styled to resemble a toggle;
- step-tab column count comes from the number of tab items; do not hard-code three columns for four-tab tools.

## 19. States

Implement deliberate states as applicable:

- loading;
- ready;
- empty;
- disconnected/blocked;
- stale;
- partial/imported;
- error.

Do not erase the recognizable widget UI merely because an account is disconnected. Preserve useful structure and clearly explain what data/action is unavailable.

## 20. Existing-widget migration

Audit first.

Migration order:

`inventory -> screenshot baseline -> identify signature component -> primitive map -> token/color migration -> composition equations -> width/height behavior -> data/actions -> states -> accessibility -> CSS cleanup -> visual verification -> certification`

Never destroy a specialized working component merely for uniformity.

## 21. Planned-widget evaluation

Historical atlases and standalone HTML are design mines, not production authority.

A proposed new widget must have:

- a distinct creator job;
- independent placement/resizing value;
- a recognizable signature component;
- durable input/data/action contract;
- useful minimum/default/maximum compositions;
- meaningful mobile behavior;
- no existing canonical owner that should instead gain a mode/subview.

Do not aim for a specific widget count.

## 22. Certification

A widget is not canonical because registry status says `ready`.

Certification gates:

- IMPLEMENTED
- DATA_CONNECTED
- FUNCTIONAL
- DATA_STATES
- RESPONSIVE
- MOBILE_VERIFIED
- VISUALLY_CERTIFIED
- ACCESSIBLE
- PRODUCTION_VERIFIED
- CANONICAL

Visible changes require evidence under Herald.

## 23. Required visual QA

Verify at least:

- declared minimum width;
- default width;
- maximum width;
- declared minimum height;
- default height;
- maximum height;
- representative mixed width × height states;
- phone portrait;
- phone landscape;
- common desktop allocation.

Inspect:

- complete labels;
- primitive scaling;
- signature-component recognition;
- top/bottom and left/right alignment;
- grid-line continuity;
- gap/stroke consistency;
- split-bay geometry;
- title/header behavior;
- scroll ownership;
- state changes;
- touch/focus/keyboard behavior.

## 24. Reference/recovery discipline

Standalone HTML, historical branches, screenshots and prototypes are evidence and design references only.

Before adopting an idea:

1. identify its source and age;
2. compare to current production owner;
3. extract the useful functional/design idea;
4. rebuild it through current tokens/primitives/data;
5. avoid copying stale black strokes, arbitrary dimensions, or old layout assumptions.

Read `references/futures-prototypes-and-reference-atlas.md`.

## 25. Final acceptance question

Before certification ask:

> **Does this feel like a uniquely designed, immediately understandable, highly useful creator tool — and does it still visibly belong to ViewTube?**

If it looks like a generic template with different text, if its signature component disappears at supported sizes, if its layout is only approximately aligned, or if it reports information without helping the creator act, it is not finished.
