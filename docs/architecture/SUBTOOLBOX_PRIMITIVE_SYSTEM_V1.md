# Subtoolbox Primitive System V1

## Purpose

Subtoolboxes use the same ownership model as dashboard widgets: one shell,
one token source, typed primitives, layout recipes, a migration registry, and
automated certification. Feature surfaces own content and behavior, not frame
geometry or interaction styling.

## Authority

- `src/components/subtoolbox/tokens.ts`: geometry, typography, spacing and motion.
- `src/components/Toolbox.tsx`: canonical toolbox and subtoolbox shell behavior.
- `src/components/subtoolbox/SubToolboxPrimitives.tsx`: fields, actions, surfaces and states.
- `src/components/subtoolbox/SubToolboxLayouts.tsx`: stack, grid, action and section composition.
- `src/components/subtoolbox/registry.ts`: supported recipes and migration waves.
- `src/styles/subtoolbox-system.css`: visual states and container responsiveness.

`ToolboxUISystem.tsx` may re-export compatibility APIs, but it must not define a
second geometry contract. `SubToolboxChartModule.tsx` may retain chart-specific
content regions, but its outer shell, colored shadow and collapse seam belong to
the canonical system.

## Accepted hierarchy

| Level | Stroke | Radius | Shadow | Header/control height | Type |
| --- | ---: | ---: | ---: | ---: | ---: |
| Main toolbox | 5px | 16px | 10px | 80px | 26px |
| Subtoolbox desktop | 4px | 12px | 6px | 56px | 20px |
| Subtoolbox compact | 3px | 10px | 4px | 44px | 20px |
| Interior component | 3px | 8px | 4px | 32/48/60px | 10/14/20px |

All shadows derive from the current header/title color. Black shadows are not
part of the subtoolbox contract. Collapse uses a permanent header divider,
one-stroke content overlap, and 300ms ease-out motion with reduced-motion
support.

## Migration waves

1. Foundation, Thumbnail Studio baseline and Community Posts.
2. Video Manager and Video Publisher.
3. Script Architect, Actionable Tactics and Content/Media Analysis.
4. Project Studio, Publishing Architect and Storyboard Studio.
5. Analytics modules, system statistics and remaining consumers.

Each wave replaces raw framed inputs/buttons, local widths, local typography,
local shadows and layout media queries with primitives and container recipes.
Behavior and data-source changes must ship separately.

## Certification gates

- One `CONTROL_SHELL` definition, derived from `SUBTOOLBOX_TOKENS`.
- Permanent divider in open and closed states.
- No solid-black fallback shadow on a subtoolbox shell or interior primitive.
- No local shell stroke, radius, shadow offset, title size or collapse duration.
- Inputs, textareas, selects, buttons, state panels and scroll surfaces use a
  registered primitive.
- Narrow containers stack without horizontal overflow; headers never scroll.
- Default, hover, focus-visible, active, selected, disabled, loading, empty,
  blocked, stale and error states remain accessible.
- Focused tests, governance tests, CSS parsing and production build pass.

## Rollout rule

Merge one migration wave at a time. Do not combine this visual migration with
data-source changes, registry ID changes, or feature removal.
