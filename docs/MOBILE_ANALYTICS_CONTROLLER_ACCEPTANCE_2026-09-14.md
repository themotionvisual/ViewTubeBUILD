# Mobile Analytics Controller Acceptance Notes

This branch intentionally separates the verified CSS composition correction from the pending React transfer-menu portal refactor.

The controller correction is implementation work and can be reviewed independently. The Master Data portal document is a preservation/implementation contract only; it must not be described as complete until `VtSyncToolboxDataTable.tsx` actually renders transfer menus through `createPortal`.

After screenshots pass, remove the superseded mobile controller compatibility rules from `src/styles/perf.css` so there is one geometry authority instead of a specificity override.