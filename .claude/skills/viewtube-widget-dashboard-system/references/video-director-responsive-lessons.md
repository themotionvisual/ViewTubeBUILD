# Video Director responsive lessons — complex-widget case study

This case study records design-system lessons from the 2026-09-19 Video Director mobile audit and corrective implementation.

It is not a template for other widgets. It demonstrates how a highly specialized widget can preserve its unique directing systems while using canonical ViewTube primitives and responsive contracts.

## Source surfaces

- [VideoDirectorWidget.tsx](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgets/video-director/VideoDirectorWidget.tsx)
- [videoDirectorWidget.css](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgets/video-director/videoDirectorWidget.css)
- [VideoDirectorWidgetComponents.tsx](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgets/video-director/VideoDirectorWidgetComponents.tsx)
- [VideoDirectorWidgetMoreComponents.tsx](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/views/dashboard/widgets/video-director/VideoDirectorWidgetMoreComponents.tsx)
- [dualSurface.contract.test.ts](https://github.com/themotionvisual/ViewTubeBUILD/blob/main/src/features/video-director/dualSurface.contract.test.ts)

Corrective implementation PR:
[PR #283](https://github.com/themotionvisual/ViewTubeBUILD/pull/283)

## What was worth preserving

Video Director is a strong example of the unique-widget doctrine because it contains many purpose-built functional visual systems rather than a generic card layout:

- lens/FOV visual;
- mood axes;
- composition/safe-zone view;
- lighting control visual;
- pacing track;
- audio field;
- camera path;
- focus/depth planes;
- texture stack;
- transition bridge;
- music beat view;
- caption preview;
- reference board;
- continuity ledger;
- negative bank;
- concept deck;
- style deck;
- perspective rig;
- palette board;
- grade board;
- shot structure;
- speed curve;
- dialogue lane;
- SFX lane;
- title canvas;
- overlay stack;
- effects stack;
- generation/output frame.

Its Direct / Storyboard / Variations / Generate workflow, scoped editing, Studio handoff, and shared Video DNA state should remain recognizable across sizes.

## Failure 1 — local problem changed global primitive behavior

A compact Video Director pass modified shared primitive/shell CSS to make one widget fit. That caused global regressions such as portrait header extras being hidden.

### Rule

A widget-specific responsive problem may not weaken a shared shell or primitive guarantee.

Before changing shared widget-system code during one-widget work, perform a blast-radius review:

- which other widgets consume this owner?
- which title/header rules change?
- which primitive sizes/types change?
- which state/focus/touch behaviors change?
- which mobile contracts change?
- which tests prove the shared change is correct for unrelated consumers?

Prefer a local composition fix unless the proposed global change is independently correct for the whole system.

## Failure 2 — density was used as a substitute for fitting

Widget-wide compact density forced all 24px controls toward the smallest type even when only some dense rows needed help.

### Rule

**Density and text fitting are different systems.**

- Density changes the overall information/control scale of a region.
- Adaptive text fit preserves a particular control geometry while fitting its complete label.

Do not set a whole complex widget to compact merely because several buttons are long.

Prefer control/group-level adaptive 24px text for dense rows while leaving ordinary fields at their intended scale.

## Failure 3 — clipping was treated as responsive behavior

Broad `overflow:hidden` / `text-overflow:clip` rules made labels appear to fit while removing the beginning/end of words.

### Rule

Interactive labels must remain complete.

When a label does not fit:

1. use the canonical adaptive text-fit mode;
2. use a documented short display label with full accessible label;
3. adjust primitive size/gap;
4. allocate more width;
5. reflow only if necessary.

Never call clipping a successful responsive state.

## Failure 4 — width-only breakpoints changed the mental model

The first mobile implementation stacked two-column form grids, changed 3-column variation layouts, and changed 4-column shot structures based solely on width.

### Rule

Preserve the recognizable composition before reflow.

For complex tools, a narrow allocation should first try:

- canonical smaller primitives;
- adaptive text;
- smaller canonical gaps;
- detail reduction;
- scroll for inherently sequential strips;
- secondary accelerator removal.

Only change columns/rows if the existing composition is genuinely unusable.

## Failure 5 — mobile landscape was not treated as vertically constrained

Aspect-ratio-driven 16:9 signature canvases can become extremely tall when a phone rotates to landscape because their width grows while viewport height shrinks.

### Rule

Responsive state is:

`allocated width × selected widget height × interaction/viewport mode`

For coarse-pointer landscape with low viewport height:

- cap signature/canvas height;
- preserve the same conceptual visual;
- keep persistent navigation/actions compact;
- use the one intentional body scroll region;
- reduce redundant accelerators;
- do not infer vertical budget from width.

A media/signature canvas may preserve its aspect ratio **inside a height budget** rather than deriving height from full available width.

## Failure 6 — redundant navigation/action surfaces consumed mobile space

Video Director exposed a category select plus a 28-button category strip, and repeated generic Open Studio actions in header/body/footer.

### Rule

Perform a duplicate-navigation/action audit for constrained states.

Keep:

- one persistent primary navigation/control;
- optional accelerators where room justifies them;
- contextual actions whose meaning differs.

On constrained states, remove or hide redundant accelerators before shrinking the essential workflow.

A contextual “Edit shots in Studio” action is not the same as a generic duplicate “Open Studio” action.

## Failure 7 — header control semantics were not owned strongly enough

A required header action used styling that could be hidden by generic narrow-header rules.

### Rule

Required header controls are invariants.

The shell/responsive system must know which header extras are persistent.

Portrait behavior:

- title stays canonical size;
- title may wrap to two lines;
- no title ellipsis;
- required header toggle/action remains visible;
- nonessential extras may hide;
- persistent header control may compact its own internal type/padding.

## Failure 8 — responsive CSS accumulated duplicate ownership

Multiple `@container max-width:430px` blocks accumulated across iterative fixes, making it unclear which rule owned portrait behavior.

### Rule

After an iterative responsive fix, consolidate ownership.

For each widget keep one clearly documented responsive section per state/concern wherever practical:

- base composition;
- narrow container;
- height-bucket behavior;
- coarse portrait;
- coarse landscape;
- reduced motion.

Do not leave contradictory old breakpoints in place merely because a later rule overrides them.

## Height bucket as an input

The shell already exposes `data-widget-height`.

Complex widgets should use the declared height state when vertical detail changes meaningfully.

Example:

- `tall` -> compact signature visual;
- `xtall` -> standard signature visual;
- `massive` -> expanded signature visual/context.

Height-state behavior should preserve the same visual concept, not swap in a different widget.

## Signature visual budget rule

For media-like signature systems:

`signatureHeight = min(desiredAspectHeight, currentVerticalBudget)`

Then derive width from height when necessary:

`signatureWidth = min(availableWidth, signatureHeight × aspectRatio)`

This prevents a wide landscape allocation from creating an excessively tall media canvas.

## Sequential-strip rule

Storyboards, shot strips, timelines and other sequence-native systems may preserve horizontal composition with bounded horizontal scrolling instead of collapsing into unrelated row counts.

Use discoverable scroll behavior and snap/alignment where useful.

Do not use horizontal scrolling for essential navigation when there is no alternate discoverable control.

## Visual size versus interaction size

Do not force a 24px visual control to become 44px tall solely because the pointer is coarse if that destroys the composition.

Visual geometry and touch acquisition are separate concerns.

Where needed, provide a larger interaction/hit target through a deliberate interaction-area mechanism without changing the visible primitive dimensions. Avoid overlapping invisible hit areas that steal neighboring actions.

## Certification lessons

Source-string tests are useful contracts, but they cannot prove the visual result.

A complex widget needs rendered evidence at minimum:

- 390×844 portrait;
- approximately 844×390 phone landscape;
- minimum declared desktop width/height;
- default width/height;
- maximum width/height;
- at least one asymmetric width × height state.

Check:

- complete labels;
- title/header controls;
- signature visual height;
- one intentional scroll owner;
- no page-level horizontal overflow;
- no redundant action clutter;
- preserved row/column composition;
- all primary actions reachable;
- no shared regression in unrelated widgets.

## Reusable doctrine distilled

1. Local fixes stay local unless they are truly system-correct.
2. Density is not text fitting.
3. Clipping is not responsiveness.
4. Width alone is not responsive state.
5. Height buckets are real design inputs.
6. Landscape requires a vertical budget.
7. Preserve mental model before reflow.
8. Remove redundant accelerators before essential controls.
9. Required header controls are invariants.
10. Rendered visual evidence is required before certification.
