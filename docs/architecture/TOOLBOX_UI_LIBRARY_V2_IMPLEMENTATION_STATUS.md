# Toolbox UI Library v2 implementation status

## Implemented on protected branch

- Studio Hub UI Reference Library rebuilt around production `ToolboxScaffold`, `SubToolbox`, Subtoolbox layouts and primitives.
- Main Toolbox token authority added at `src/components/toolbox/tokens.ts`.
- Main Toolbox scoped CSS authority added at `src/styles/toolbox-system.css`.
- Canonical split-left geometry contract added at `src/components/subtoolbox/SplitLeftContract.ts`.
- Scoped split-left CSS recipe added at `src/components/subtoolbox/splitLeft.css`.
- CSS ownership firewall documented.
- UI Reference Library demonstrates shells, action tones, split-left controls, fields, dropdowns, tags, outputs, file target, metrics and states across the 12-color palette.

## Integration gate before main

The branch is currently behind main by one unrelated data-visual commit. Reconcile main before merge. Then import `toolbox-system.css` once immediately before `subtoolbox-system.css`, and import/compose the split-left recipe through the Subtoolbox authority layer. Do not paste these rules into widget CSS.

## Acceptance

- Main Toolbox remains visually larger/heavier than Subtoolbox.
- Standard split-left rail is 56×56; compact is 44×44.
- Split-left label uses the Subtoolbox title typography.
- Colored shadows derive from the active palette/header color.
- Widget geometry cannot override Toolbox/Subtoolbox geometry.
- Studio Hub top-level tools remain `ToolboxScaffold` consumers.
