# Standardize Canonical Neo-Brutalist UI System

The application currently has disjointed styling where the primary React application (`Toolbox.tsx` and `sourceModules.tsx`) uses diluted or incorrect styling compared to the canonical, authentic Neo-Brutalist UI found in your `ToolboxUISystem.tsx` mockup / iFrame sources.

This causes the "light blue shadow" bleeding effect, thin borders, and an overall lack of the punchy contrast seen in the "good" screenshots.

## User Review Required
Please review the proposed stylistic changes below to guarantee they match your design expectations before we execute them.

## Proposed Changes

### `src/components/Toolbox.tsx`
The primary layout file is using a 50% alpha transparency for shadows in accordion structures, which causes the "light blue shadow" you noticed.
- **[MODIFY]** Remove the `0.5` opacity wrapper in `hexToRgba(headerHex, 0.5)` for `accentShadowStyle`. We will enforce standard, fully opaque shadows (e.g., solid black or solid `headerHex`).
- **[MODIFY]** Update borders and shadows on the main flex containers to exactly perfectly match the structural thickness found in `ToolboxUISystem.tsx` (e.g., switching standard structural borders to the proper `border-[4px]` or `border-[5px]` canonical definitions).

### `src/views/referenceStudio/sourceModules.tsx`
This file is manually overriding the inner module boxes with thinner, lighter styles, creating the weak UI seen in your first two screenshots.
- **[MODIFY]** Update the `CARD` constant from `border-[3px] border-black rounded-xl` to the canonical `border-[4px] border-black rounded-[16px]` format.
- **[MODIFY]** Remove the `toneLightBySource[source]` shadow overrides which create the faint pastel shadows, or update them to be punchy, solid `rgba(..., 1)` dropshadows matching the true Neo-Brutalist style.

## Open Questions

1. **Shadow Colors:** For the main Toolboxes and Accordions, do you want the drop shadows to be strictly **Solid Black** (e.g., `shadow-[8px_8px_0px_0px_black]`), or should they be **Solid Bold Colors** (matching the header's background color but with 100% opacity instead of 50%)?
2. **Inner Module Shadows:** For the cards inside `sourceModules.tsx`, should they use black shadows or the corresponding bright colored shadows?

## Verification Plan
1. Launch `npm run dev` and navigate to the UI/Toolbox inventory.
2. Confirm the exact pixel match (border thickness, radii, shadow intensity) against the `ustube-ui-kit-3.html` iframe preview.
