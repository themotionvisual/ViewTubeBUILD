# Implementation Plan: Pure Modular Grid Rewrite (Toolbox UI)

To resolve all fraction/padding alignment bugs, we will implement a strict **Modular Grid Engine** for the `ToolboxUISystem.tsx`. Instead of using standard DOM size-calculation which gets corrupted by nested borders and flex-remainders, we will mathematically enforce the height of every block.

## User Review Required

> [!WARNING]
> This will rewrite the structural logic of the Toolboxes to enforce a mathematical "lock". 
> **The Core Formula**:
> - `1 Unit` = **60px**
> - `Gap` = **24px**
> - Every element will be exactly `(N Units * 60) + ((N-1) * 24)` pixels tall.
> - The canvas will no longer rely on CSS `flex-1` to stretch—it will mathematically derive its height based on the left-column `openUnits`.

## Proposed Changes

### [Toolbox UI System]

#### [MODIFY] [ToolboxUISystem.tsx](file:///Users/cwb/Downloads/viewtube/src/components/ToolboxUISystem.tsx)

1.  **Enforce Strict CSS Box Model**:
    *   Currently, the 4px borders were being calculated differently by flexbox containers.
    *   We will explicitly apply `h-[60px]` to closed `SubToolbox` containers and manually set `height` on open containers.
    *   We will remove the `auto` height expansions that were generating subpixel or 4px offset discrepancies.
2.  **Unify Component Properties**:
    *   `DropdownControl` and `GenerateButton` will use identical `border-box` sizing mechanisms to the `SubToolbox` header.
    *   All interactive elements will use a strict inner `52px` container wrapped by a `4px` border wrapper, creating an impenetrable `60px` unit.
3.  **Canvas Standby Sync**:
    *   We will remove `flex-1` from the Canvas Standby.
    *   Instead, Canvas Standby will determine its exact `y-units` height dynamically to fill the grid.
    *   Example: If Left Column = `N` units, and Right Column bottom = `2` units `(Dropdown, Button)`, then Canvas = `N - 2` units. It will perfectly flush with the bottom row of the left column grid.
4.  **Update `DropdownControl` Design**:
    *   Ensure exact 1:1 properties (border radius, font sizes, stroke weights) inside the `DropdownControl` to match the closed `SubToolbox` state, solving the visual mismatch in the screenshot.

## Verification Plan

### Automated Tests
- None. Mathematical layout check.

### Manual Verification
- Expand/Collapse ANY subtoolbox. The grid will snap exactly, and the bottom bounding boxes of the Left Column (Palette/Images) will align *precisely* to the exact pixel line of the Right Column (Canvas/Dropdown), no matter what configuration is open.
