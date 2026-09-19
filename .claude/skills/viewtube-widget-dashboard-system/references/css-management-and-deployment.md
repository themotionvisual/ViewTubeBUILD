# CSS management, verification, and deployment

## CSS ownership

Canonical order:

`tokens -> shell/grid -> primitives -> compound components -> widget-specific functional system -> accessibility`

Historical archetype CSS may exist but is not a required ownership layer for new widget design.

Fix the highest shared owner.

Do not solve a primitive problem with ten widget-local overrides.

Do not solve a one-widget behavior with a global primitive rewrite.

## Cascade discipline

Remove duplicate ownership and brittle utility-chain selectors.

Reduce blanket dashboard specificity.

Prefer repairing ownership over adding `!important`.

Where a compatibility `!important` must temporarily remain, document why and which newer layer should eventually own the rule.

Keep Toolbox/Subtoolbox and Widget styling isolated.

## Geometry CSS

Use:

- CSS Grid/Flex intentionally;
- `minmax(0, 1fr)` where content minimums would break the equation;
- shared CSS variables for linked heights/widths;
- container queries for widget allocation;
- explicit FIT/ADAPT/SCROLL behavior.

Do not use child margins to fake parent grid gaps.

Do not use arbitrary magic numbers to align neighboring regions that should share a variable/equation.

## Optimization

Measure before/after when structural work is substantial:

- CSS output;
- duplicate selectors;
- specificity;
- `!important` count;
- bundle/chunk impact;
- render behavior;
- large-list DOM;
- hidden-widget activity.

Prefer extraction/deletion over parallel abstractions.

## Verification order

1. focused primitive/widget tests;
2. dashboard contract suite;
3. type/build checks;
4. width × height fixtures;
5. desktop screenshots;
6. phone portrait;
7. phone landscape;
8. real dependency/runtime checks.

Herald visible work is not PROVEN without visual evidence.

## Deployment

Preserve rollback/migration paths for:

- stable widget IDs;
- persisted layout sizes;
- renamed modes;
- changed defaults.

Before merging a long-lived branch, compare it to current main. If it is materially behind, port the intended changes onto a fresh current-main branch rather than merging stale history.

Do not claim production complete from a local build, registry `ready` status, or standalone HTML demo.
