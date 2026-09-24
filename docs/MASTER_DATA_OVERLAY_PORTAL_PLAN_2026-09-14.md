# Master Data Overlay Portal Migration — 2026-09-14

**Status:** ACTIVE FOCUSED MIGRATION PLAN  
**Current authority:** `analytics/VIEWTUBE_ANALYTICS_VT_SYNC_MASTER_RESOURCE.md`  
**Last re-audited:** 2026-09-24 against main `e8313cceb2b6ab1fbcff6ff28a9648192f559854`  
**Open gap confirmed:** no production `VtSyncToolboxDataTable.tsx` `createPortal` implementation was found in the Wave 4 audit, so this plan remains open. It is a floating-menu migration only, not a new Analytics data authority.

## Current state

Master Data Import/Export still use native `details` descendants and CSS fixed positioning. This improves visibility but does not guarantee escape from every transformed or clipping ancestor.

## Required implementation

Replace the transfer popover presentation with the same portal architecture already used by `VisualModuleController` dropdowns:

1. Controlled open state: `import | export | null`.
2. Trigger refs for Import and Export.
3. Render the active menu through `createPortal(..., document.body)`.
4. Position from `getBoundingClientRect()` using fixed coordinates and a 4–8px trigger gap.
5. Clamp horizontal position to the viewport.
6. Flip above the trigger when there is insufficient room below.
7. Bound menu height to the available viewport and make only the menu body scroll.
8. Close on outside pointer interaction, Escape, navigation, and when the opposite menu opens.
9. Recompute position on resize and scroll.
10. Preserve all existing import/export actions and file-input behavior.

## Dataset subset menus

The dataset menu should use the same floating-layer contract after transfer menus are migrated. Its current rounded shell and gap remain the visual specification.

## Acceptance criteria

- No open menu is clipped by the Master Data table, pinned viewport, toolbar, or module shell.
- Open menu retains complete top and bottom corner radius.
- A visible gap separates trigger and menu.
- Menu remains usable in portrait and landscape phone orientations.
- Keyboard Escape and outside click close reliably.
- Only one floating Master Data menu is open at a time.