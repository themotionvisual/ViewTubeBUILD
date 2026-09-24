# Mobile Analytics Controller Acceptance Notes

**Status:** HISTORICAL ACCEPTANCE NOTE / evidence only  
**Current authority:** Analytics / VT-SYNC master + current Data Visual controller/responsive contracts.  
**Wave 4 note (2026-09-24):** preserve this note as evidence of the September 14 branch split. Its pending portal statement is tracked by `MASTER_DATA_OVERLAY_PORTAL_PLAN_2026-09-14.md`; its CSS cleanup wording is not current geometry authority.

This branch intentionally separates the verified CSS composition correction from the pending React transfer-menu portal refactor.

The controller correction is implementation work and can be reviewed independently. The Master Data portal document is a preservation/implementation contract only; it must not be described as complete until `VtSyncToolboxDataTable.tsx` actually renders transfer menus through `createPortal`.

After screenshots pass, remove the superseded mobile controller compatibility rules from `src/styles/perf.css` so there is one geometry authority instead of a specificity override.