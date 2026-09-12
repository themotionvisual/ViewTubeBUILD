# Toolbox UI Library v2

Studio Hub reference implementation for the canonical ViewTube UI hierarchy.

## Hierarchy

- Main Toolbox: 80px header, 5px stroke, 16px radius, 10px colored shadow, 26px title.
- Standard Subtoolbox: 56px header, 4px stroke, 12px radius, 6px colored shadow, 20px title.
- Compact Subtoolbox: 44px header, 3px stroke, 10px radius, 4px colored shadow.
- Interior primitives: 3px stroke, 8px radius, 4px colored shadow.

## Rules demonstrated by the Studio Hub UI Library

- Main toolboxes remain visibly larger and heavier than subtoolboxes.
- Split-left module controls use a square icon rail and inherit the ViewTube palette.
- Dropdown controls demonstrate the shared split-left/menu styling rather than generic form styling.
- The 12-color ViewTube spectrum is interactive and shadows derive from the active color at translucent opacity.
- Tags use compact uppercase 8px/900 typography, 2px black stroke, 4px radius, spectrum-derived translucent fills and matching shadows.
- Inputs, buttons, output cards, metrics, upload targets and data-state panels use the production SubToolbox primitive layer.
- The reference library is a consumer of canonical primitives; it should not become a second geometry authority.

## Ownership

`Toolbox.tsx` owns shell behavior. `subtoolbox/tokens.ts` owns subtoolbox geometry. `SubToolboxPrimitives.tsx` and `SubToolboxLayouts.tsx` own nested controls/layouts. `subtoolbox-system.css` owns subtoolbox visual states. The UI Reference Library demonstrates these contracts on Studio Hub.
